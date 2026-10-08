import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-usernav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './usernav.component.html',
  styleUrls: ['./usernav.component.css']
})
export class UserNavComponent {
  showLogout=false;
  constructor(public readonly auth: AuthService, private readonly router: Router) {}
  get displayName(): string { return this.auth.getUsername() || 'User'; }
  confirmLogout(): void { this.auth.logout(); this.showLogout=false; this.router.navigate(['/login']); }
}
