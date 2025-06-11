import { Pet } from "./pet.model";

export interface Order {
  id: number;
  pets: Pet[];
  user_id: number | null;
  status: 'u korpi' | 'rezervisano' | 'u toku' | 'preuzeto' | 'otkazano' | null;
  rating: number | null;
  created_at: string | null; // ISO string timestamp
}