import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PageModel } from '../../models/page.model';
import { FlightModel } from '../../models/flight.model';
import { SafePipe } from '../safe.pipe';
import { RouterLink } from '@angular/router';
import { WebService } from '../web.service';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgIf, HttpClientModule,NgFor, CommonModule, SafePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  
  public webService:WebService
  public pets: Pet[]=[]

  constructor() {
      this.webService =WebService.getInstance()
  }
  ngOnInit(): void {
    this.webService.getAllPets().subscribe(pets => {
      this.pets = pets.slice(0, 4); // Prikaz samo 4 ljubimca
    });
  }

}
