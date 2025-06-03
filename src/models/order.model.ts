export interface Order {
  id: number;
  user_id: number | null;
  pet_id: number | null;
  status: 'u korpi' | 'rezervisano' | 'u toku' | 'preuzeto' | 'otkazano' | null;
  rating: number | null;
  created_at: string | null; // ISO string timestamp
}