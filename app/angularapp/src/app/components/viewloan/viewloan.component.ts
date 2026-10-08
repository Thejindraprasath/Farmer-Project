import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Loan } from '../../models/loan.model';
import { LoanService } from '../../services/loan.service';
import { AdminNavComponent } from '../adminnav/adminnav.component';

@Component({
  selector: 'app-viewloan',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './viewloan.component.html',
  styleUrls: ['./viewloan.component.css']
})
export class ViewLoanComponent implements OnInit {
  loans: Loan[] = [];
  search = '';
  selectedLoan: Loan | null = null;
  deleteError = '';
  loadError = '';
  constructor(private readonly loanService: LoanService, private readonly router: Router) {}
  ngOnInit(): void { this.load(); }
  get filteredLoans(): Loan[] { const q=this.search.trim().toLowerCase(); return !q?this.loans:this.loans.filter(x => `${x.LoanType} ${x.Description}`.toLowerCase().includes(q)); }
  load(): void { this.loanService.getAllLoans().subscribe({next:v=>this.loans=v,error:e=>this.loadError=e?.error?.message??'Unable to load loans.'}); }
  edit(loan: Loan): void { if (loan.LoanId != null) this.router.navigate(['/admin/loan/edit', loan.LoanId]); }
  askDelete(loan: Loan): void { this.selectedLoan=loan; this.deleteError=''; }
  confirmDelete(): void {
    const id=this.selectedLoan?.LoanId; if(id==null)return;
    this.loanService.deleteLoan(id).subscribe({
      next:()=>{this.selectedLoan=null;this.load();},
      error:e=>{this.deleteError=e?.error?.message??'Failed to delete loan.';}
    });
  }
}
