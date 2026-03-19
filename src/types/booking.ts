// ========== BOOK (Rezervasyon) ==========

export interface BookRequest {
  sessionId: string;
  sessionToken: string;
  shoppingFileId: string;
  productId: string;
  productItemId: string;
  passengers: BookPassenger[];
  contact: ContactInfo;
}

export interface BookPassenger {
  paxType: string;
  sequenceNo: number;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  citizenNo: string | null;
  passportNo: string | null;
  passportCountry: string | null;
  passportExpiry: string | null;
  nationality: string;
  tempTag: string;
  paxReferenceId: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface BookResponse {
  hasError: boolean;
  errorMessage: string | null;
  pnr: string;
  status: string;
  totalFare: number;
}
