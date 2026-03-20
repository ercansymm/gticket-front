import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./features/cartSlice";
import productSlice from "./features/productSlice";
import wishlistSlice from "./features/wishlistSlice";
import flightReducer from "./features/flightSlice";
import bookingReducer from "./features/bookingSlice";
import paymentReducer from "./features/paymentSlice";

const store = configureStore({
   reducer: {
      products: productSlice,
      cart: cartSlice,
      wishlist: wishlistSlice,
      flight: flightReducer,
      booking: bookingReducer,
      payment: paymentReducer,
   },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;