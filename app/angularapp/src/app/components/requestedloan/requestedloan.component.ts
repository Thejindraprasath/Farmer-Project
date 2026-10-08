import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LoanApplication } from '../../models/loanapplication.model';
import { LoanService } from '../../services/loan.service';
import { AdminNavComponent } from '../adminnav/adminnav.component';

@Component({
  selector: 'app-requestedloan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminNavComponent
  ],
  templateUrl: './requestedloan.component.html',
  styleUrls: ['./requestedloan.component.css']
})
export class RequestedLoanComponent implements OnInit {

  applications: LoanApplication[] = [];
  search = '';
  statusFilter = 'all';
  selected: LoanApplication | null = null;
  error = '';

  constructor(private readonly loanService: LoanService) { }

  ngOnInit(): void {
    this.load();
  }

  get filtered(): LoanApplication[] {
    const q = this.search.trim().toLowerCase();

    return this.applications.filter(x =>
      (!q || (x.Loan?.LoanType || '').toLowerCase().includes(q)) &&
      (this.statusFilter === 'all' ||
        String(x.LoanStatus) === this.statusFilter)
    );
  }

  load(): void {
    this.loanService.getAllLoanApplications().subscribe({
      next: (v) => this.applications = v,
      error: (e) =>
        this.error = e?.error?.message ?? 'Unable to load loan requests.'
    });
  }

  statusText(status: number): string {
    return status === 1
      ? 'Approved'
      : status === 2
      ? 'Rejected'
      : 'Pending';
  }

  setStatus(item: LoanApplication, status: number): void {

    if (item.LoanApplicationId == null) {
      return;
    }
  
    const payload: LoanApplication = {
      LoanApplicationId: item.LoanApplicationId,
      UserId: item.UserId,
      LoanId: item.LoanId,
      SubmissionDate: item.SubmissionDate,
      LoanStatus: status,
      FarmLocation: item.FarmLocation,
      FarmerAddress: item.FarmerAddress,
      FarmSizeInAcres: item.FarmSizeInAcres,
      FarmPurpose: item.FarmPurpose,
      File: item.File,
      AnnualIncome: item.AnnualIncome
    };
  
    this.loanService.updateLoanStatus(
      item.LoanApplicationId,
      payload
    ).subscribe({
      next: () => {
        item.LoanStatus = status;
        this.error = '';
      },
      error: (e) => {
        console.log(e.error);
        this.error = e?.error?.message ?? 'Unable to update status.';
      }
    });
  }
  

  isImage(value: string): boolean {
    return !!value && /^data:image\//i.test(value);
  }

  isPdf(value: string): boolean {
    return !!value &&
      (
        /^data:application\/pdf/i.test(value) ||
        /\.pdf(?:$|\?)/i.test(value)
      );
  }

  isExternalProof(value: string): boolean {
    return !!value && /^https?:\/\//i.test(value);
  }
}
