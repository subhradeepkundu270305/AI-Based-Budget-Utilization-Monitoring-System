import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role, User } from './models';

const TOKEN_KEY = 'bums_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;
  private readonly userSignal = signal<User | null>(null);
  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.userSignal());
  accessToken: string | null = sessionStorage.getItem(TOKEN_KEY);

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http
      .post<{ accessToken: string; user: User }>(`${this.api}/auth/login`, { email, password }, { withCredentials: true })
      .pipe(tap((res) => this.setSession(res.accessToken, res.user)));
  }

  register(payload: { name: string; email: string; password: string; role: Role; departmentId?: string | null }) {
    return this.http
      .post<{ accessToken?: string; user: User }>(`${this.api}/auth/register`, payload, { withCredentials: true })
      .pipe(
        tap((res) => {
          if (res.accessToken) this.setSession(res.accessToken, res.user);
        })
      );
  }

  refresh() {
    return this.http
      .post<{ accessToken: string; user: User }>(`${this.api}/auth/refresh`, {}, { withCredentials: true })
      .pipe(tap((res) => this.setSession(res.accessToken, res.user)));
  }

  restoreSession(): Observable<boolean> {
    return this.refresh().pipe(
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  logout() {
    this.http.post(`${this.api}/auth/logout`, {}, { withCredentials: true }).subscribe({
      complete: () => this.afterLogout(),
      error: () => this.afterLogout(),
    });
  }

  hasRole(roles: Role[]): boolean {
    const role = this.userSignal()?.role;
    return !!role && roles.includes(role);
  }

  departmentId(): string | null {
    const dept = this.userSignal()?.departmentId;
    if (!dept) return null;
    return typeof dept === 'string' ? dept : dept._id;
  }

  private afterLogout() {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private setSession(token: string, user: User) {
    this.accessToken = token;
    sessionStorage.setItem(TOKEN_KEY, token);
    this.userSignal.set(user);
  }

  private clearSession() {
    this.accessToken = null;
    sessionStorage.removeItem(TOKEN_KEY);
    this.userSignal.set(null);
  }
}
