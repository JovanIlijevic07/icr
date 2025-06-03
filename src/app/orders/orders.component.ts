import { Component, OnInit } from '@angular/core';
import { WebService } from '../web.service';
import { Order } from '../../models/order.model';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-orders',
  imports: [NgIf,FormsModule,NgFor,CommonModule,HttpClientModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  message = '';
  error = '';
  public webService:WebService

  // Za čuvanje privremenih recenzija korisnika (komentari i rating po narudžbini)
  reviewTexts: { [orderId: number]: string } = {};
  reviewRatings: { [orderId: number]: number } = {};

  constructor() {
     this.webService = WebService.getInstance()
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const user = this.webService.getUser();
    if (!user) {
      this.error = 'Niste ulogovani.';
      return;
    }
    this.webService.getOrdersByUser(user.id).subscribe({
      next: (orders) => {
        this.orders = orders;
        // Popuni inicijalne vrednosti recenzija ako postoje
        this.orders.forEach(order => {
          this.reviewTexts[order.id] = '';
          this.reviewRatings[order.id] = order.rating || 0;
        });
      },
      error: () => {
        this.error = 'Greška pri učitavanju narudžbina.';
      }
    });
  }

  canReview(order: Order): boolean {
    return order.status === 'preuzeto';
  }

  submitReview(order: Order): void {
    const rating = this.reviewRatings[order.id];
    const comment = this.reviewTexts[order.id];

    if (!rating || rating < 1 || rating > 5) {
      this.error = 'Molimo ocenite sa 1 do 5.';
      return;
    }

    this.webService.submitReview(order.id, rating, comment).subscribe({
      next: () => {
        this.message = 'Recenzija je uspešno sačuvana.';
        this.error = '';
        // Osveži narudžbine (ako želiš)
        this.loadOrders();
      },
      error: () => {
        this.error = 'Greška prilikom slanja recenzije.';
        this.message = '';
      }
    });
  }
}