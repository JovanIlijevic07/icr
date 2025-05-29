import { inject,Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';

export type UserStatus = 'anonimus' | 'user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   // BehaviorSubject drži trenutno stanje korisnika, sa početnom vrednošću 'anonimus'
  private currentUserSubject = new BehaviorSubject<UserStatus>('anonimus');

  // Observable koji drugi mogu da slušaju da bi znali stanje ulogovanosti
  public currentUser$: Observable<UserStatus> = this.currentUserSubject.asObservable();

  constructor() {
    // Opcionalno: možeš inicijalizovati stanje iz localStorage ako želiš trajnu sesiju
    const savedStatus = localStorage.getItem('userStatus') as UserStatus | null;
    if (savedStatus) {
      this.currentUserSubject.next(savedStatus);
    }
  }

  // Metoda za login - menja stanje u 'user'
  login() {
    this.currentUserSubject.next('user');
    localStorage.setItem('userStatus', 'user');
  }

  // Metoda za logout - vraća stanje na 'anonimus'
  logout() {
    this.currentUserSubject.next('anonimus');
    localStorage.removeItem('userStatus');
  }

  // Metoda koja vraća trenutno stanje (trenutnu vrednost)
  getCurrentUserStatus(): UserStatus {
    return this.currentUserSubject.value;
  }

  // Metoda da proveriš da li je korisnik ulogovan
  isLoggedIn(): boolean {
    return this.currentUserSubject.value === 'user';
  }
}