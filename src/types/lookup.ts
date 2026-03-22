// ========== HAVALİMANI & LOOKUP ==========

export interface Airport {
  code: string;
  nameTr: string;
  nameEn: string;
  cityTr: string;
  cityEn: string;
  countryCode: string;
  isDomestic: boolean;
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
