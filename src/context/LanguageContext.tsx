"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { tr } from "../locales/tr";
import { en } from "../locales/en";

type Lang = "tr" | "en";
type Translations = typeof tr;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const translations: Record<Lang, Translations> = { tr, en };

const LanguageContext = createContext<LanguageContextValue>({
  lang: "tr",
  setLang: () => {},
  t: tr,
});

const STORAGE_KEY = "bb_lang";

const DEFAULT_LANG: Lang = "tr";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);
  const [announcement, setAnnouncement] = useState("");
  const isFirstRender = useRef(true);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    try { localStorage.setItem(STORAGE_KEY, newLang); } catch { /* ignore */ }
    document.documentElement.lang = newLang;
    setAnnouncement(newLang === "tr" ? "Dil Türkçe olarak değiştirildi" : "Language changed to English");
  }, []);

  // Client tarafında localStorage'dan dili yükle (hydration sonrası)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "tr") {
        setLangState(stored);
        document.documentElement.lang = stored;
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="bb-sr-only">{announcement}</div>
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
