import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { noWhitespaceValidator, strictEmailValidator } from '../../validators/form.validators';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  submitted = false;
  loading = false;
  serverError = '';

  private readonly passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    username: ['', [Validators.required, noWhitespaceValidator, Validators.maxLength(30)]],
    email: ['', [Validators.required, strictEmailValidator, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(this.passwordPattern)]],
    confirmPassword: ['', Validators.required],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    userRole: ['', Validators.required]
  }, { validators: this.passwordsMatch });

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  submit(): void {
    this.submitted = true;
    this.serverError = '';
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading) return;

    const value = this.form.getRawValue();
    const user = new User();
    user.Username = (value.username ?? '').trim();
    user.Email = (value.email ?? '').trim();
    user.Password = value.password ?? '';
    user.MobileNumber = (value.mobileNumber ?? '').trim();
    user.UserRole = value.userRole ?? '';

    this.loading = true;
    this.auth.register(user).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: err => {
        this.loading = false;
        this.serverError = this.extractError(err, 'Registration failed. Please try again.');
      }
    });
  }

  show(controlName: 'username' | 'email' | 'password' | 'confirmPassword' | 'mobileNumber' | 'userRole', errorName: string): boolean {
    const control = this.form.controls[controlName];
    return !!control.errors?.[errorName] && (control.touched || this.submitted);
  }

  private passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
  }

  private extractError(err: any, fallback: string): string {
    return err?.error?.message
      ?? err?.error?.title
      ?? (typeof err?.error === 'string' ? err.error : null)
      ?? fallback;
  }
}

