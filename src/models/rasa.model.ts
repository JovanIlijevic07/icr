import { Pet} from "./pet.model"

export interface RasaModel {
   recipient_id: string
   image: string | null
   attachment: Pet[] | null
   text: string | null
}