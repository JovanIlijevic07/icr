import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Pet } from '../models/pet.model';
import { User } from '../models/user.model';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class WebService {

  private static instance: WebService
  private baseUrl: string
  private client: HttpClient
  private tokenKey = 'auth_token';
  private userKey = 'user';

  private constructor() {
    this.baseUrl = "http://localhost:3000/api"
    this.client = inject(HttpClient)
  }

  public static getInstance() {
    if (this.instance == undefined)
      this.instance = new WebService()
    return this.instance
  }

  signup(data: any) {
  return this.client.post(`${this.baseUrl}/auth/signup`, data);
}

login(email: string, password: string) {
  return this.client.post<{ token: string, user: any }>(`${this.baseUrl}/auth/login`, { email, password }).pipe(
    tap(response => {
      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem(this.userKey, JSON.stringify(response.user));
    })
  );
}

logout() {
  localStorage.removeItem(this.tokenKey);
  localStorage.removeItem(this.userKey);
}

isLoggedIn(): boolean {
  return !!localStorage.getItem(this.tokenKey);
}

getUserStatus(): 'anonimus' | 'user' {
  return this.isLoggedIn() ? 'user' : 'anonimus';
}

getUser() {
  const userJson = localStorage.getItem(this.userKey);
  return userJson ? JSON.parse(userJson) : null;
}

  public getAllPets(): Observable<Pet[]> {
    return this.client.get<Pet[]>(this.baseUrl + '/pets');
  }

  public getPetImg(pet: Pet): string {
    if (!pet.image_url || pet.image_url.trim() === '') {
      return 'assets/images/default.jpg';
    }
    return `assets/images/${pet.image_url}`;
  }

  getPetById(id: number): Observable<Pet> {
    return this.client.get<Pet>(`${this.baseUrl}/pets/${id}`);
  }

  public getUsers(): Observable<User[]> {
    return this.client.get<User[]>(`${this.baseUrl}/users`);
  }

  public registerUser(user: User): Observable<User> {
    return this.client.post<User>(`${this.baseUrl}/users`, user);
  }
  
  loginUser(name: string, password: string): Observable<User> {
  return this.client.post<User>(`${this.baseUrl}/login`, { name, password });
}

  getOrigins() {
    return this.client.get<string[]>(this.baseUrl + '/pet-origins');
  }

  getPets(filters?: any): Observable<Pet[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.client.get<Pet[]>(this.baseUrl + '/pets', { params });
  }

  submitOrder(userId: number, petIds: number[]): Observable<any> {
    return this.client.post(`${this.baseUrl}/orders`, {
      user_id: userId,
      pet_ids: petIds
    });
  }

  updateUser(id: number, data: Partial<User>) {
  return this.client.put(`${this.baseUrl}/users/${id}`, data);
}

checkEmailExists(email: string) {
  return this.client.get<boolean>(`${this.baseUrl}/users`, {
    params: { email }
  });
}

  getOrdersByUser(userId: number): Observable<Order[]> {
    return this.client.get<Order[]>(`${this.baseUrl}/orders/user/${userId}`);
  }

  submitReview(orderId: number, rating: number, comment: string): Observable<any> {
    return this.client.post(`${this.baseUrl}/orders/${orderId}/review`, { rating, comment });
  }

}
