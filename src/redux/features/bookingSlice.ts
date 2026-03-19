import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { BookPassenger, ContactInfo } from '@/types';

type BookingStep = 'search' | 'select' | 'passenger' | 'summary' | 'payment' | 'confirmation';

interface BookingState {
  currentStep: BookingStep;

  // Yolcu bilgileri
  passengers: BookPassenger[];
  contactInfo: ContactInfo | null;
}

const initialState: BookingState = {
  currentStep: 'search',
  passengers: [],
  contactInfo: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<BookingStep>) => {
      state.currentStep = action.payload;
    },
    setPassengers: (state, action: PayloadAction<BookPassenger[]>) => {
      state.passengers = action.payload;
    },
    setContactInfo: (state, action: PayloadAction<ContactInfo>) => {
      state.contactInfo = action.payload;
    },
    resetBooking: () => initialState,
  },
});

export const { setStep, setPassengers, setContactInfo, resetBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
