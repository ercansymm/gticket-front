import { toast } from "react-toastify";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { setLocalStorage, getLocalStorage } from "../../utils/localstorage";

interface Product {
   id: string;
   title: string;
   quantity: number;
}

interface CartState {
   cart: Product[];
   orderQuantity: number;
}

// Initialize cart from localStorage
const initialState: CartState = {
   cart: getLocalStorage<Product>("cart") || [],
   orderQuantity: 1,
};

const cartSlice = createSlice({
   name: "cart",
   initialState,
   reducers: {
      addToCart: (state, { payload }: PayloadAction<Product>) => {
         const productIndex = state.cart.findIndex((item) => item.id === payload.id);
         if (productIndex >= 0) {
            state.cart[productIndex].quantity += 1;
            toast.info(`${payload.title} Increase Product Quantity`);
         } else {
            const tempProduct = { ...payload, quantity: 1 };
            state.cart.push(tempProduct);
            toast.success(`${payload.title} added to cart`);
         }
         setLocalStorage("cart", state.cart);
      },

      decrease_quantity: (state, { payload }: PayloadAction<Product>) => {
         const productIndex = state.cart.findIndex((item) => item.id === payload.id);
         if (state.cart[productIndex].quantity > 1) {
            state.cart[productIndex].quantity -= 1;
            toast.error(`${payload.title} Decrease cart quantity`);
         }
         setLocalStorage("cart", state.cart);
      },

      remove_cart_product: (state, { payload }: PayloadAction<Product>) => {
         state.cart = state.cart.filter((item) => item.id !== payload.id);
         toast.error(`Removed from cart`);
         setLocalStorage("cart", state.cart);
      },

      clear_cart: (state) => {
         state.cart = [];
         setLocalStorage("cart", []);
      },

      hydrateCart: (state) => {
         state.cart = getLocalStorage<Product>("cart") || [];
      },
   },
});

export const {
   addToCart,
   decrease_quantity,
   remove_cart_product,
   clear_cart,
   hydrateCart
} = cartSlice.actions;

export default cartSlice.reducer;