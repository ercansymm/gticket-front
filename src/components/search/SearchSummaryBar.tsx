"use client";

import { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import BannerFormOne from "../common/banner-form/BannerFormOne";
import { airports as staticAirports } from "../../data/AirportData";
import type { RootState } from "../../redux/store";

const TURKISH_MONTHS = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

const TURKISH_DAYS_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

const CABIN_CLASS_LABELS: Record<string, string> = {
  Economy: "Ekonomi",
  PremiumEconomy: "Premium Ekonomi",
  Business: "Business",
  First: "First",
};

function formatDateTurkish(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDate();
  const month = TURKISH_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const dayOfWeek = TURKISH_DAYS_SHORT[d.getDay()];
  return `${day} ${month} ${year}, ${dayOfWeek}`;
}

function getAirportCityName(code: string): string {
  const airport = staticAirports.find(
    (a) => a.code.toUpperCase() === code.toUpperCase()
  );
  return airport?.cityTr ?? code;
}

interface SearchSummaryBarProps {
  onSearchSubmitted?: () => void;
}

const SearchSummaryBar = ({ onSearchSubmitted }: SearchSummaryBarProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const searchParams = useSelector((s: RootState) => s.flight.searchParams);

  const toggleForm = useCallback(() => {
    setIsFormOpen((prev) => !prev);
  }, []);

  const handleFormAreaClick = useCallback(() => {
    // When BannerFormOne dispatches a search, collapse the form
    // This is handled via MutationObserver on searchLoading change
  }, []);

  const searchLoading = useSelector((s: RootState) => s.flight.searchLoading);

  // Auto-collapse form when a new search starts
  const prevLoadingRef = useMemo(() => ({ current: false }), []);
  if (searchLoading && !prevLoadingRef.current) {
    if (isFormOpen) {
      setIsFormOpen(false);
    }
  }
  prevLoadingRef.current = searchLoading;

  const summaryText = useMemo(() => {
    if (!searchParams) return "";

    const originCity = getAirportCityName(searchParams.origin);
    const destCity = getAirportCityName(searchParams.destination);
    const departFormatted = formatDateTurkish(searchParams.departureDate);

    const paxCount =
      (searchParams.adultCount ?? 1) +
      (searchParams.childCount ?? 0) +
      (searchParams.infantCount ?? 0);

    const cabinLabel =
      CABIN_CLASS_LABELS[searchParams.flightClass ?? "Economy"] ?? "Ekonomi";

    const isRoundTrip = searchParams.flightType === "RT" && searchParams.returnDate;

    let text = `${originCity} → ${destCity} | ${departFormatted}`;

    if (isRoundTrip && searchParams.returnDate) {
      const returnFormatted = formatDateTurkish(searchParams.returnDate);
      text += ` - ${returnFormatted}`;
    }

    text += ` | ${paxCount} Yolcu | ${cabinLabel}`;

    return text;
  }, [searchParams]);

  if (!searchParams) return null;

  return (
    <div className="bb-summary-bar-wrapper">
      <div className="bb-summary-bar">
        <div className="bb-summary-bar__content">
          <div className="bb-summary-bar__info">
            <i className="fa-solid fa-plane bb-summary-bar__icon" />
            <span className="bb-summary-bar__text">{summaryText}</span>
          </div>
          <button
            type="button"
            className="bb-summary-bar__toggle"
            onClick={toggleForm}
            aria-expanded={isFormOpen}
            aria-label="Aramayı düzenle"
          >
            <span>Aramayı Düzenle</span>
            <i
              className={`fa-solid fa-chevron-down bb-summary-bar__arrow ${
                isFormOpen ? "bb-summary-bar__arrow--open" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <div
        className={`bb-summary-bar__form-collapse ${
          isFormOpen ? "bb-summary-bar__form-collapse--open" : ""
        }`}
      >
        <div className="bb-summary-bar__form-inner">
          <BannerFormOne />
        </div>
      </div>
    </div>
  );
};

export default SearchSummaryBar;
