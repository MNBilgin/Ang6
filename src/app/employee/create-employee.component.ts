import { Component, OnInit } from '@angular/core';
//import { FormGroup, FormControl, EmailValidator} from '@angular/forms';
//import { FormGroup, FormControl, FormBuilder} from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EmailValidator} from '@angular/forms';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  fullNameLength = 0;
  constructor(private fb :FormBuilder) { }

  ngOnInit() {
    this.employeeForm= this.fb.group({
      //fullName:[''],
      fullName:['',[Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      email:[''],
      skills: this.fb.group({
        skillName:[''],
        experienceInYears:[''],
        proficiency:['beginner']
      })
    });
    this.employeeForm.valueChanges.subscribe((value: any) =>{console.log (JSON.stringify(value));
    });
    /* this.employeeForm.get('fullName').valueChanges.subscribe((value: String) =>{console.log(value);
      this.fullNameLength = value.length;
    }); */
    /*this.employeeForm = new FormGroup({
      fullName: new FormControl(),
      email: new FormControl(),
      skills: new FormGroup({
        skillName: new FormControl(),
        experienceInYears: new FormControl(),
        proficiency: new FormControl()
      })
    });*/
  }

  onLoadDataClick(): void{
    this.employeeForm.setValue({
      fullName:'aht',
      email:'aht@',
      skills:{
        skillName:'java',
        experienceInYears:2,
        proficiency:'beginner'
      }
    });
  }
  onSubmit(): void{
    console.log(this.employeeForm.value);
    //console.log(this.employeeForm.touched);
    //console.log(this.employeeForm.dirty);
    //console.log(this.employeeForm.controls.fullName.touched);
    //console.log(this.employeeForm.get('fullname').value);
  }
}