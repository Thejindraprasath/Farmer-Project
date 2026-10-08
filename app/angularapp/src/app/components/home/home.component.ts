import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AdminNavComponent } from '../adminnav/adminnav.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { UserNavComponent } from '../usernav/usernav.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, AdminNavComponent, UserNavComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent { constructor(public readonly auth: AuthService) {} }
