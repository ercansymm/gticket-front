import type { FlightResult } from "@/types/flight";
import type { FlightSearchEmailFlight } from "@/types/email";

/**
 * Maps the internal `FlightResult` (nullable string fields) to the strict
 * `FlightSearchEmailFlight` shape expected by the email API. Null values are
 * coerced to empty strings to satisfy the contract.
 */
export function mapToEmailFlights(
  flights: FlightResult[]
): FlightSearchEmailFlight[] {
  return flights.map((f) => ({
    airlineCode: f.airlineCode ?? "",
    airlineName: f.airlineName ?? "",
    flightNumber: f.flightNumber ?? "",
    originCode: f.originCode ?? "",
    originName: f.originName ?? "",
    destinationCode: f.destinationCode ?? "",
    destinationName: f.destinationName ?? "",
    departureDate: f.departureDate ?? "",
    departureTime: f.departureTime ?? "",
    arrivalDate: f.arrivalDate ?? "",
    arrivalTime: f.arrivalTime ?? "",
    totalFare: f.totalFare,
    currency: f.currency ?? "",
  }));
}
