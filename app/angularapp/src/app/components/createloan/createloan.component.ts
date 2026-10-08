import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loan } from '../../models/loan.model';
import { LoanService } from '../../services/loan.service';
import { noWhitespaceValidator } from '../../validators/form.validators';
import { AdminNavComponent } from '../adminnav/adminnav.component';

@Component({
  selector: 'app-createloan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminNavComponent],
  templateUrl: './createloan.component.html',
  styleUrls: ['./createloan.component.css']
})
export class CreateLoanComponent {
  private readonly fb = inject(FormBuilder);
  submitted = false;
  loading = false;
  success = false;
  serverError = '';

  readonly fields = [
    { key: 'LoanType', label: 'Loan Type', type: 'text', placeholder: 'Loan Type', maxLength: 100 },
    { key: 'Description', label: 'Description', type: 'text', placeholder: 'Loan Description', maxLength: 500 },
    { key: 'InterestRate', label: 'Interest Rate', type: 'number', placeholder: 'Interest Rate', maxLength: null },
    { key: 'MaximumAmount', label: 'Maximum Amount', type: 'number', placeholder: 'Maximum Amount', maxLength: null },
    { key: 'RepaymentTenure', label: 'Repayment Tenure', type: 'number', placeholder: 'Repayment Tenure (Months)', maxLength: null },
    { key: 'Eligibility', label: 'Eligibility', type: 'text', placeholder: 'Eligibility Criteria', maxLength: 500 },
    { key: 'DocumentsRequired', label: 'Documents Required', type: 'text', placeholder: 'Documents Required', maxLength: 500 }
  ] as const;

  readonly form = this.fb.group({
    LoanType: ['', [Validators.required, noWhitespaceValidator, Validators.maxLength(100)]],
    Description: ['', [Validators.required, noWhitespaceValidator, Validators.maxLength(500)]],
    InterestRate: [null as number | null, [Validators.required, Validators.min(0.01)]],
    MaximumAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    RepaymentTenure: [null as number | null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
    Eligibility: ['', [Validators.required, noWhitespaceValidator, Validators.maxLength(500)]],
    DocumentsRequired: ['', [Validators.required, noWhitespaceValidator, Validators.maxLength(500)]]
  });

  constructor(private readonly loanService: LoanService) {}

  invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted);
  }

  hasMissingFields(): boolean {
    return this.form.controls.LoanType.hasError('required') || this.form.controls.LoanType.hasError('whitespace')
      || this.form.controls.Description.hasError('required') || this.form.controls.Description.hasError('whitespace')
      || this.form.controls.InterestRate.hasError('required')
      || this.form.controls.MaximumAmount.hasError('required')
      || this.form.controls.RepaymentTenure.hasError('required')
      || this.form.controls.Eligibility.hasError('required') || this.form.controls.Eligibility.hasError('whitespace')
      || this.form.controls.DocumentsRequired.hasError('required') || this.form.controls.DocumentsRequired.hasError('whitespace');
  }

  errorMessage(name: keyof typeof this.form.controls, label: string): string {
    const errors = this.form.controls[name].errors;
    if (!errors) return '';
    if (errors['required'] || errors['whitespace']) return `${label} is required`;
    if (errors['min']) return `${label} must be greater than 0`;
    if (errors['pattern']) return `${label} must be a whole number`;
    if (errors['maxlength']) return `${label} is too long`;
    return `${label} is invalid`;
  }

  submit(): void {
    this.submitted = true;
    this.serverError = '';
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    const v = this.form.getRawValue();
    const loan: Loan = {
      LoanType: v.LoanType!.trim(),
      Description: v.Description!.trim(),
      InterestRate: Number(v.InterestRate),
      MaximumAmount: Number(v.MaximumAmount),
      RepaymentTenure: Number(v.RepaymentTenure),
      Eligibility: v.Eligibility!.trim(),
      DocumentsRequired: v.DocumentsRequired!.trim()
    };

    this.loanService.addLoan(loan).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: err => {
        this.loading = false;
        this.serverError = err?.error?.message ?? err?.error?.title ?? 'Failed to add loan.';
      }
    });
  }

  closeSuccess(): void {
    this.success = false;
    this.submitted = false;
    this.form.reset();
  }
}
