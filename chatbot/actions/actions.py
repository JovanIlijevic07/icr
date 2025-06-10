import requests
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

BACKEND_URL = "http://localhost:3000/api"

def map_year_to_range(year_text):
    if not year_text:
        return None
    year_text = year_text.lower()
    if year_text == "young":
        return [1, 2, 3]
    elif year_text == "old":
        return [4, 5, 6, 7, 8, 9, 10]
    else:
        try:
            year_int = int(year_text)
            return [year_int]
        except ValueError:
            return None

def translate_size(size_text):
    if not size_text:
        return None
    size_text = size_text.lower()
    translations = {
        "small": "mala",
        "medium": "srednja",
        "big": "velika"
    }
    return translations.get(size_text, size_text)

def translate_origin(origin_text):
    if not origin_text:
        return None
    origin_text = origin_text.lower()
    translations = {
        "serbia": "srbija"
    }
    return translations.get(origin_text, origin_text)

def translate_species(species_text):
    if not species_text:
        return None
    species_text = species_text.lower()
    translations = {
        "dog": "pas",
        "dogs": "pas",
        "cat": "macka",
        "cats": "macka",
        "bird": "ptica",
        "birds": "ptica"
    }
    return translations.get(species_text, species_text)

class ActionSearchPets(Action):
    def name(self) -> Text:
        return "action_search_pets"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        year_slot = tracker.get_slot("age")
        size_slot = tracker.get_slot("size")
        origin_slot = tracker.get_slot("origin")
        species_slot = tracker.get_slot("species")

        year_range = map_year_to_range(year_slot)
        size_translated = translate_size(size_slot)
        origin_translated = translate_origin(origin_slot)
        species_translated = translate_species(species_slot)

        params = {}

        if year_range:
            params["year_min"] = min(year_range)
            params["year_max"] = max(year_range)

        if size_translated:
            params["size"] = size_translated

        if origin_translated:
            params["origin"] = origin_translated

        if species_translated:
            params["species"] = species_translated

        response = requests.get(f"{BACKEND_URL}/pets", params=params)

        if response.status_code == 200:
            pets = response.json()
            if pets:
                msg = "Našao sam sledeće ljubimce:\n"
                for pet in pets:
                    pet_name = pet.get('name', 'N/A')
                    pet_species = pet.get('species', 'N/A')
                    pet_size = pet.get('size', 'nije poznata')
                    pet_origin = pet.get('origin', 'nije poznato')
                    msg += f"- {pet_name}, vrsta: {pet_species}, veličina: {pet_size}, poreklo: {pet_origin}\n"
                dispatcher.utter_message(text=msg)
            else:
                dispatcher.utter_message(text="Nažalost, nisam našao nijednog ljubimca sa tim kriterijumima.")
        else:
            dispatcher.utter_message(text="Došlo je do greške pri pretrazi. Molim pokušaj kasnije.")

        return []

class ActionAddToCart(Action):
    def name(self) -> Text:
        return "action_add_to_cart"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        pet_id = tracker.get_slot("pet_id")

        if not pet_id:
            dispatcher.utter_message(text="Nisam siguran koji ljubimac treba da dodam u korpu.")
            return []
        user_id = tracker.sender_id
        
        print("🟡 Slanje POST ka /api/cart/add sa podacima:", user_id)
        print("🟡 Slanje POST ka /api/cart/add sa podacima:", pet_id)

        if not user_id:
            dispatcher.utter_message(text="Moram znati ko si da dodam ljubimca u korpu. Molim te, prijavi se.")
            return []

        # više ne šaljemo user_id u payload
        payload = {
            "user_id": user_id,
            "pet_id": int(pet_id)
        }
        
        print("🟡 Slanje POST ka /api/cart/add sa podacima:", payload)

        try:
            response = requests.post(f"{BACKEND_URL}/cart/add", json=payload)

            if response.status_code == 200:
                dispatcher.utter_message(text=f"Ljubimac sa ID {pet_id} je dodat u tvoju korpu.")
            else:
                dispatcher.utter_message(text="Došlo je do greške pri dodavanju u korpu.")
        except Exception as e:
            dispatcher.utter_message(text="Došlo je do greške pri komunikaciji sa serverom.")
            print(str(e))

        return []
    
    