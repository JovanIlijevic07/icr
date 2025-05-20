import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WebService } from '../web.service';
import { Pet } from '../../models/pet.model';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-dogs',
  standalone:true,
  imports: [HttpClientModule,RouterLink,NgIf,NgFor],
  templateUrl: './dogs.component.html',
  styleUrl: './dogs.component.css'
})
export class DogsComponent implements OnInit {

  public webService:WebService
  dogs: Pet[] = [];

 constructor() {
      this.webService =WebService.getInstance()
  }

  ngOnInit(): void {
    this.webService.getAllPets().subscribe((pets: Pet[]) => {
      console.log('Svi ljubimci:', pets);
      this.dogs = pets.filter(pet => pet.species?.toLowerCase().trim() === 'pas');
      console.log('Filtrirani psi:', this.dogs);
    });
  }
}