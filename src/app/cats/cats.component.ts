import { Component, OnInit } from '@angular/core';
import { WebService } from '../web.service';
import { Pet } from '../../models/pet.model';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CartService } from '../basket.service';

@Component({
  selector: 'app-cats',
  imports: [HttpClientModule,RouterLink,NgIf,NgFor],
  templateUrl: './cats.component.html',
  styleUrl: './cats.component.css'
})
export class CatsComponent implements OnInit{

public webService:WebService
  public cats: Pet[] = [];

 constructor(private cartService: CartService) {
      this.webService =WebService.getInstance()
  }

  ngOnInit(): void {
    this.webService.getAllPets().subscribe((pets: Pet[]) => {
      console.log('Svi ljubimci:', pets);
      this.cats = pets.filter(pet => pet.species?.toLowerCase().trim() === 'mačka');
      console.log('Filtrirani psi:', this.cats);
    });
  }

  addToCart(pet: Pet) {
    this.cartService.addToCart(pet);
    alert(`${pet.name} je dodat u korpu!`);
  }

}
