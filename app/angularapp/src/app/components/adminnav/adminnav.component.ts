import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-adminnav', standalone: true, imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './adminnav.component.html',
  styleUrls: ['./adminnav.component.css']
})
export class AdminNavComponent {
  showLogout=false;
  constructor(public readonly auth: AuthService, private readonly router: Router) {}
  get displayName(): string { return this.auth.getUsername() || 'Admin'; }
  confirmLogout(): void { this.auth.logout(); this.showLogout=false; this.router.navigate(['/login']); }
}

