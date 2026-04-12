import type { FlightResult, FlightFilters, FlightSortBy } from '@/types';

export const INITIAL_FILTERS: FlightFilters = {
  directOnly: false,
  refundableOnly: false,
  minPrice: null,
  maxPrice: null,
  airlineCodes: [],
  cabinClasses: [],
  farePackages: [],
  departureTimeFrom: null,
  departureTimeTo: null,
};

export function filterFlights(flights: FlightResult[], filters: FlightFilters): FlightResult[] {
  let result = flights;

  if (filters.directOnly) {
    result = result.filter(f => f.isDirect);
  }

  if (filters.refundableOnly) {
    result = result.filter(f => f.isRefundable);
  }

  if (filters.minPrice != null) {
    result = result.filter(f => f.totalFare >= filters.minPrice!);
  }

  if (filters.maxPrice != null) {
    result = result.filter(f => f.totalFare <= filters.maxPrice!);
  }

  if (filters.airlineCodes.length > 0) {
    result = result.filter(f =>
      f.airlineCode != null && filters.airlineCodes.includes(f.airlineCode)
    );
  }

  if (filters.cabinClasses.length > 0) {
    result = result.filter(f =>
      f.cabinClassName != null && filters.cabinClasses.includes(f.cabinClassName)
    );
  }

  if (filters.farePackages.length > 0) {
    result = result.filter(f =>
      f.farePackages?.some(p =>
        p.brandName != null && filters.farePackages.includes(p.brandName)
      )
    );
  }

  if (filters.departureTimeFrom && filters.departureTimeTo) {
    result = result.filter(f =>
      f.departureTime != null &&
      f.departureTime >= filters.departureTimeFrom! &&
      f.departureTime <= filters.departureTimeTo!
    );
  }

  return result;
}

export function sortFlights(flights: FlightResult[], sortBy: FlightSortBy): FlightResult[] {
  const sorted = [...flights];

  switch (sortBy) {
    case 'cheapest':
      return sorted.sort((a, b) => a.totalFare - b.totalFare);
    case 'expensive':
      return sorted.sort((a, b) => b.totalFare - a.totalFare);
    case 'earliest':
      return sorted.sort((a, b) => (a.departureTime ?? '').localeCompare(b.departureTime ?? ''));
    case 'latest':
      return sorted.sort((a, b) => (b.departureTime ?? '').localeCompare(a.departureTime ?? ''));
    case 'arrival':
      return sorted.sort((a, b) => (a.arrivalTime ?? '').localeCompare(b.arrivalTime ?? ''));
    case 'shortest':
      return sorted.sort((a, b) =>
        (a.durationHours * 60 + a.durationMinutes) -
        (b.durationHours * 60 + b.durationMinutes)
      );
    case 'stops':
      return sorted.sort((a, b) => a.stopCount - b.stopCount || a.totalFare - b.totalFare);
    case 'airline':
      return sorted.sort((a, b) => (a.airlineName ?? '').localeCompare(b.airlineName ?? ''));
    default:
      return sorted;
  }
}
