//başka bir sayfadada değişiklik var test amaçlıdır.
//başka bir değişiklik olacak bakalım durum nedir.

"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import store from "@/redux/store";
import { hydrateCart } from "@/redux/features/cartSlice";
import { LanguageProvider } from "@/context/LanguageContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
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
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
      refetchInterval={5 * 60}
    >
      <Provider store={store}>
        <LanguageProvider>
          <CurrencyProvider>
          <HydrateCart />
          {children}
          <ScrollToTop />
          <ToastContainer position="top-center" />
          </CurrencyProvider>
        </LanguageProvider>
      </Provider>
    </SessionProvider>
  );
}
