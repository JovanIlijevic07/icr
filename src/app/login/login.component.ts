import { Component } from '@angular/core';
import { NgForm,FormsModule} from '@angular/forms';
import { RouterLink,Router } from '@angular/router';
import { WebService } from '../web.service';
import { User } from '../../models/user.model';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [RouterLink,CommonModule,FormsModule,NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  name: string = '';
  password: string = '';
  errorMessage: string='';

constructor(
    private router: Router,
    private webService: WebService,
    private authService: AuthService
  ) {}

  login() {
    this.errorMessage = '';
    this.webService.loginUser(this.name, this.password).subscribe({
      next: (user: User) => {
        console.log('Uspešan login:', user);

        // Sačuvaj korisnika u localStorage (ili u authService po potrebi)
        localStorage.setItem('user', JSON.stringify(user));

        // Postavi status u AuthService na 'user'
        this.authService.login();

        // Preusmeri na početnu ili neku drugu stranicu
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage = 'Pogrešno korisničko ime ili lozinka.';
        } else {
          this.errorMessage = 'Došlo je do greške. Pokušajte ponovo.';
        }
      }
    });
  }
}
