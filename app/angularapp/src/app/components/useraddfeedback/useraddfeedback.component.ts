import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Feedback } from '../../models/feedback.model';
import { AuthService } from '../../services/auth.service';
import { FeedbackService } from '../../services/feedback.service';
import { noWhitespaceValidator } from '../../validators/form.validators';
import { UserNavComponent } from '../usernav/usernav.component';

@Component({
  selector: 'app-useraddfeedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserNavComponent],
  templateUrl: './useraddfeedback.component.html',
  styleUrls: ['./useraddfeedback.component.css']
})
export class UserAddFeedbackComponent {
  submitted = false;
  loading = false;
  success = false;
  error = '';
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly feedbackService: FeedbackService,
    private readonly router: Router
  ) {
    this.form = this.fb.group({
      FeedbackText: ['', [Validators.required, noWhitespaceValidator, Validators.maxLength(1000)]]
    });
  }

  submit(): void {
    this.submitted = true;
    this.error = '';
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading) return;

    const userId = this.auth.getUserId();
    if (userId == null) {
      this.router.navigate(['/login']);
      return;
    }

    const payload = new Feedback();
    payload.UserId = userId;
    payload.FeedbackText = String(this.form.controls['FeedbackText'].value ?? '').trim();
    payload.Date = new Date();

    this.loading = true;
    this.feedbackService.sendFeedback(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: err => {
        this.loading = false;
        this.error = err?.error?.message ?? err?.error?.title ?? 'Unable to add feedback.';
      }
    });
  }

  closeSuccess(): void {
    this.success = false;
    this.form.reset();
    this.submitted = false;
  }
}
