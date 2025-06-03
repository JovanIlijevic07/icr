import { Injectable } from '@angular/core';
import { Pet } from '../models/pet.model';


@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Pet[] = [];

  constructor() {
    this.loadCart();
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  private loadCart() {
    const data = localStorage.getItem('cart');
    this.cart = data ? JSON.parse(data) : [];
  }

  addToCart(pet: Pet) {
    this.cart.push(pet);
    this.saveCart();
  }

  getCart(): Pet[] {
    return this.cart;
  }

  removeFromCart(petId: number) {
    this.cart = this.cart.filter(pet => pet.id !== petId);
    this.saveCart();
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }
}
