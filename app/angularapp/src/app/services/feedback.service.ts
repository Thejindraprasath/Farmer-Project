import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Feedback } from '../models/feedback.model';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  public apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  sendFeedback(feedback: Feedback): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.apiUrl}/feedback`, feedback, { headers: this.authHeaders() });
  }

  getAllFeedbacksByUserId(userId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/feedback/user/${userId}`, { headers: this.authHeaders() });
  }

  deleteFeedback(feedbackId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/feedback/${feedbackId}`, { headers: this.authHeaders() });
  }

  getFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/feedback`, { headers: this.authHeaders() });
  }

  // Backward-compatible method names from checkpoint 2.
  getAllFeedbacks(): Observable<Feedback[]> { return this.getFeedbacks(); }
  getFeedbacksByUserId(userId: number): Observable<Feedback[]> { return this.getAllFeedbacksByUserId(userId); }
  addFeedback(feedback: Feedback): Observable<Feedback> { return this.sendFeedback(feedback); }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }
}
