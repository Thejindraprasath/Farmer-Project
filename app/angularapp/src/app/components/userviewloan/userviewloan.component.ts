import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Loan } from '../../models/loan.model';
import { LoanApplication } from '../../models/loanapplication.model';
import { AuthService } from '../../services/auth.service';
import { LoanService } from '../../services/loan.service';
import { UserNavComponent } from '../usernav/usernav.component';

@Component({
  selector: 'app-userviewloan', standalone: true, imports: [CommonModule, FormsModule, UserNavComponent],
  templateUrl: './userviewloan.component.html',
  styleUrls: ['./userviewloan.component.css']
})
export class UserViewLoanComponent implements OnInit {
  loans: Loan[] = []; applications: LoanApplication[] = []; search=''; error='';
  constructor(private readonly loanService: LoanService, private readonly auth: AuthService, private readonly router: Router) {}
  ngOnInit(): void { this.load(); }
  get filtered(): Loan[] { const q=this.search.trim().toLowerCase(); return this.loans.filter(x=>!q || x.LoanType.toLowerCase().includes(q) || x.Description.toLowerCase().includes(q)); }
  load(): void {
    this.loanService.getAllLoans().subscribe({next:v=>this.loans=v,error:e=>this.error=e?.error?.message??'Unable to load loans.'});
    const userId=this.auth.getUserId(); if(userId!=null){this.loanService.getAppliedLoans(userId).subscribe({next:v=>this.applications=v,error:()=>{}});}
  }
  isApplied(loan: Loan): boolean { return this.applications.some(a=>a.LoanId===loan.LoanId); }
  apply(loan: Loan): void { if(loan.LoanId!=null && !this.isApplied(loan)) this.router.navigate(['/user/loan/apply', loan.LoanId]); }
}
