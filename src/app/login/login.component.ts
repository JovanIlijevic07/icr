import { Component } from '@angular/core';
import { NgForm,FormsModule} from '@angular/forms';
import { RouterLink,Router } from '@angular/router';
import { WebService } from '../web.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [RouterLink,CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  name: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    if (!this.name || !this.password) {
      alert('Unesi korisničko ime i lozinku.');
      return;
    }

    this.authService.login(this.name, this.password);
  }
}
