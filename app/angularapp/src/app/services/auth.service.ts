import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Login } from '../models/login.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public readonly apiUrl = environment.apiUrl;
  private readonly tokenKey = 'token';
  private readonly roleKey = 'userRole';
  private readonly userIdKey = 'userId';
  private readonly usernameKey = 'username';

  private readonly userRoleSubject = new BehaviorSubject<string | null>(null);
  private readonly userIdSubject = new BehaviorSubject<number | null>(null);
  private readonly usernameSubject = new BehaviorSubject<string | null>(null);

  readonly userRole$ = this.userRoleSubject.asObservable();
  readonly userId$ = this.userIdSubject.asObservable();
  readonly username$ = this.usernameSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    this.hydrateSession();
  }

  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(login: Login): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, login).pipe(
      tap(response => this.persistSession(response.token))
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserRole(): string | null {
    return this.userRoleSubject.value;
  }

  getUserId(): number | null {
    return this.userIdSubject.value;
  }

  getUsername(): string | null {
    return this.usernameSubject.value;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token || !this.hasUsableToken(token)) {
      if (token) this.logout();
      return false;
    }
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.usernameKey);
    this.userRoleSubject.next(null);
    this.userIdSubject.next(null);
    this.usernameSubject.next(null);
  }

  private hydrateSession(): void {
    const token = this.getToken();
    if (!token || !this.hasUsableToken(token)) {
      if (token) this.logout();
      return;
    }

    const payload = this.decodeJwt(token);
    const role = this.getRoleFromPayload(payload) ?? localStorage.getItem(this.roleKey);
    const userId = this.getUserIdFromPayload(payload) ?? this.readStoredUserId();
    const username = this.getUsernameFromPayload(payload) ?? localStorage.getItem(this.usernameKey);

    this.setSessionValues(role, userId, username);
  }

  private persistSession(token: string): void {
    if (!this.hasUsableToken(token)) {
      this.logout();
      throw new Error('The server returned an invalid authentication token.');
    }

    localStorage.setItem(this.tokenKey, token);
    const payload = this.decodeJwt(token);
    this.setSessionValues(
      this.getRoleFromPayload(payload),
      this.getUserIdFromPayload(payload),
      this.getUsernameFromPayload(payload)
    );
  }

  private setSessionValues(role: string | null, userId: number | null, username: string | null): void {
    if (role) localStorage.setItem(this.roleKey, role);
    else localStorage.removeItem(this.roleKey);

    if (userId !== null) localStorage.setItem(this.userIdKey, String(userId));
    else localStorage.removeItem(this.userIdKey);

    if (username) localStorage.setItem(this.usernameKey, username);
    else localStorage.removeItem(this.usernameKey);

    this.userRoleSubject.next(role);
    this.userIdSubject.next(userId);
    this.usernameSubject.next(username);
  }

  private readStoredUserId(): number | null {
    const value = localStorage.getItem(this.userIdKey);
    if (!value) return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  private hasUsableToken(token: string): boolean {
    const payload = this.decodeJwt(token);
    if (Object.keys(payload).length === 0) return false;
    const exp = Number(payload['exp']);
    return !Number.isFinite(exp) || Date.now() < exp * 1000;
  }

  private decodeJwt(token: string): Record<string, any> {
    try {
      const part = token.split('.')[1];
      if (!part) return {};
      const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const json = decodeURIComponent(
        atob(padded)
          .split('')
          .map(char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join('')
      );
      return JSON.parse(json) as Record<string, any>;
    } catch {
      return {};
    }
  }

  private getRoleFromPayload(payload: Record<string, any>): string | null {
    const raw = payload['role']
      ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      ?? null;
    if (Array.isArray(raw)) return raw[0] ?? null;
    return typeof raw === 'string' && raw ? raw : null;
  }

  private getUsernameFromPayload(payload: Record<string, any>): string | null {
    const raw = payload['username']
      ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
      ?? null;
    return typeof raw === 'string' && raw ? raw : null;
  }

  private getUserIdFromPayload(payload: Record<string, any>): number | null {
    const raw = payload['userId'] ?? payload['UserId'];
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }
}
