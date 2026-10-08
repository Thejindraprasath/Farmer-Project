import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanApplication } from '../../models/loanapplication.model';
import { AuthService } from '../../services/auth.service';
import { LoanService } from '../../services/loan.service';
import { noWhitespaceValidator } from '../../validators/form.validators';
import { UserNavComponent } from '../usernav/usernav.component';

@Component({
  selector: 'app-loanform',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserNavComponent],
  templateUrl: './loanform.component.html',
  styleUrls: ['./loanform.component.css']
})
export class LoanFormComponent implements OnInit {
  loanId = 0;
  submitted = false;
  loading = false;
  fileData = '';
  fileName = '';
  fileError = '';
  success = false;
  error = '';
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly auth: AuthService,
    private readonly loanService: LoanService
  ) {
    this.form = this.fb.group({
      FarmLocation: ['', [Validators.required, noWhitespaceValidator, Validators.maxLength(200)]],
      FarmerAddress: ['', [Validators.required, noWhitespaceValidator, Validators.maxLength(500)]],
      FarmSizeInAcres: [null as number | null, [Validators.required, Validators.min(0.01)]],
      FarmPurpose: ['', [Validators.required, noWhitespaceValidator, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loanId = Number(this.route.snapshot.paramMap.get('loanId'));
    if (!Number.isInteger(this.loanId) || this.loanId <= 0) {
      this.router.navigate(['/user/loans']);
    }
  }

  invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  fieldMessage(name: string, label: string): string {
    const errors = this.form.get(name)?.errors;
    if (!errors) return '';
    if (errors['required'] || errors['whitespace']) return `*${label} is required`;
    if (errors['min']) return `*${label} must be greater than 0`;
    if (errors['maxlength']) return `*${label} is too long`;
    return `*${label} is invalid`;
  }

  fileChanged(event: Event): void {
    this.fileError = '';
    this.fileData = '';
    this.fileName = '';

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isImage && !isPdf) {
      this.fileError = 'Proof must be an image or PDF file';
      input.value = '';
      return;
    }

    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.fileData = String(reader.result ?? '');
      if (!this.fileData) this.fileError = 'Unable to read the selected proof file';
    };
    reader.onerror = () => {
      this.fileError = 'Unable to read the selected proof file';
      this.fileData = '';
    };
    reader.readAsDataURL(file);
  }

  submit(): void {
    this.submitted = true;
    this.error = '';
    this.form.markAllAsTouched();

    if (!this.fileData && !this.fileError) this.fileError = 'Proof is required';
    if (this.form.invalid || !this.fileData || this.fileError || this.loading) return;

    const userId = this.auth.getUserId();
    if (userId == null) {
      this.router.navigate(['/login']);
      return;
    }

    const v = this.form.getRawValue();
    const payload: LoanApplication = {
      UserId: userId,
      LoanId: this.loanId,
      SubmissionDate: new Date().toISOString(),
      LoanStatus: 0,
      FarmLocation: String(v.FarmLocation ?? '').trim(),
      FarmerAddress: String(v.FarmerAddress ?? '').trim(),
      FarmSizeInAcres: Number(v.FarmSizeInAcres),
      FarmPurpose: String(v.FarmPurpose ?? '').trim(),
      File: this.fileData
    };

    this.loading = true;
    this.loanService.addLoanApplication(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: err => {
        this.loading = false;
        this.error = err?.error?.message ?? err?.error?.title ?? 'Unable to submit loan application.';
      }
    });
  }

  back(): void {
    this.router.navigate(['/user/loans']);
  }

  finish(): void {
    this.success = false;
    this.router.navigate(['/user/loans']);
  }
}
