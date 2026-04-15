import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  makePayment,
  finalizeShopping,
  pokeShoppingFile,
  readShoppingFile,
  removeProduct,
  logoutSession,
  getBookingById,
  getBookingByPnr,
  lookupBookingByPnrAndLastName,
  cancelBooking,
  getBookingStatus,
} from '../../api/flight';
import { searchFlightsThunk } from './flightSlice';
import type {
  MakePaymentClientRequest, MakePaymentResponse,
  FinalizeShoppingClientRequest, FinalizeShoppingResponse,
  PokeShoppingFileClientRequest, PokeShoppingFileResponse,
  ReadShoppingFileClientRequest, ReadShoppingFileResponse,
  RemoveProductClientRequest, RemoveProductResponse,
  LogoutClientRequest, LogoutResponse,
  BookingDetailResponse,
  CancelBookingClientRequest, CancelBookingResponse,
  BookingStatusRequest, BookingStatusResponse,
} from '@/types/flight';

/** Backend'den gelen 4 farklı hata formatını tek mesaja çevirir */
function extractErrorMessage(error: any, fallback: string): string {
  return error.userMessage
    || error.response?.data?.errorMessage
    || error.response?.data?.error
    || (typeof error.response?.data?.error === 'object' ? error.response?.data?.error?.message : undefined)
    || error.message
    || fallback;
}

interface PaymentState {
  // Ödeme
  paymentResult: MakePaymentResponse | null;
  paymentLoading: boolean;
  paymentError: string | null;

  // 3DS
  is3DSecureRequired: boolean;
  threeDSecureUrl: string | null;
  threeDSecureHtml: string | null;

  // Biletleme
  finalizeResult: FinalizeShoppingResponse | null;
  finalizeLoading: boolean;
  finalizeError: string | null;

  // Durum sorgulama
  pokeResult: PokeShoppingFileResponse | null;
  pokeLoading: boolean;

  // Tam detay
  readResult: ReadShoppingFileResponse | null;
  readLoading: boolean;

  // Remove product
  removeLoading: boolean;
  removeError: string | null;

  // Booking query
  bookingDetail: BookingDetailResponse | null;
  bookingDetailLoading: boolean;
  bookingDetailError: string | null;

  // Cancel booking
  cancelLoading: boolean;
  cancelError: string | null;
  cancelResult: CancelBookingResponse | null;

  // Booking status
  bookingStatusResult: BookingStatusResponse | null;
  bookingStatusLoading: boolean;
}

const initialState: PaymentState = {
  paymentResult: null,
  paymentLoading: false,
  paymentError: null,
  is3DSecureRequired: false,
  threeDSecureUrl: null,
  threeDSecureHtml: null,
  finalizeResult: null,
  finalizeLoading: false,
  finalizeError: null,
  pokeResult: null,
  pokeLoading: false,
  readResult: null,
  readLoading: false,
  removeLoading: false,
  removeError: null,
  bookingDetail: null,
  bookingDetailLoading: false,
  bookingDetailError: null,
  cancelLoading: false,
  cancelError: null,
  cancelResult: null,
  bookingStatusResult: null,
  bookingStatusLoading: false,
};

export const makePaymentThunk = createAsyncThunk(
  'payment/makePayment',
  async (params: MakePaymentClientRequest, { rejectWithValue }) => {
    try {
      const result = await makePayment(params);
      // Ödeme başarılıysa hasError olsa bile devam et (backend tutarsız dönebiliyor)
      if (result.hasError && !result.isPaymentSuccessful) {
        return rejectWithValue(result.errorMessage || 'Ödeme başarısız');
      }
      return result;
    } catch (error: any) {
      // Backend hasError:true dönse bile isPaymentSuccessful:true ise ödeme alınmış demektir
      const data = error.response?.data;
      if (data?.isPaymentSuccessful) {
        return data as MakePaymentResponse;
      }
      return rejectWithValue(extractErrorMessage(error, 'Ödeme başarısız'));
    }
  },
);

