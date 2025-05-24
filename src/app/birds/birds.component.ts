import { Component } from '@angular/core';
import { WebService } from '../web.service';
import { Pet } from '../../models/pet.model';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CartService } from '../basket.service';

@Component({
  selector: 'app-birds',
  imports: [HttpClientModule,RouterLink,NgIf,NgFor],
  templateUrl: './birds.component.html',
  styleUrl: './birds.component.css'
})
export class BirdsComponent {

public webService:WebService
  public birds: Pet[] = [];

 constructor(private cartService: CartService) {
      this.webService =WebService.getInstance()
  }

  ngOnInit(): void {
    this.webService.getAllPets().subscribe((pets: Pet[]) => {
      console.log('Svi ljubimci:', pets);
      this.birds = pets.filter(pet => pet.species?.toLowerCase().trim() === 'ptica');
      console.log('Filtrirani psi:', this.birds);
    });
  }

  addToCart(pet: Pet) {
    this.cartService.addToCart(pet);
    alert(`${pet.name} je dodat u korpu!`);
  }

}
