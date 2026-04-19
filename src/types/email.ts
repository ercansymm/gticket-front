// ========== EMAIL — Send Search Results ==========

export interface FlightSearchEmailFlight {
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  departureDate: string; // ISO date "2026-05-15"
  departureTime: string; // "10:00"
  arrivalDate: string;
  arrivalTime: string;
  totalFare: number;
  currency: string;
}

export interface SendSearchResultsRequest {
  toEmail: string;
  passengerName?: string;
  origin: string;
  destination: string;
  departureDate: string;
  passengerCount: number;
  flights: FlightSearchEmailFlight[];
}

export interface EmailApiResponse {
  hasError: boolean;
  errorMessage: string | null;
  data?: string | null;
  message?: string | null;
}

export type EmailSendStatus = "idle" | "loading" | "success" | "error";
