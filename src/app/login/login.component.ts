import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { WebService } from '../web.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, CommonModule, FormsModule, NgIf, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  public webService: WebService

  constructor(private router: Router) {
    this.webService = WebService.getInstance()
  }

  login() {
    this.errorMessage = '';

    this.webService.login(this.email, this.password).subscribe({
      next: (res) => {
        console.log('Uspešan login:', res);
        // Posle uspešnog logina, idi na početnu ili profil stranu
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        if (err.status === 400 || err.status === 401) {
          this.errorMessage = 'Pogrešan email ili lozinka.';
        } else {
          this.errorMessage = 'Došlo je do greške. Pokušajte ponovo.';
        }
      }
    });
  }
}