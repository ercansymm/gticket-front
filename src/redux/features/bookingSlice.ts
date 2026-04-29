import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { updatePassengers, makePreBooking, prepareBooking } from '../../api/flight';
import { searchFlightsThunk } from './flightSlice';
import type {
  PassengerItem, ContactInfo,
  UpdatePassengersClientRequest, UpdatePassengersResponse,
  MakePreBookingClientRequest, MakePreBookingResponse,
  PrepareBookingClientRequest,
} from '@/types/booking';

/** Field-level Zod hata detaylarını Türkçe kullanıcı mesajına çevirir */
const FIELD_LABELS: Record<string, string> = {
  firstName: 'Ad',
  lastName: 'Soyad',
  gender: 'Cinsiyet',
  birthDate: 'Doğum tarihi',
  citizenNo: 'TC kimlik no',
  passportNo: 'Pasaport no',
  passportCountry: 'Pasaport ülkesi',
  nationality: 'Uyruk',
  phone: 'Telefon',
  email: 'E-posta',
  sequenceNo: 'Yolcu sırası',
  paxType: 'Yolcu tipi',
};

function formatValidationDetails(details: Array<{ field: string; message: string }>): string {
  return details
    .map(d => {
      // "passengers.0.firstName" → field = "firstName", paxIndex = 0
      const parts = d.field.split('.');
      const fieldName = parts[parts.length - 1];
      const label = FIELD_LABELS[fieldName] || fieldName;
      const paxMatch = d.field.match(/passengers\.(\d+)/);
      const prefix = paxMatch ? `${Number(paxMatch[1]) + 1}. yolcu — ` : '';
      return `${prefix}${label}: ${d.message}`;
    })
    .join('; ');
}

/** Backend'den gelen 4 farklı hata formatını tek mesaja çevirir */
function extractErrorMessage(error: any, fallback: string): string {
  // Zod validation details varsa, alan bazlı hata mesajı döndür
  const details = error.response?.data?.details;
  if (Array.isArray(details) && details.length > 0) {
    return formatValidationDetails(details);
  }

  return error.userMessage
    || error.response?.data?.errorMessage
    || error.response?.data?.error
    || (typeof error.response?.data?.error === 'object' ? error.response?.data?.error?.message : undefined)
    || error.message
    || fallback;
}

/** Teknik/provider hata mesajlarını kullanıcı dostu Türkçe mesajlara çevirir */
function mapProviderError(rawMsg: string | null | undefined, fallback: string): string {
  if (!rawMsg) return fallback;
  const lower = rawMsg.toLowerCase();

  // Specific provider errors → Turkish user-friendly messages
  if (lower.includes('not enough seat'))
    return 'Seçilen uçuşta yeterli koltuk kalmamış. Lütfen farklı bir uçuş veya tarife seçin.';
  if (lower.includes('check flight number') || lower.includes('enhancedairbookrq'))
    return 'Havayolu uçuş bilgilerini doğrulayamadı. Lütfen yeni arama yapıp tekrar deneyin.';
  if (lower.includes('nullable object must have a value'))
    return 'Havayolu sağlayıcısında beklenmeyen bir hata oluştu. Lütfen farklı bir uçuş deneyin.';
  if (lower.includes('providermakereservationerror') || lower.includes('provider'))
    return 'Havayolu sağlayıcısında bir hata oluştu. Lütfen farklı bir uçuş veya tarife deneyin.';
  if (lower.includes('timeout') || lower.includes('zaman asimi'))
    return 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.';
  if (lower.includes('session') && (lower.includes('expired') || lower.includes('suresi')))
    return 'Oturum süresi dolmuş. Lütfen yeni arama yapın.';
  return rawMsg;
}

/** updatePassengers + makePreBooking tek BFF çağrısında yapar — 1 round-trip azaltır */
export const prepareBookingThunk = createAsyncThunk(
  'booking/prepareBooking',
  async (params: PrepareBookingClientRequest, { rejectWithValue }) => {
    const attempt = async () => {
      try {
        const result = await prepareBooking(params);
        if (!result) return { ok: false as const, step: 'makePreBooking', msg: 'Sunucudan yanıt alınamadı' };
        if (result.hasError) return { ok: false as const, step: 'makePreBooking', msg: result.errorMessage ?? '' };
        return { ok: true as const, data: result };
      } catch (error: any) {
        const step = error.response?.data?.errorStep ?? 'makePreBooking';
        const msg = extractErrorMessage(error, 'Rezervasyon oluşturulamadı');
        return { ok: false as const, step: step as string, msg };
      }
    };

    const first = await attempt();
    if (first.ok) return first.data;

    // Geçici provider hatalarında (sadece prebooking adımında) bir kez otomatik retry
    const lower = (first.msg ?? '').toLowerCase();
    const isTransient = first.step !== 'updatePassengers' &&
      (lower.includes('provider') || lower.includes('nullable object') ||
        lower.includes('check flight number') || lower.includes('not enough seat'));

    if (isTransient) {
      console.info('[PrepareBooking] Transient error, retrying once...');
      await new Promise(r => setTimeout(r, 500));
      const retry = await attempt();
      if (retry.ok) return retry.data;
      const msg = retry.step === 'updatePassengers'
        ? mapProviderError(retry.msg, 'Yolcu bilgileri güncellenemedi')
        : mapProviderError(retry.msg, 'Rezervasyon oluşturulamadı');
      return rejectWithValue({ step: retry.step, message: msg });
    }

    const errMsg = first.step === 'updatePassengers'
      ? mapProviderError(first.msg, 'Yolcu bilgileri güncellenemedi')
      : mapProviderError(first.msg, 'Rezervasyon oluşturulamadı');
    return rejectWithValue({ step: first.step, message: errMsg });
  }
);

