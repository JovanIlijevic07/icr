import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService, UserStatus } from './auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SafePipe } from './safe.pipe';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink,NgIf,HttpClientModule,SafePipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'interakcijaProjekat';
  year = new Date().getFullYear()

 public authService: AuthService

  constructor( private router: Router) {
    this.authService =AuthService.getInstance()
  }

  ngOnInit() {
    this.logUserStatus();
  }

  logUserStatus() {
    const status: UserStatus = this.authService.getUserStatus();
    console.log('Trenutni status korisnika je:', status);
  }

  get profileOrLoginLink(): string {
    return this.authService.isLoggedIn() ? '/profile' : '/login';
  }

  goToProfileOrLogin() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
