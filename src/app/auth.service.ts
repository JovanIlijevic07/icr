import { inject,Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
 private currentUser: User | null = null;
  private baseUrl = 'http://localhost:3000/api'; // tvoja API adresa

 constructor(private http: HttpClient) {
  const status = localStorage.getItem('isLoggedIn');
  if (status === null) {
    localStorage.setItem('isLoggedIn', '0');
  }

  const userData = localStorage.getItem('currentUser');
  if (userData) {
    this.currentUser = JSON.parse(userData);
  }
}


 login(name: string, password: string): void {
  this.http.get<User[]>(`${this.baseUrl}/users`).subscribe(users => {
    const foundUser = users.find(u => u.name === name && u.password === password);
    if (foundUser) {
      this.currentUser = foundUser;
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      localStorage.setItem('isLoggedIn', '1');
      window.location.href = '/';
    } else {
      alert('Pogrešno korisničko ime ili lozinka.');
    }
  });
}

  logout(): void {
  this.currentUser = null;
  localStorage.removeItem('currentUser');
  localStorage.setItem('isLoggedIn', '0');
  window.location.href = '/';
}
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}