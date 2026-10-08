import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Loan } from '../models/loan.model';
import { LoanApplication } from '../models/loanapplication.model';

@Injectable({ providedIn: 'root' })
export class LoanService {
  public apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getAllLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/loan`, { headers: this.authHeaders() });
  }

  deleteLoan(loanId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/loan/${loanId}`, { headers: this.authHeaders() });
  }

  getLoanById(id: number): Observable<Loan> {
    return this.http.get<Loan>(`${this.apiUrl}/loan/${id}`, { headers: this.authHeaders() });
  }

  addLoan(requestObject: Loan): Observable<Loan> {
    return this.http.post<Loan>(`${this.apiUrl}/loan`, requestObject, { headers: this.authHeaders() });
  }

  updateLoan(id: number, requestObject: Loan): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/loan/${id}`, requestObject, { headers: this.authHeaders() });
  }

  getAppliedLoans(userId: number): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/loan-application/user/${userId}`, { headers: this.authHeaders() });
  }

  deleteLoanApplication(loanApplicationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/loan-application/${loanApplicationId}`, { headers: this.authHeaders() });
  }

  addLoanApplication(data: LoanApplication): Observable<LoanApplication> {
    return this.http.post<LoanApplication>(`${this.apiUrl}/loan-application`, data, { headers: this.authHeaders() });
  }

  getAllLoanApplications(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/loan-application`, { headers: this.authHeaders() });
  }

  updateLoanStatus(id: number, loanApplication: LoanApplication): Observable<LoanApplication> {
    return this.http.put<LoanApplication>(`${this.apiUrl}/loan-application/${id}`, loanApplication, { headers: this.authHeaders() });
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }
}
