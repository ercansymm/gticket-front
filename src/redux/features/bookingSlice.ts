import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { updatePassengers, makePreBooking } from '../../api/flight';
import type {
  PassengerItem, ContactInfo,
  UpdatePassengersClientRequest, UpdatePassengersResponse,
  MakePreBookingClientRequest, MakePreBookingResponse,
} from '@/types/booking';

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
      if (result.hasError) {
        return rejectWithValue(result.errorMessage || 'Yolcu bilgileri güncellenemedi');
      }
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errorMessage || error.message || 'Yolcu bilgileri güncellenemedi');
    }
  }
);

export const makePreBookingThunk = createAsyncThunk(
  'booking/makePreBooking',
  async (params: MakePreBookingClientRequest, { rejectWithValue }) => {
    try {
      const result = await makePreBooking(params);
      if (result.hasError) {
        return rejectWithValue(result.errorMessage || 'Ön rezervasyon oluşturulamadı');
      }
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errorMessage || error.message || 'Ön rezervasyon oluşturulamadı');
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
  },
});

export const { setStep, setPassengers, setContactInfo, resetBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
