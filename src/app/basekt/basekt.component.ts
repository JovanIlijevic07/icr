import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pet } from '../../models/pet.model';
import { CartService } from '../basket.service';
import { NgFor, NgIf } from '@angular/common';
import { WebService } from '../web.service';

@Component({
  selector: 'app-basekt',
  imports: [RouterLink,NgIf,NgFor],
  templateUrl: './basekt.component.html',
  styleUrl: './basekt.component.css'
})
export class BasektComponent {

  public webService:WebService
  cartPets: Pet[] = []
  public totalPrice: number=0;

  constructor(private cartService: CartService) {
    this.webService = WebService.getInstance()
  }

  ngOnInit() {
    this.cartPets = this.cartService.getCart();
    this.totalPrice=this.cartPets.reduce((sum,pet)=>sum+Number(pet.price),0);
  }
  submitOrder() {
  const petIds = this.cartPets.map(p => p.id);
  const userId = 1; // zameni sa ID-em trenutno prijavljenog korisnika

  this.webService.submitOrder(userId, petIds).subscribe({
    next: res => {
      alert('Narudžbina uspešno kreirana!');
      this.cartService.clearCart();
      this.cartPets = [];
    },
    error: err => console.error(err)
  });
}
}
