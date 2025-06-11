import { Component, OnInit } from '@angular/core';
import { WebService } from '../web.service';
import { Order } from '../../models/order.model';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-orders',
  imports: [NgIf, FormsModule, NgFor, CommonModule, HttpClientModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  message = '';
  error = '';
  public webService: WebService


  reviewTexts: { [orderId: number]: string } = {};
  reviewRatings: { [orderId: number]: number } = {};

  constructor() {
    this.webService = WebService.getInstance()
  }


  ngOnInit(): void {
    const userId = this.webService.getUserID();
    if (!userId) {
      this.error = 'Niste ulogovani.';
      return;
    }


    this.webService.updateOrderStatuses(userId).subscribe({
      next: () => {

        this.loadOrders();
      },
      error: () => {
        this.error = 'Greška pri ažuriranju statusa porudžbina.';
      }
    });
  }

  onRatingChange(orderId: number, rating: number) {
    this.reviewRatings[orderId] = rating;
  }

  loadOrders(): void {
    const user = this.webService.getUser();
    if (!user) {
      this.error = 'Niste ulogovani.';
      return;
    }
    this.webService.getOrdersByUser(user.id).subscribe({
      next: (ordersFromServer: any[]) => {
        const groupedOrdersMap = new Map<number, Order>();

        ordersFromServer.forEach(o => {
          let order = groupedOrdersMap.get(o.order_id);
          if (!order) {
            order = {
              id: o.order_id,
              user_id: user.id,               // dodeljujemo user_id
              status: o.status,
              created_at: o.created_at,
              rating: o.rating || 0,          // ako postoji rating u objektu, ili 0
              pets: []
            };
            groupedOrdersMap.set(o.order_id, order);
          }
          order.pets.push({
            id: o.pet_id,
            name: o.pet_name,
            species: o.species,
            age: o.age,
            size: o.size,
            origin: o.origin,
            description: o.description,
            image_url: o.image_url,
            price: o.price
          });
        });

        this.orders = Array.from(groupedOrdersMap.values());

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

  cancelOrder(order: Order): void {
    this.error = '';
    this.message = '';

    this.webService.changeOrderStatus(order.id, 'otkazano').subscribe({
      next: () => {
        order.status = 'otkazano';
        this.message = `Narudžbina #${order.id} je uspešno otkazana.`;
      },
      error: () => {
        this.error = `Greška prilikom otkazivanja narudžbine #${order.id}.`;
      }
    });
  }

  reserveOrder(order: Order): void {
    this.error = '';
    this.message = '';

    this.webService.changeOrderStatus(order.id, 'rezervisano').subscribe({
      next: () => {
        order.status = 'rezervisano';
        this.message = `Narudžbina #${order.id} je uspešno rezervisana.`;
      },
      error: () => {
        this.error = `Greška prilikom rezervacije narudžbine #${order.id}.`;
      }
    });
  }

  canReview(order: Order): boolean {
    return order.status === 'preuzeto';
  }

  submitReview(order: Order): void {
    const rating = this.reviewRatings[order.id];
    const comment = this.reviewTexts[order.id];

    if (rating !== null && (rating < 1 || rating > 5)) {
      this.error = 'Molimo ocenite sa 1 do 5.';
      return;
    }

    this.webService.submitReview(order.id, rating, comment).subscribe({
      next: () => {
        this.message = 'Recenzija je uspešno sačuvana.';
        this.error = '';
        this.loadOrders();
      },
      error: () => {
        this.error = 'Greška prilikom slanja recenzije.';
        this.message = '';
      }
    });
  }
}
