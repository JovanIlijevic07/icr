import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pet } from '../models/pet.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class WebService {

  private static instance: WebService
  private baseUrl: string
  private client: HttpClient

  private constructor() {
    this.baseUrl = "http://localhost:3000/api"
    this.client = inject(HttpClient)
  }

  public static getInstance() {
    if (this.instance == undefined)
      this.instance = new WebService()
    return this.instance
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

}
