import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Feedback } from '../../models/feedback.model';
import { AuthService } from '../../services/auth.service';
import { FeedbackService } from '../../services/feedback.service';
import { UserNavComponent } from '../usernav/usernav.component';

@Component({
  selector: 'app-userviewfeedback', standalone: true, imports: [CommonModule, UserNavComponent],
  templateUrl: './userviewfeedback.component.html',
  styleUrls: ['./userviewfeedback.component.css']
})
export class UserViewFeedbackComponent implements OnInit {
  feedbacks: Feedback[] = []; error = ''; pendingDelete: Feedback | null = null;
  constructor(private readonly feedbackService: FeedbackService, private readonly auth: AuthService) { }
  ngOnInit(): void { this.load(); } load(): void { const id = this.auth.getUserId(); if (id == null) return; this.feedbackService.getAllFeedbacksByUserId(id).subscribe({ next: v => this.feedbacks = v, error: e => this.error = e?.error?.message ?? 'Unable to load feedback.' }); }
  confirmDelete(): void { const id = this.pendingDelete?.FeedbackId; if (id == null) return; this.feedbackService.deleteFeedback(id).subscribe({ next: () => { this.pendingDelete = null; this.load(); }, error: e => { this.error = e?.error?.message ?? 'Unable to delete feedback.'; this.pendingDelete = null; } }); }
}

