import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Feedback } from '../../models/feedback.model';
import { FeedbackService } from '../../services/feedback.service';
import { AdminNavComponent } from '../adminnav/adminnav.component';

@Component({
  selector:'app-adminviewfeedback',standalone:true,imports:[CommonModule,AdminNavComponent],
  templateUrl: './adminviewfeedback.component.html',
  styleUrls: ['./adminviewfeedback.component.css']
})
export class AdminViewFeedbackComponent implements OnInit { feedbacks:Feedback[]=[];error='';selected:Feedback|null=null;constructor(private readonly feedbackService:FeedbackService){}ngOnInit():void{this.feedbackService.getFeedbacks().subscribe({next:v=>this.feedbacks=v,error:e=>this.error=e?.error?.message??'Unable to load feedbacks.'});}}
