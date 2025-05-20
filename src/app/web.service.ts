import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PageModel } from '../models/page.model';
import { FlightModel } from '../models/flight.model';
import { Observable } from 'rxjs';
import { Pet } from '../models/pet.model';

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


}