type BookingStep = 'search' | 'select' | 'passenger' | 'summary' | 'payment' | 'confirmation';

interface BookingState {
  currentStep: BookingStep;
  passengers: PassengerItem[];
  contactInfo: ContactInfo | null;

  updatePassengersLoading: boolean;
  updatePassengersError: string | null;
  updatePassengersDone: boolean;

  preBookingResult: MakePreBookingResponse | null;
  preBookingLoading: boolean;
  preBookingError: string | null;
}

const initialState: BookingState = {
  currentStep: 'search',
  passengers: [],
  contactInfo: null,
  updatePassengersLoading: false,
  updatePassengersError: null,
  updatePassengersDone: false,
  preBookingResult: null,
  preBookingLoading: false,
  preBookingError: null,
};

export const updatePassengersThunk = createAsyncThunk(
  'booking/updatePassengers',
  async (params: UpdatePassengersClientRequest, { rejectWithValue }) => {
    try {
      const result = await updatePassengers(params);
      if (!result) {
        return rejectWithValue('Yolcu bilgileri güncellenemedi: Sunucudan yanıt alınamadı');
      }
      if (result?.hasError) {
        return rejectWithValue(result?.errorMessage ?? 'Yolcu bilgileri güncellenemedi');
      }
      return result;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Yolcu bilgileri güncellenemedi'));
    }
  }
);

export const makePreBookingThunk = createAsyncThunk(
  'booking/makePreBooking',
  async (params: MakePreBookingClientRequest, { rejectWithValue }) => {
    const attempt = async () => {
      const result = await makePreBooking(params);
      if (!result) {
        return { ok: false as const, msg: 'Ön rezervasyon oluşturulamadı: Sunucudan yanıt alınamadı' };
      }
      if (result?.hasError) {
        const raw = result?.errorMessage ?? '';
        console.warn('[MakePreBooking] Provider error:', raw);
        return { ok: false as const, msg: raw };
      }
      return { ok: true as const, data: result };
    };

    try {
      // First attempt
      const first = await attempt();
      if (first.ok) return first.data;

      // Transient provider errors → one automatic retry
      const lower = (first.msg ?? '').toLowerCase();
      const isTransient = lower.includes('provider') || lower.includes('nullable object')
        || lower.includes('check flight number') || lower.includes('not enough seat');

      if (isTransient) {
        console.info('[MakePreBooking] Transient error, retrying once...');
        await new Promise(r => setTimeout(r, 1500));
        const retry = await attempt();
        if (retry.ok) return retry.data;
        return rejectWithValue(mapProviderError(retry.msg, 'Ön rezervasyon oluşturulamadı'));
      }

      return rejectWithValue(mapProviderError(first.msg, 'Ön rezervasyon oluşturulamadı'));
    } catch (error: any) {
      const raw = extractErrorMessage(error, 'Ön rezervasyon oluşturulamadı');
      console.warn('[MakePreBooking] Exception:', raw);
      return rejectWithValue(mapProviderError(raw, 'Ön rezervasyon oluşturulamadı'));
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<BookingStep>) => {
      state.currentStep = action.payload;
    },
    setPassengers: (state, action: PayloadAction<PassengerItem[]>) => {
      state.passengers = action.payload;
    },
    setContactInfo: (state, action: PayloadAction<ContactInfo>) => {
      state.contactInfo = action.payload;
    },
    resetBooking: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(updatePassengersThunk.pending, (state) => {
      state.updatePassengersLoading = true;
      state.updatePassengersError = null;
    });
    builder.addCase(updatePassengersThunk.fulfilled, (state) => {
      state.updatePassengersLoading = false;
      state.updatePassengersDone = true;
    });
    builder.addCase(updatePassengersThunk.rejected, (state, action) => {
      state.updatePassengersLoading = false;
      state.updatePassengersError = action.payload as string;
    });

    builder.addCase(makePreBookingThunk.pending, (state) => {
      state.preBookingLoading = true;
      state.preBookingError = null;
    });
    builder.addCase(makePreBookingThunk.fulfilled, (state, action) => {
      state.preBookingLoading = false;
      state.preBookingResult = action.payload;
    });
    builder.addCase(makePreBookingThunk.rejected, (state, action) => {
      state.preBookingLoading = false;
      state.preBookingError = action.payload as string;
    });

    builder.addCase(prepareBookingThunk.pending, (state) => {
      state.updatePassengersLoading = true;
      state.updatePassengersError = null;
      state.preBookingLoading = true;
      state.preBookingError = null;
    });
    builder.addCase(prepareBookingThunk.fulfilled, (state, action) => {
      state.updatePassengersLoading = false;
      state.updatePassengersDone = true;
      state.preBookingLoading = false;
      state.preBookingResult = action.payload;
    });
    builder.addCase(prepareBookingThunk.rejected, (state, action) => {
      const payload = action.payload as { step: string; message: string } | undefined;
      state.updatePassengersLoading = false;
      state.preBookingLoading = false;
      if (payload?.step === 'updatePassengers') {
        state.updatePassengersError = payload.message;
      } else {
        state.preBookingError = payload?.message ?? 'Rezervasyon oluşturulamadı';
      }
    });

    // Auto-reset when a new search starts — prevents stale booking data leaking into new searches
    builder.addCase(searchFlightsThunk.pending, () => initialState);
  },
});

export const { setStep, setPassengers, setContactInfo, resetBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
