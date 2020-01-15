import { Component, OnInit } from '@angular/core';
//import { FormGroup, FormControl, EmailValidator} from '@angular/forms';
//import { FormGroup, FormControl, FormBuilder} from '@angular/forms';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, FormControl } from '@angular/forms';
import { EmailValidator } from '@angular/forms';
import { CustomValidators } from '../shared/custom.validators';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from './employee.service';
import { IEmployee } from "./IEmployee";
import { ISkill } from './ISkill';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  employee: IEmployee; //reactiveforms put example first step
  // This object contains all the validation messages for this form
  pageTitle: string;
  validationMessages = {
    'fullName': {
      'required': 'Full Name is required.',
      'minlength': 'Full Name must be greater than 2 characters.',
      'maxlength': 'Full Name must be less than 10 characters.'
    },
    'email': {
      'required': 'Email is required.',
      'emailDomain': 'Email domain shuld be bilgin.com'
    },
    'confirmEmail': {
      'required': 'Confirm email is required.',
    },
    'emailGroup': {
      'emailNotMatch': 'Email and Confirm Email are not Match.'
    },
    'phone': {
      'required': 'Phone is required.',
    },
    // 'skillName': {
    //   'required': 'Skill Name is required.',
    // },
    // 'experienceInYears': {
    //   'required': 'Experience is required.', //ngClass daki değişikliğe binaen
    // },
    // 'proficiency': {
    //   'required': 'Proficiency is required.',
    // },
  };
  // This object will hold the messages to be displayed to the user Notice, each key in this object has the same name as the corresponding form control
  formErrors = {
    // 'fullName': '',
    // 'email': '',
    // 'confirmEmail': '',
    // 'emailGroup': '',  //ngClass daki değişikliğe binaen
    // 'phone': '',
    // 'skillName': '',
    // 'experienceInYears': '',
    // 'proficiency': ''
  };
  // fullNameLength = 0;
  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private _employeeSRV2: EmployeeService,
    private router: Router) { }

  ngOnInit() {
    this.employeeForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      contactPreference: ['email'],
      emailGroup: this.fb.group({
        email: ['', [Validators.required, CustomValidators.emailDomain('bilgin.com')]],
        confirmEmail: ['', Validators.required],
      }, { validators: CustomValidators.matchEmail }),
      phone: [''],
      skills: this.fb.array([
        this.addSkillFormGroup()
      ])
    });

    //observable so evey time
    //html deki error mesajlarını burada göstermek (has-error class will be absorbed)
    this.employeeForm.valueChanges.subscribe((data) => {
      this.logValidationErrors(this.employeeForm);
    })
    this.employeeForm.get('contactPreference').valueChanges.subscribe((data: string) => {
      this.onContactPreferenceChange(data);
    });
    this.route.paramMap.subscribe(params => {
      const empId = + params.get('id');
      if (empId) {
        this.pageTitle='Edit Employee';//dinamically createed page title
        this.getEmployee(empId);
      } else {//create a employee that put own database (first step)
        this.pageTitle='Create Employee';
        this.employee = {
          id: null,
          fullName: '',
          contactPreference: '',
          email: '',
          phone: null,
          skills: []
        }
      }
    })
  }
  getEmployee(id: number) {
    this._employeeSRV2.getEmployee(id).subscribe(
      (employee: IEmployee) => {
        this.editEmployee(employee),
          this.employee = employee;
        (err: any) => console.log(err)
      });
  }
  editEmployee(employee: IEmployee) {
    this.employeeForm.patchValue({
      fullName: employee.fullName,
      contactPreference: employee.contactPreference,
      emailGroup: {
        email: employee.email,
        confirmEmail: employee.email
      },
      phone: employee.phone
    });
    this.employeeForm.setControl('skills', this.setExistingSkills(employee.skills));
  }
  setExistingSkills(skillSets: ISkill[]): FormArray {
    const formArray = new FormArray([]);
    skillSets.forEach(s => {
      formArray.push(this.fb.group({
        skillName: s.skillName,
        experienceInYears: s.experienceInYears,
        proficiency: s.proficiency
      }));
    });

    return formArray;
  }

  addSkillFormGroup(): FormGroup {
    return this.fb.group({
      skillName: ['', Validators.required],
      experienceInYears: ['', Validators.required],
      proficiency: ['', Validators.required]
    })
  }
  onContactPreferenceChange(selectedValue: string) {
    const phoneFormControl = this.employeeForm.get('phone');
    if (selectedValue === 'phone') {
      phoneFormControl.setValidators(Validators.required);
    } else {
      phoneFormControl.clearValidators();
    }
    phoneFormControl.updateValueAndValidity();
  }
  //1nasted form grup control
  logValidationErrors(group: FormGroup = this.employeeForm): void {
    //   console.log(Object.keys(group.controls));
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      this.formErrors[key] = '';  //hataların tekrarlanmasını engeller key i sıfırlar ard arda eklenmesini engeller
      if (abstractControl && !abstractControl.valid && abstractControl.dirty || abstractControl.touched || abstractControl.value !== '') {
        const messages = this.validationMessages[key];
        // console.log(messages);
        // console.log(abstractControl.errors);
        for (const errorKey in abstractControl.errors) {
          if (errorKey) {
            this.formErrors[key] += messages[errorKey] + '';
          }
        }
      }
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      }
      // abstractControl.disable(); //bütün forma yüklenen verileri değiştirmeye kapatır
      //  console.log ('Key =' + key + 'Value =' + abstractControl.value);// grubun içindeki nasted formları döner

      // if (abstractControl instanceof FormArray) {
      //   for(const control of abstractControl.controls){
      //     if (control instanceof FormGroup){
      //       this.logValidationErrors(control);  //ngClass daki değişikliğe binaen
      //     }
      //   }
      // }

    });
  }
  addSkillButtonClick(): void {
    (<FormArray>this.employeeForm.get('skills')).push(this.addSkillFormGroup());
  }
  removeSkillButtonClick(skillGroupIndex: number): void {
    const skillFormArray = <FormArray>this.employeeForm.get('skills');
    skillFormArray.removeAt(skillGroupIndex);
    skillFormArray.markAsDirty;
    skillFormArray.markAsUntouched;
  }
  onLoadDataClick(): void {

    const formArray1 = this.fb.array([   //using the array() method of the FOrmBuilder class
      new FormControl('Ahmet', Validators.required),
      new FormControl('IT', Validators.required),
      new FormControl('Eerkek', Validators.required),
    ])
    const formGroupasArray = this.fb.group([   //using the form group control of the FOrmBuilder class
      new FormControl('Ahmet', Validators.required), //forgroup as an array made the structure of tree
      new FormControl('IT', Validators.required), //this is an object with key value pairs key is the name of the formcontrol and value is the instance of the form control
      new FormControl('Eerkek', Validators.required),
    ])
    // formArray1.push(new FormControl('MNB', Validators.required));
    // console.log(formArray1.at(3).value);

    // console.log(formArray1);
    // console.log(formGroupasArray);

    console.log(formArray1.value);
    console.log(formGroupasArray.value);
    // console.log(formArray1.valid);
    // console.log(formArray1.invalid);
    // console.log(formArray1.touched);
    // console.log(formArray1.pristine);

    // const formArray = new FormArray([
    //   new FormControl('Ahmet', Validators.required),
    //   new FormGroup({
    //     country: new FormControl('', Validators.required)
    //   }),
    //   new FormArray([])
    // ])


    // console.log(formArray.length);
    // for (const control of formArray.controls){
    //   if (control instanceof FormControl){
    //     console.log('Control is that FormControl')
    //   }
    //   if (control instanceof FormGroup){
    //     console.log('Control is that FormGroup')
    //   }
    //   if (control instanceof FormArray){
    //     console.log('Control is that FormArray')
    //   }
    // }


    // this.logValidationErrors(this.employeeForm);
    // console.log(this.formErrors);

    // 2nasted form grup control
    // this.employeeForm.patchValue({
    //   fullName:'aht',
    //   email:'aht@',
    //   skills:{
    //     skillName:'java',
    //     experienceInYears:2,
    //     proficiency:'beginner'
    //   }
    // });
  }
  //formdaki değişimleri terminal ekranında izlenebilmesini sağlıyor
  /* this.employeeForm.valueChanges.subscribe((value: any) =>{console.log (JSON.stringify(value));
  }); */
  /* this.employeeForm.get('fullName').valueChanges.subscribe((value: String) =>{console.log(value);
    this.fullNameLength = value.length;
  }); */
  //nasted form grup ilk versiyon
  /*this.employeeForm = new FormGroup({
    fullName: new FormControl(),
    email: new FormControl(),
    skills: new FormGroup({
      skillName: new FormControl(),
      experienceInYears: new FormControl(),
      proficiency: new FormControl()
    })
  });
  */

  onSubmit(): void {
    console.log(this.employeeForm.value);
    console.log(this.employeeForm.touched);
    console.log(this.employeeForm.dirty);
    // console.log(this.employeeForm.controls.fullName.touched);
    // console.log(this.employeeForm.get('fullname').value);

    this.mapFormValuesEmployeeModel();
    if (this.employee.id) {
      this._employeeSRV2.updateEmployee(this.employee).subscribe(
        () => this.router.navigate(['list']),
        (err) => console.log(err)
      );
    } else {
      this._employeeSRV2.addEmployee(this.employee).subscribe(
        () => this.router.navigate(['list']),
        (err) => console.log(err)
      );
    }
  }
  mapFormValuesEmployeeModel() {
    this.employee.fullName = this.employeeForm.value.fullName;
    this.employee.contactPreference = this.employeeForm.value.contactPreference;
    this.employee.email = this.employeeForm.value.emailGroup.email;
    this.employee.phone = this.employeeForm.value.phone;
    this.employee.skills = this.employeeForm.value.skills;
  }
}
// costum validator is using by emailvalidator function before import emailValidators from angular form. next step create a folder that import create-employee.component.ts named custom.validator.ts, so we have always reusable static function
// function emailDomain(domainName: string) {
//   return (control: AbstractControl): { [key: string]: any } | null => {
//     const email: string = control.value;
//     const domain = email.substring(email.lastIndexOf('@') + 1);
//     if (email === '' || domain.toLowerCase() === domainName.toLowerCase()) {
//       return null;
//     } else {
//       return { 'emailDomain': true };
//     }
//   };
// }

//custom validator which is confirm email control method
// function matchEmail(group: AbstractControl): { [key: string]: any } | null {
//   const emailControl = group.get('email');
//   const confirmEmailControl = group.get('confirmEmail');

//   if (emailControl.value === confirmEmailControl.value || confirmEmailControl.pristine) {
//     return null;
//   } else {
//     return { 'emailNotMatch': true };
//   }
// } 