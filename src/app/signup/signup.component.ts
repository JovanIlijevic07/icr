import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { WebService } from '../web.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, NgIf, HttpClientModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  user = {
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    favorite_types: ''
  };

  errorMessage = '';
  selectedTypes: string[] = [];

  public webService: WebService

  constructor(private router: Router) {
    this.webService = WebService.getInstance()
  }

  toggleType(type: string) {
    if (this.selectedTypes.includes(type)) {
      this.selectedTypes = this.selectedTypes.filter(t => t !== type);
    } else {
      this.selectedTypes.push(type);
    }
    this.user.favorite_types = this.selectedTypes.join(',');
  }

  signup() {

    const phonePattern = /^06[0-9]\/[0-9]{6,7}$/;
    if (!phonePattern.test(this.user.phone)) {
      this.errorMessage = 'Telefon mora biti u formatu 06x/xxxxxxx';
      return;
    }

    this.webService.signup(this.user).subscribe({
      next: () => {
        alert('Uspešna registracija!');
        this.router.navigate(['/home']);
      },
      error: err => {
        if (err.status === 409) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Došlo je do greške.';
        }
      }
    });
  }
}