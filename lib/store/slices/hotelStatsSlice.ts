import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface HotelStatsState {
  hotelCount: number | null;
  hotelLocation: string | null;
}

// Minimal selector state type to avoid circular dependency with store.ts
interface SelectorState {
  hotelStats: HotelStatsState;
}

const initialState: HotelStatsState = {
  hotelCount: null,
  hotelLocation: null,
};

const hotelStatsSlice = createSlice({
  name: "hotelStats",
  initialState,
  reducers: {
    updateHotelStats(
      state,
      action: PayloadAction<{ count: number | null; location: string | null }>
    ) {
      state.hotelCount = action.payload.count;
      state.hotelLocation = action.payload.location;
    },
  },
});

export const { updateHotelStats } = hotelStatsSlice.actions;

export const selectHotelCount = (state: SelectorState) =>
  state.hotelStats.hotelCount;
export const selectHotelLocation = (state: SelectorState) =>
  state.hotelStats.hotelLocation;

export default hotelStatsSlice.reducer;
