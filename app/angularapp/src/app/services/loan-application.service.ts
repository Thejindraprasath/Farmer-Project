import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoanApplication } from '../models/loanapplication.model';

@Injectable({
  providedIn: 'root'
})
export class LoanApplicationService {

  private apiUrl = 'https://8080-bfbcedbeaaaabaddcadaeceaedccceffaacaaae.premiumproject.examly.io/api/LoanApplication';

  constructor(private http: HttpClient) { }

  getLoanApplications(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(this.apiUrl);
  }

  getLoanApplicationsByUser(userId: number): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(
      `${this.apiUrl}/user/${userId}`
    );
  }

  updateLoanApplication(
    loanApplicationId: number,
    application: any
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${loanApplicationId}`,
      application
    );
  }

  updateLoanStatus(
    loanApplicationId: number,
    status: number
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${loanApplicationId}`,
      {
        loanStatus: status
      }
    );
  }
}