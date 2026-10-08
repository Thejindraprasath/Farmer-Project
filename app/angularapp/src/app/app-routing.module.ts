import { RouterModule, Routes } from '@angular/router';
import { AdminEditLoanComponent } from './components/admineditloan/admineditloan.component';
import { AdminViewFeedbackComponent } from './components/adminviewfeedback/adminviewfeedback.component';
import { adminGuard, authGuard, userGuard } from './components/authguard/auth.guard';
import { CreateLoanComponent } from './components/createloan/createloan.component';
import { ErrorComponent } from './components/error/error.component';
import { HomeComponent } from './components/home/home.component';
import { LoanFormComponent } from './components/loanform/loanform.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { RequestedLoanComponent } from './components/requestedloan/requestedloan.component';
import { UserAddFeedbackComponent } from './components/useraddfeedback/useraddfeedback.component';
import { UserAppliedLoanComponent } from './components/userappliedloan/userappliedloan.component';
import { UserViewFeedbackComponent } from './components/userviewfeedback/userviewfeedback.component';
import { UserViewLoanComponent } from './components/userviewloan/userviewloan.component';
import { ViewLoanComponent } from './components/viewloan/viewloan.component';
import { NgModule } from '@angular/core';
 
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'admin/loan/create', component: CreateLoanComponent, canActivate: [adminGuard] },
  { path: 'admin/loan/view', component: ViewLoanComponent, canActivate: [adminGuard] },
  { path: 'admin/loan/edit/:id', component: AdminEditLoanComponent, canActivate: [adminGuard] },
  { path: 'admin/loan-requested', component: RequestedLoanComponent, canActivate: [adminGuard] },
  { path: 'admin/feedbacks', component: AdminViewFeedbackComponent, canActivate: [adminGuard] },
  { path: 'user/loans', component: UserViewLoanComponent, canActivate: [userGuard] },
  { path: 'user/loan/apply/:loanId', component: LoanFormComponent, canActivate: [userGuard] },
  { path: 'user/applied-loans', component: UserAppliedLoanComponent, canActivate: [userGuard] },
  { path: 'user/feedback/add', component: UserAddFeedbackComponent, canActivate: [userGuard] },
  { path: 'user/feedback/view', component: UserViewFeedbackComponent, canActivate: [userGuard] },
  { path: 'error', component: ErrorComponent },
  { path: 'error/:code', component: ErrorComponent },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'error/404' }
];
 
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}