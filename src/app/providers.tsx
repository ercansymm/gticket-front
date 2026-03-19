"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import store from "@/redux/store";
import { hydrateCart } from "@/redux/features/cartSlice";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastContainer } from "react-toastify";
import ScrollToTop from "@/components/common/ScrollToTop";

function HydrateCart() {
  useEffect(() => {
    store.dispatch(hydrateCart());
  }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <LanguageProvider>
          <HydrateCart />
          {children}
          <ScrollToTop />
          <ToastContainer position="top-center" />
        </LanguageProvider>
      </Provider>
    </SessionProvider>
  );
}
