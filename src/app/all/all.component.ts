import { Component, OnInit } from '@angular/core';
import { Pet } from '../../models/pet.model';
import { WebService } from '../web.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { CartService } from '../basket.service';

@Component({
  selector: 'app-all',
  imports: [FormsModule,ReactiveFormsModule,NgFor,NgIf],
  templateUrl: './all.component.html',
  styleUrl: './all.component.css'
})
export class AllComponent implements OnInit {
 
 public webService: WebService
  pets: Pet[] = [];
  filteredPets: Pet[] = [];
  filterForm!: FormGroup;
  origins: string[] = [];
  cart: Pet[] = [];

  constructor(private fb: FormBuilder,private cartService: CartService) {
    this.webService =WebService.getInstance()
  }

  
    loadPets(): void {
      this.webService.getPets().subscribe(data => {
        this.pets = data;
        this.filteredPets = data;
  
        // Dinamičko punjenje unikatnih porekla
        const originsSet = new Set<string>();
        this.pets.forEach(pet => originsSet.add(pet.origin));
        this.origins = Array.from(originsSet);
      });
    }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      species: [''],
      minPrice: [''],
      maxPrice: [''],
      age: [''],
      size: [''],
      origin: ['']
    });

    this.loadPets();
    this.loadOrigins();
  }

  loadOrigins(): void {
  this.webService.getOrigins().subscribe(data => {
    this.origins = data;
  });
}


  applyFilters(): void {
    let { species, minPrice, maxPrice, age, size, origin } = this.filterForm.value;

    species = species?.trim().toLowerCase() || '';
    size = size?.trim().toLowerCase() || '';
    origin = origin?.trim().toLowerCase() || '';

    minPrice = minPrice ? Number(minPrice) : null;
    maxPrice = maxPrice ? Number(maxPrice) : null;
    age = age ? Number(age) : null;

    this.filteredPets = this.pets.filter(pet => {
      const matchesSpecies = species ? pet.species.toLowerCase() === species : true;
      const matchesMinPrice = minPrice !== null ? pet.price >= minPrice : true;
      const matchesMaxPrice = maxPrice !== null ? pet.price <= maxPrice : true;
      const matchesAge = age !== null ? pet.age === age : true;
      const matchesSize = size ? pet.size.toLowerCase() === size : true;
      const matchesOrigin = origin ? pet.origin.toLowerCase() === origin : true;

      return (
        matchesSpecies &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesAge &&
        matchesSize &&
        matchesOrigin
      );
    });
  }

  // Provera da li je korisnik ulogovan
  isLoggedIn(): boolean {
    return this.webService.isLoggedIn();
  }

  // Metoda za dodavanje ljubimca u korpu
  addPetToCart(pet: Pet) {
    this.cartService.addToCart(pet);
    alert(`${pet.name} je dodat u korpu!`);
  }
}
