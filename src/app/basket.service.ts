import { Injectable } from '@angular/core';
import { Pet } from '../models/pet.model';


@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Pet[] = [];

  addToCart(pet: Pet) {
    this.cart.push(pet);
  }

  getCart() {
    return this.cart;
  }

  clearCart() {
    this.cart = [];
  }
}
