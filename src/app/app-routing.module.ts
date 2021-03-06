import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateEmployeeComponent } from './employee/create-employee.component';
import { ListEmployeeComponent } from './employee/list-employee.component';
import { HomeComponent } from './home.component';
import { PageNotFoundComponent } from './page-not-found.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'list', component: ListEmployeeComponent },
  { path: 'create', component: CreateEmployeeComponent },
  { path: 'edit/:id', component: CreateEmployeeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
