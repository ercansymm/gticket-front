import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { searchFlights, allocateFlight } from '../../api/flight';
import type {
  FlightSearchRequest, FlightSearchResponse,
  AllocateClientRequest, AllocateResponse,
  FlightResult
} from '@/types';

/** Backend'den gelen 4 farklı hata formatını tek mesaja çevirir */
function extractErrorMessage(error: any, fallback: string): string {
  return error.userMessage
    || error.response?.data?.errorMessage
    || error.response?.data?.error
    || (typeof error.response?.data?.error === 'object' ? error.response?.data?.error?.message : undefined)
    || error.message
    || fallback;
}

interface FlightState {
  // Arama
  searchParams: FlightSearchRequest | null;
  searchResults: FlightSearchResponse | null;
  searchLoading: boolean;
  searchError: string | null;

  // Seçili uçuş
  selectedFlight: FlightResult | null;

  // Allocate
  allocateResult: AllocateResponse | null;
  allocateLoading: boolean;
  allocateError: string | null;

  // Allocate sonrası tutulan searchId
  searchId: string | null;

  // Session timeout takibi (backend 20dk)
  sessionStartedAt: number | null;
}

const initialState: FlightState = {
  searchParams: null,
  searchResults: null,
  searchLoading: false,
  searchError: null,
  selectedFlight: null,
  allocateResult: null,
  allocateLoading: false,
  allocateError: null,
  searchId: null,
  sessionStartedAt: null,
};

// Uçuş arama
export const searchFlightsThunk = createAsyncThunk(
  'flight/search',
  async (params: FlightSearchRequest, { rejectWithValue }) => {
    try {
      const result = await searchFlights(params);
      return result;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Uçuş araması başarısız'));
    }
  }
);

// Uçuş tahsis — istemci sadece searchId + productId gönderir
export const allocateFlightThunk = createAsyncThunk(
  'flight/allocate',
  async (params: AllocateClientRequest, { rejectWithValue }) => {
    try {
      const result = await allocateFlight(params);
      return result;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Uçuş tahsisi başarısız'));
    }
  }
);

const flightSlice = createSlice({
  name: 'flight',
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<FlightSearchRequest>) => {
      state.searchParams = action.payload;
    },
    setSelectedFlight: (state, action: PayloadAction<FlightResult>) => {
      state.selectedFlight = action.payload;
    },
    clearSearch: (state) => {
      state.searchResults = null;
      state.searchError = null;
      state.selectedFlight = null;
      state.allocateResult = null;
      state.searchId = null;
      state.sessionStartedAt = null;
    },
    clearAllocate: (state) => {
      state.allocateResult = null;
      state.allocateError = null;
    },
  },
  extraReducers: (builder) => {
    // Search
    builder.addCase(searchFlightsThunk.pending, (state) => {
      state.searchLoading = true;
      state.searchError = null;
      state.searchResults = null;
    });
    builder.addCase(searchFlightsThunk.fulfilled, (state, action) => {
      state.searchLoading = false;
      state.searchResults = action.payload;
      state.sessionStartedAt = Date.now();
    });
    builder.addCase(searchFlightsThunk.rejected, (state, action) => {
      state.searchLoading = false;
      state.searchError = action.payload as string;
    });

    // Allocate
    builder.addCase(allocateFlightThunk.pending, (state) => {
      state.allocateLoading = true;
      state.allocateError = null;
    });
    builder.addCase(allocateFlightThunk.fulfilled, (state, action) => {
      state.allocateLoading = false;
      state.allocateResult = action.payload;
      state.searchId = action.payload.searchId ?? null;
    });
    builder.addCase(allocateFlightThunk.rejected, (state, action) => {
      state.allocateLoading = false;
      state.allocateError = action.payload as string;
    });
  },
});

export const { setSearchParams, setSelectedFlight, clearSearch, clearAllocate } = flightSlice.actions;
export default flightSlice.reducer;
