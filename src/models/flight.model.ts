export interface FlightModel {
    "id": number,
    "type": {
        "id": number,
        "name": string
    },
    "flightKey": string,
    "flightNumber": string,
    "destination": string,
    "scheduledAt": string,
    "estimatedAt": string | null,
    "connectedType": number,
    "connectedFlight": string | null,
    "plane": string,
    "gate": string | null,
    "terminal": number
}