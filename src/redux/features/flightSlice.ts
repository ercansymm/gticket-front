import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { searchFlights, allocateFlight } from '../../api/flight';
import type {
  FlightSearchRequest, FlightSearchResponse,
  AllocateClientRequest, AllocateResponse,
  FlightResult
} from '@/types';

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
};

// Uçuş arama
export const searchFlightsThunk = createAsyncThunk(
  'flight/search',
  async (params: FlightSearchRequest, { rejectWithValue }) => {
    try {
      const result = await searchFlights(params);
      return result;
    } catch (error: any) {
      const message = error.response?.data?.errorMessage
        || error.message
        || 'Uçuş araması başarısız';
      return rejectWithValue(message);
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
      const message = error.response?.data?.errorMessage
        || error.message
        || 'Uçuş tahsisi başarısız';
      return rejectWithValue(message);
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
