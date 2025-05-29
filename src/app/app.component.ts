import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink,NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'interakcijaProjekat';
  year = new Date().getFullYear()
  constructor(private router: Router,public authService: AuthService) {}

  goToProfile(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/profile']);
  }

 /* logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
    */
}