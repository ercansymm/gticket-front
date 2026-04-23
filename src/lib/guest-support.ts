// Misafir destek oturumu için sessionStorage tabanlı küçük helper.
// sessionStorage seçildi: tab kapanınca otomatik silinir, başka tab'a sızmaz.

const TOKEN_KEY = "guestSupportToken";
const EXPIRES_KEY = "guestSupportExpiresAt";
const PNR_KEY = "guestSupportPnr";
const NAME_KEY = "guestSupportName";
const BOOKING_ID_KEY = "guestSupportBookingId";

export interface GuestSupportSession {
  token: string;
  expiresAt: string;
  pnr: string;
  passengerDisplayName: string;
  bookingId: string;
}

export function saveGuestSession(session: GuestSupportSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, session.token);
  sessionStorage.setItem(EXPIRES_KEY, session.expiresAt);
  sessionStorage.setItem(PNR_KEY, session.pnr);
  sessionStorage.setItem(NAME_KEY, session.passengerDisplayName);
  sessionStorage.setItem(BOOKING_ID_KEY, session.bookingId);
}

export function getGuestSession(): GuestSupportSession | null {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiresAt = sessionStorage.getItem(EXPIRES_KEY);
  const pnr = sessionStorage.getItem(PNR_KEY);
  const passengerDisplayName = sessionStorage.getItem(NAME_KEY);
  const bookingId = sessionStorage.getItem(BOOKING_ID_KEY);
  if (!token || !expiresAt || !pnr || !passengerDisplayName || !bookingId) return null;

  // Süresi dolmuş ise temizle
  if (new Date(expiresAt).getTime() < Date.now()) {
    clearGuestSession();
    return null;
  }
  return { token, expiresAt, pnr, passengerDisplayName, bookingId };
}

export function clearGuestSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EXPIRES_KEY);
  sessionStorage.removeItem(PNR_KEY);
  sessionStorage.removeItem(NAME_KEY);
  sessionStorage.removeItem(BOOKING_ID_KEY);
}

// Proxy fetch helper — token + display name header'ları otomatik ekler
export async function guestFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const sess = getGuestSession();
  if (!sess) throw new Error("GUEST_SESSION_MISSING");

  const headers = new Headers(init.headers || {});
  headers.set("X-Guest-Support-Token", sess.token);
  headers.set("X-Guest-Display-Name", sess.passengerDisplayName);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, { ...init, headers, cache: "no-store" });
}