export const finalizeShoppingThunk = createAsyncThunk(
  'payment/finalizeShopping',
  async (params: FinalizeShoppingClientRequest, { rejectWithValue }) => {
    try {
      const result = await finalizeShopping(params);
      if (result.hasError) {
        return rejectWithValue(result.errorMessage || 'Biletleme başarısız');
      }
      return result;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Biletleme başarısız'));
    }
  },
  {
    condition: (_, { getState }) => {
      const { payment } = getState() as { payment: PaymentState };
      // Prevent duplicate dispatch while already loading, already finalized, or already errored
      if (payment.finalizeLoading) return false;
      if (payment.finalizeResult && !payment.finalizeResult.hasError) return false;
      if (payment.finalizeError) return false;
      return true;
    },
  },
);

export const pokeShoppingFileThunk = createAsyncThunk(
  'payment/pokeShoppingFile',
  async (params: PokeShoppingFileClientRequest, { rejectWithValue }) => {
    try {
      const result = await pokeShoppingFile(params);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Durum sorgulama başarısız');
    }
  },
);

export const readShoppingFileThunk = createAsyncThunk(
  'payment/readShoppingFile',
  async (params: ReadShoppingFileClientRequest, { rejectWithValue }) => {
    try {
      const result = await readShoppingFile(params);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Detay okuma başarısız');
    }
  },
);

export const removeProductThunk = createAsyncThunk(
  'payment/removeProduct',
  async (params: RemoveProductClientRequest, { rejectWithValue }) => {
    try {
      const result = await removeProduct(params);
      if (result.hasError) {
        return rejectWithValue(result.errorMessage || 'Ürün kaldırma başarısız');
      }
      return result;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Ürün kaldırma başarısız'));
    }
  },
);

export const logoutSessionThunk = createAsyncThunk(
  'payment/logout',
  async (params: LogoutClientRequest, { rejectWithValue }) => {
    try {
      const result = await logoutSession(params);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Oturum kapatma başarısız');
    }
  },
);

export const getBookingByIdThunk = createAsyncThunk(
  'payment/getBookingById',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const result = await getBookingById(bookingId);
      if (result.hasError) {
        return rejectWithValue(result.errorMessage || 'Booking bulunamadı');
      }
      return result;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Booking bulunamadı'));
    }
  },
);

export const getBookingByPnrThunk = createAsyncThunk(
  'payment/getBookingByPnr',
  async ({ pnr, lastName }: { pnr: string; lastName: string }, { rejectWithValue }) => {
    try {
      const result = await lookupBookingByPnrAndLastName(pnr, lastName);
      if (result.hasError) {
        return rejectWithValue(result.errorMessage || 'PNR bulunamadı');
      }
      return result;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Girilen PNR ve soyad ile eşleşen rezervasyon bulunamadı'));
    }
  },
);

export const cancelBookingThunk = createAsyncThunk(
  'payment/cancelBooking',
  async (params: CancelBookingClientRequest, { rejectWithValue }) => {
    try {
      const result = await cancelBooking(params);
      if (result.hasError) {
        return rejectWithValue(result.errorMessage || 'İptal başarısız');
      }
      return result;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'İptal başarısız'));
    }
  },
);

