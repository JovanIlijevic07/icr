import { inject,Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';


export type UserStatus = 'anonimus' | 'user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'user';
  private http: HttpClient
  private static instance: AuthService

  constructor() {
    this.http = inject(HttpClient)
  }
  public static getInstance() {
    if (this.instance == undefined)
      this.instance = new AuthService()
    return this.instance
  }


   signup(data: any) {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string, user: any }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getUserStatus(): UserStatus {
  return this.isLoggedIn() ? 'user' : 'anonimus';
}

  getUser() {
    const userJson = localStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }
}