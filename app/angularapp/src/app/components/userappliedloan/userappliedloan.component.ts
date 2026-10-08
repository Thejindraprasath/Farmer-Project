import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoanApplication } from '../../models/loanapplication.model';
import { AuthService } from '../../services/auth.service';
import { LoanService } from '../../services/loan.service';
import { UserNavComponent } from '../usernav/usernav.component';

@Component({
  selector: 'app-userappliedloan', standalone: true, imports: [CommonModule, FormsModule, UserNavComponent],
  templateUrl: './userappliedloan.component.html',
  styleUrls: ['./userappliedloan.component.css']
})
export class UserAppliedLoanComponent implements OnInit {
  applications: LoanApplication[] = []; search = ''; error = ''; pendingDelete: LoanApplication | null = null;
  constructor(private readonly loanService: LoanService, private readonly auth: AuthService) { }
  ngOnInit(): void { this.load(); } get filtered(): LoanApplication[] { const q = this.search.trim().toLowerCase(); return this.applications.filter(a => !q || (a.Loan?.LoanType || '').toLowerCase().includes(q)); }
  load(): void { const id = this.auth.getUserId(); if (id == null) return; this.loanService.getAppliedLoans(id).subscribe({ next: v => this.applications = v, error: e => this.error = e?.error?.message ?? 'Unable to load applied loans.' }); }
  statusText(s: number): string { return s === 1 ? 'Approved' : s === 2 ? 'Rejected' : 'Pending'; }
  confirmDelete(): void { const id = this.pendingDelete?.LoanApplicationId; if (id == null) return; this.loanService.deleteLoanApplication(id).subscribe({ next: () => { this.pendingDelete = null; this.load(); }, error: e => { this.error = e?.error?.message ?? 'Unable to delete loan application.'; this.pendingDelete = null; } }); }
}