export const getBookingStatusThunk = createAsyncThunk(
  'payment/getBookingStatus',
  async (params: BookingStatusRequest, { rejectWithValue }) => {
    try {
      const result = await getBookingStatus(params);
      if (result.hasError) {
        return rejectWithValue(result.errorMessage || 'Durum sorgulama başarısız');
      }
      return result;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Durum sorgulama başarısız'));
    }
  },
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPayment: () => initialState,
    clearPaymentError: (state) => {
      state.paymentError = null;
    },
    clearFinalizeError: (state) => {
      state.finalizeError = null;
    },
    clearBookingDetail: (state) => {
      state.bookingDetail = null;
      state.bookingDetailError = null;
    },
  },
  extraReducers: (builder) => {
    // Make Payment
    builder.addCase(makePaymentThunk.pending, (state) => {
      state.paymentLoading = true;
      state.paymentError = null;
    });
    builder.addCase(makePaymentThunk.fulfilled, (state, action) => {
      state.paymentLoading = false;
      state.paymentResult = action.payload;
      state.is3DSecureRequired = action.payload.is3DSecureRequired;
      state.threeDSecureUrl = action.payload.threeDSecureUrl;
      state.threeDSecureHtml = action.payload.threeDSecureHtml;
    });
    builder.addCase(makePaymentThunk.rejected, (state, action) => {
      state.paymentLoading = false;
      state.paymentError = action.payload as string;
    });

    // Finalize Shopping
    builder.addCase(finalizeShoppingThunk.pending, (state) => {
      state.finalizeLoading = true;
      state.finalizeError = null;
    });
    builder.addCase(finalizeShoppingThunk.fulfilled, (state, action) => {
      state.finalizeLoading = false;
      state.finalizeResult = action.payload;
    });
    builder.addCase(finalizeShoppingThunk.rejected, (state, action) => {
      state.finalizeLoading = false;
      state.finalizeError = action.payload as string;
    });

    // Poke Shopping File
    builder.addCase(pokeShoppingFileThunk.pending, (state) => {
      state.pokeLoading = true;
    });
    builder.addCase(pokeShoppingFileThunk.fulfilled, (state, action) => {
      state.pokeLoading = false;
      state.pokeResult = action.payload;
    });
    builder.addCase(pokeShoppingFileThunk.rejected, (state) => {
      state.pokeLoading = false;
    });

    // Read Shopping File
    builder.addCase(readShoppingFileThunk.pending, (state) => {
      state.readLoading = true;
    });
    builder.addCase(readShoppingFileThunk.fulfilled, (state, action) => {
      state.readLoading = false;
      state.readResult = action.payload;
    });
    builder.addCase(readShoppingFileThunk.rejected, (state) => {
      state.readLoading = false;
    });

    // Remove Product
    builder.addCase(removeProductThunk.pending, (state) => {
      state.removeLoading = true;
      state.removeError = null;
    });
    builder.addCase(removeProductThunk.fulfilled, (state) => {
      state.removeLoading = false;
    });
    builder.addCase(removeProductThunk.rejected, (state, action) => {
      state.removeLoading = false;
      state.removeError = action.payload as string;
    });

    // Get Booking By ID
    builder.addCase(getBookingByIdThunk.pending, (state) => {
      state.bookingDetailLoading = true;
      state.bookingDetailError = null;
    });
    builder.addCase(getBookingByIdThunk.fulfilled, (state, action) => {
      state.bookingDetailLoading = false;
      state.bookingDetail = action.payload;
    });
    builder.addCase(getBookingByIdThunk.rejected, (state, action) => {
      state.bookingDetailLoading = false;
      state.bookingDetailError = action.payload as string;
    });

    // Get Booking By PNR
    builder.addCase(getBookingByPnrThunk.pending, (state) => {
      state.bookingDetailLoading = true;
      state.bookingDetailError = null;
    });
    builder.addCase(getBookingByPnrThunk.fulfilled, (state, action) => {
      state.bookingDetailLoading = false;
      state.bookingDetail = action.payload;
    });
    builder.addCase(getBookingByPnrThunk.rejected, (state, action) => {
      state.bookingDetailLoading = false;
      state.bookingDetailError = action.payload as string;
    });

    // Cancel Booking
    builder.addCase(cancelBookingThunk.pending, (state) => {
      state.cancelLoading = true;
      state.cancelError = null;
    });
    builder.addCase(cancelBookingThunk.fulfilled, (state, action) => {
      state.cancelLoading = false;
      state.cancelResult = action.payload;
    });
    builder.addCase(cancelBookingThunk.rejected, (state, action) => {
      state.cancelLoading = false;
      state.cancelError = action.payload as string;
    });

    // Booking Status
    builder.addCase(getBookingStatusThunk.pending, (state) => {
      state.bookingStatusLoading = true;
    });
    builder.addCase(getBookingStatusThunk.fulfilled, (state, action) => {
      state.bookingStatusLoading = false;
      state.bookingStatusResult = action.payload;
    });
    builder.addCase(getBookingStatusThunk.rejected, (state) => {
      state.bookingStatusLoading = false;
    });

    // Auto-reset when a new search starts — prevents stale payment/finalize data leaking into new searches
    builder.addCase(searchFlightsThunk.pending, () => initialState);

    // Finalize timeout (dispatched manually after 60s) — must be after all addCase calls
    builder.addMatcher(
      (action) => action.type === 'payment/finalizeTimeout',
      (state) => {
        if (state.finalizeLoading) {
          state.finalizeLoading = false;
          state.finalizeError = 'Biletleme zaman aşımına uğradı. Lütfen bilet sorgulama sayfasından durumunuzu kontrol edin.';
        }
      },
    );
  },
});

export const { resetPayment, clearPaymentError, clearFinalizeError, clearBookingDetail } = paymentSlice.actions;
export default paymentSlice.reducer;
