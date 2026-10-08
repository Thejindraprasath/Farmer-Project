import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Loan } from '../../models/loan.model';
import { LoanService } from '../../services/loan.service';
import { noWhitespaceValidator } from '../../validators/form.validators';
import { AdminNavComponent } from '../adminnav/adminnav.component';

@Component({
  selector: 'app-admineditloan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminNavComponent],
  templateUrl: './admineditloan.component.html',
  styleUrls: ['./admineditloan.component.css']
})
export class AdminEditLoanComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  loanId = 0;
  submitted = false;
  success = false;
  loading = false;
  serverError = '';

  readonly fields = [
    { key: 'LoanType', label: 'Loan Type', type: 'text', maxLength: 100 },
    { key: 'Description', label: 'Description', type: 'text', maxLength: 500 },
    { key: 'InterestRate', label: 'Interest Rate', type: 'number', maxLength: null },
    { key: 'MaximumAmount', label: 'Maximum Amount', type: 'number', maxLength: null },
    { key: 'RepaymentTenure', label: 'Repayment Tenure', type: 'number', maxLength: null },
    { key: 'Eligibility', label: 'Eligibility', type: 'text', maxLength: 500 },
    { key: 'DocumentsRequired', label: 'Documents Required', type: 'text', maxLength: 500 }
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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly loanService: LoanService
  ) {}

  ngOnInit(): void {
    this.loanId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(this.loanId) || this.loanId <= 0) {
      this.serverError = 'Invalid loan id';
      return;
    }

    this.loanService.getLoanById(this.loanId).subscribe({
      next: loan => this.form.patchValue(loan),
      error: err => this.serverError = err?.error?.message ?? 'Cannot find any loan'
    });
  }

  invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted);
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
    if (this.form.invalid || this.loading || this.loanId <= 0) return;

    const v = this.form.getRawValue();
    const loan: Loan = {
      LoanId: this.loanId,
      LoanType: v.LoanType!.trim(),
      Description: v.Description!.trim(),
      InterestRate: Number(v.InterestRate),
      MaximumAmount: Number(v.MaximumAmount),
      RepaymentTenure: Number(v.RepaymentTenure),
      Eligibility: v.Eligibility!.trim(),
      DocumentsRequired: v.DocumentsRequired!.trim()
    };

    this.loading = true;
    this.loanService.updateLoan(this.loanId, loan).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: err => {
        this.loading = false;
        this.serverError = err?.error?.message ?? 'Update failed';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/loan/view']);
  }

  finish(): void {
    this.success = false;
    this.goBack();
  }
}
