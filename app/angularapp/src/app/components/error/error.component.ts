import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent {
  readonly code: string;
  readonly title: string;
  readonly message: string;

  constructor(route: ActivatedRoute) {
    this.code = route.snapshot.paramMap.get('code') ?? '500';
    if (this.code === '404') {
      this.title = 'Page Not Found';
      this.message = 'The page you requested could not be found.';
    } else {
      this.title = 'Something Went Wrong';
      this.message = "We're sorry, but an error occurred. Please try again later.";
    }
  }
}
