// ========== HAVALİMANI & LOOKUP ==========

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  isCity?: boolean;
  countryCode?: string;
}

export interface PopularRoute {
  origin: string;
  destination: string;
  originName: string;
  destinationName: string;
}

export interface City {
  code: string;
  name: string;
  countryCode: string;
}
