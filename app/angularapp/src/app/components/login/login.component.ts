import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Login } from '../../models/login.model';
import { AuthService } from '../../services/auth.service';
import { strictEmailValidator } from '../../validators/form.validators';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  submitted = false;
  loading = false;
  serverError = '';
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    email: ['', [Validators.required, strictEmailValidator]],
    password: ['', Validators.required]
  });

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  submit(): void {
    this.submitted = true;
    this.serverError = '';
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading) return;

    const login = new Login();
    login.Email = (this.form.value.email ?? '').trim();
    login.Password = this.form.value.password ?? '';

    this.loading = true;
    this.auth.login(login).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: err => {
        this.loading = false;
        this.serverError = err?.error?.message ?? err?.error?.title ?? 'Login failed. Please try again.';
      }
    });
  }

  show(controlName: 'email' | 'password', errorName: string): boolean {
    const control = this.form.controls[controlName];
    return !!control.errors?.[errorName] && (control.touched || this.submitted);
  }
}