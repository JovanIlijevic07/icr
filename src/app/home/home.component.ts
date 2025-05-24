import { CommonModule, NgFor, NgIf } from '@angular/common';
import {HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SafePipe } from '../safe.pipe';
import { RouterLink } from '@angular/router';
import { WebService } from '../web.service';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgIf, HttpClientModule, NgFor, CommonModule, SafePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  public webService: WebService
  public pets: Pet[] = []

  public carouselImages: string[] = [
    'assets/reklame/curosel1.jpg',
    'assets/reklame/curosel2.jpg',
    'assets/reklame/curosel3.jpg'
  ];

  public advertizments = [
    { img: 'assets/reklame/slika.jpg', title: 'BESPLATNA ISPORUKA',description:'za kupovine veće od 4.000 RSD' },
    { img: 'assets/reklame/reklama2.jpg', title: 'LOYALTY PROGRAM',description:'dodatna ušteda za redovne kupce' },
    { img: 'assets/reklame/reklama3.jpg', title: 'POPUSTI I AKCIJE',description:'svake nedelje bolje cene' },
    { img: 'assets/reklame/reklama4.jpg', title: 'STRUČNA PODRŠKA',description:'u roku od 24h' },

  ];

  constructor() {
    this.webService = WebService.getInstance()
  }
  ngOnInit(): void {
    this.webService.getAllPets().subscribe(pets => {
      this.pets = pets.slice(0, 3); // Prikaz samo 4 ljubimca
    });
  }

}
