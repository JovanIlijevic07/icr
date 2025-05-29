import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { WebService } from '../web.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, NgIf],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  public webService: WebService;

   user: User = {
    id: 0,
    name: '',
    email: '',
    password: '',
    phone: '',
    adress: [''],
    favourite_types: ''
  };

selectedTypes: string[] = [];

  errorMessage: string = '';

  constructor(private router: Router) {
    this.webService=WebService.getInstance()
  }

  toggleType(type: string) {
    if (this.selectedTypes.includes(type)) {
      this.selectedTypes = this.selectedTypes.filter(t => t !== type);
    } else {
      this.selectedTypes.push(type);
    }

    this.user.favourite_types = this.selectedTypes.join(','); // npr. "pas,ptica"
  }

  
  signup() {
    // Validacija telefona (opciono dodatna JS validacija)
    const phonePattern = /^06[0-9]\/[0-9]{6,7}$/;
    if (!phonePattern.test(this.user.phone)) {
      this.errorMessage = 'Telefon mora biti u formatu 06x/xxxxxxx';
      return;
    }

    this.webService.registerUser(this.user).subscribe({
      next: res => {
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

