import { User } from './user.model';

export class Feedback {
  FeedbackId?: number;
  UserId?: number;
  User?: User;
  FeedbackText = '';
  Date: Date = new Date();
}