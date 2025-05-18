import { Review } from './review.model';
export interface Pet {
  id: number;
  name: string;
  description: string;
  species: string;     
  age: string;          
  size: string;          
  origin: string;        
  price: number;        
  image_url: string;
  reviews: Review[];
}