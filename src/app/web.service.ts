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
//
//public getPetImg1(pet: Pet): string {
//  if (!pet.image_url || pet.image_url.trim() === '') {
//    return 'assets/images/default.jpg';
//  }
//  return `assets/images/${pet.image_url}`;
//}
//
public getPetImg(pet: Pet): string {
  if (!pet.image_url || pet.image_url.trim() === '') {
    return 'assets/images/default.jpg';
  }
  return `assets/images/${pet.image_url}`;
}




  public getFlights(page = 0, size=10,sort="scheduledAt,desc") {
    const url = `${this.baseUrl}/flight?page=${page}&size=${size}&sort=${sort}&type=departure`
    return this.client.get<PageModel<FlightModel>>(url)
  }

  public getRecomendedFlights() {
    return this.getFlights(0,3)
  }

  public getFlightById(id:number){
    const url= `${this.baseUrl}/flight/${id}`
    return this.client.get<FlightModel>(url) 
  }

  public getDestinationImage(dest: string ) {
    return 'https://img.pequla.com/destination/' + dest.split(" ")[0].toLowerCase() + '.jpg'
  }

    public formatDate(iso:string | null) {
      if (iso == null) return 'On Time'
    return new Date(iso).toLocaleString('sr-RS')
  }

  public formatValue(str: string | null ){
    if(str == null ) return 'N/A'
    return str
  }
  

}
