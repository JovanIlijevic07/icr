import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { WebService } from '../web.service';
import { NgFor, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  imports: [NgIf,FormsModule,NgFor,HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: User = {} as User;
  updatedUser: Partial<User> = {};
  message = '';
  error = '';

  favouriteOptions = ['pas', 'mačka', 'ptica'];  // Opcije omiljenih životinja

  constructor() {}

  ngOnInit(): void {
    const localUser = WebService.getInstance().getUser();
    if (localUser) {
      this.user = localUser;
      this.updatedUser = { ...localUser };
    }
  }

  getFavouriteArray(): string[] {
    if (!this.updatedUser.favourite_types) return [];
    return this.updatedUser.favourite_types.split(',').map(s => s.trim());
  }

  setFavouriteArray(values: string[]) {
    this.updatedUser.favourite_types = values.join(',');
  }

  onFavouriteChange(event: Event, option: string) {
    const checked = (event.target as HTMLInputElement).checked;
    const currentFavourites = this.getFavouriteArray();

    if (checked) {
      if (!currentFavourites.includes(option)) {
        currentFavourites.push(option);
      }
    } else {
      const index = currentFavourites.indexOf(option);
      if (index > -1) {
        currentFavourites.splice(index, 1);
      }
    }

    this.setFavouriteArray(currentFavourites);
  }

  saveChanges() {
    // Ako je lozinka prazna, ne šalji je u update da se ne menja
    if (this.updatedUser.password === '') {
      delete this.updatedUser.password;
    }
    if (this.updatedUser.phone === '') {
      delete this.updatedUser.phone;
    }

    if (this.updatedUser.email !== this.user.email) {
      WebService.getInstance().checkEmailExists(this.updatedUser.email!).subscribe((exists) => {
        if (exists) {
          this.error = 'Email adresa je već u upotrebi.';
          this.message = '';
        } else {
          this.update();
        }
      });
    } else {
      this.update();
    }
  }

  update() {
    WebService.getInstance().updateUser(this.user.id, this.updatedUser).subscribe({
      next: () => {
        this.message = 'Podaci uspešno ažurirani.';
        this.error = '';
        this.user = { ...this.user, ...this.updatedUser };
        localStorage.setItem('user', JSON.stringify(this.user));
        // Očisti lozinku iz updatedUser radi sigurnosti
        if (this.updatedUser.password) {
          delete this.updatedUser.password;
        }
      },
      error: () => {
        this.error = 'Greška prilikom ažuriranja podataka.';
        this.message = '';
      }
    });
  }
}