import { Component, OnInit } from '@angular/core';
import { WebService } from '../web.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Pet } from '../../models/pet.model';
import { NgIf } from '@angular/common';
import { CartService } from '../basket.service';

@Component({
  selector: 'app-pet',
  imports: [RouterLink,NgIf],
  templateUrl: './pet.component.html',
  styleUrl: './pet.component.css'
})
export class PetComponent implements OnInit{

  public webService:WebService
  public pet!:Pet;

  constructor(private route: ActivatedRoute,private cartService: CartService) {
        this.webService =WebService.getInstance()
    }

    ngOnInit() {
    const petId = this.route.snapshot.paramMap.get('id');
    if (petId) {
      this.webService.getPetById(+petId).subscribe(pet => {
        this.pet = pet;
      });
    }
  }

  addToCart(pet: Pet) {
    this.cartService.addToCart(pet);
    alert(`${pet.name} je dodat u korpu!`);
  }

}
