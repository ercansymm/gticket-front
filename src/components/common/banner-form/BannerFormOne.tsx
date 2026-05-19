import { useEffect, useRef, useState, useMemo, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Calendar, { formatDate } from "../calendar/Calendar";
import { useTranslation } from "../../../context/LanguageContext";
import { airports as staticAirports } from "../../../data/AirportData";
import { getAllAirports, searchAirports, type AirportDto } from "../../../api/lookup";
import { searchFlightsThunk, setSearchParams, clearSearch } from "../../../redux/features/flightSlice";
import { resetBooking } from "../../../redux/features/bookingSlice";
import { resetPayment } from "../../../redux/features/paymentSlice";
import { normalizeForSearch } from "../../../utils/normalizeForSearch";
import { getTurkishAirportInfo } from "../../../utils/airportTurkishNames";
import type { FlightSearchRequest, Airport, CabinClass } from "@/types";
import type { AppDispatch, RootState } from "../../../redux/store";

/** Statik havalimanını AirportDto formatına dönüştür */
const toAirportDto = (a: Airport, lang: 'tr' | 'en' = 'tr'): AirportDto => ({
   iataCode: a.code,
   name: lang === 'tr' ? a.nameTr : a.nameEn,
   city: lang === 'tr' ? a.cityTr : a.cityEn,
   cityCode: a.cityCode || a.code,
   countryCode: a.countryCode,
   isDomestic: a.isDomestic,
});

/** Dropdown'da hem tek havalimanı hem de şehir grubunu temsil eden genişletilmiş tip */
interface AirportDropdownItem extends AirportDto {
   isCityGroup?: boolean;
   groupCodes?: string[];
}

interface PassengerCounts {
   adult: number;
   child: number;
   infant: number;
}

interface MultiCitySegment {
   from: string;
   to: string;
   date: Date;
   fromSearch: string;
   toSearch: string;
   fromOpen: boolean;
   toOpen: boolean;
   calOpen: boolean;
}

type TripType = "oneway" | "roundtrip" | "multicity" | "group";

const createSegment = (): MultiCitySegment => ({
   from: "", to: "", date: new Date(), fromSearch: "", toSearch: "", fromOpen: false, toOpen: false, calOpen: false,
});

/** AtaBilet — Uçuş arama formu. URL parametrelerinden ön doldurma destekli. */
const BannerFormOne = () => {
   const searchParams = useSearchParams();
   const router = useRouter();
   const dispatch = useDispatch<AppDispatch>();
   const { t, lang } = useTranslation();
   const searchLoading = useSelector((state: RootState) => state.flight.searchLoading);
   const reduxSearchParams = useSelector((state: RootState) => state.flight.searchParams);

   const staticFallback = useMemo(() => staticAirports.map(a => toAirportDto(a, lang)), [lang]);

   const [tripType, setTripType] = useState<TripType>("oneway");
   const [from, setFrom] = useState("");
   const [to, setTo] = useState("");
   const [fromSearch, setFromSearch] = useState("");
   const [toSearch, setToSearch] = useState("");
   const [fromOpen, setFromOpen] = useState(false);
   const [toOpen, setToOpen] = useState(false);
   const [departDate, setDepartDate] = useState<Date | null>(null);
   const [returnDate, setReturnDate] = useState<Date | null>(null);
   const [flightClass, setFlightClass] = useState("economy");
   const [passengerOpen, setPassengerOpen] = useState(false);
   const [passengers, setPassengers] = useState<PassengerCounts>({ adult: 1, child: 0, infant: 0 });
   const [errors, setErrors] = useState<Record<string, string>>({});
   const [fromCity, setFromCity] = useState('');
   const [toCity, setToCity] = useState('');
   const [fromCountryCode, setFromCountryCode] = useState('');
   const [toCountryCode, setToCountryCode] = useState('');
   const [fromIsCity, setFromIsCity] = useState(false);
   const [toIsCity, setToIsCity] = useState(false);
   const [fromSuggestions, setFromSuggestions] = useState<AirportDropdownItem[]>([]);
   const [toSuggestions, setToSuggestions] = useState<AirportDropdownItem[]>([]);
   const [allAirports, setAllAirports] = useState<AirportDto[]>(staticFallback);

   // Calendar state
   const [calendarOpen, setCalendarOpen] = useState(false);
   const [calendarTarget, setCalendarTarget] = useState<"depart" | "return">("depart");

   // Multi-city
   const [segments, setSegments] = useState<MultiCitySegment[]>([createSegment(), createSegment()]);

   // Group form
   const [groupName, setGroupName] = useState("");
   const [groupPhone, setGroupPhone] = useState("");
   const [groupEmail, setGroupEmail] = useState("");
   const [groupFrom, setGroupFrom] = useState("");
   const [groupTo, setGroupTo] = useState("");
   const [groupDepart, setGroupDepart] = useState<Date>(new Date());
   const [groupReturn, setGroupReturn] = useState<Date | null>(null);
   const [groupPax, setGroupPax] = useState("10");
   const [groupCalOpen, setGroupCalOpen] = useState(false);
   const [groupCalTarget, setGroupCalTarget] = useState<"depart" | "return">("depart");

   // Advanced search (kept for API — controlled via baggage toggle only)
   const [baggageOnly, setBaggageOnly] = useState(false);
   const [directOnly, setDirectOnly] = useState(false);
   const [airlines] = useState<string[]>([]);

   const [fromHighlight, setFromHighlight] = useState(-1);
   const [toHighlight, setToHighlight] = useState(-1);

   const fromRef = useRef<HTMLDivElement>(null);
   const toRef = useRef<HTMLDivElement>(null);
   const toInputRef = useRef<HTMLInputElement>(null);
   const paxRef = useRef<HTMLDivElement>(null);
   const multiCityRef = useRef<HTMLDivElement>(null);
   const urlCountryCodeResolvedRef = useRef(false);
   const reduxParamsLoadedRef = useRef(false);

   // Calendar open helpers
   const openCalendar = useCallback((target: "depart" | "return") => {
      setCalendarTarget(target);
      setCalendarOpen(true);
   }, []);

   const closeCalendar = useCallback(() => setCalendarOpen(false), []);

   // Sayfa yüklendiğinde tüm havalimanlarını API'den çek ve statik listeyle birleştir
   useEffect(() => {
      const fetchAirports = async () => {
         try {
            const data = await getAllAirports(lang);
            if (data.length > 0) {
               // API verisini statik fallback ile birleştir — uluslararası havalimanları korunsun
               const apiCodes = new Set(data.map(a => a.iataCode));
               const extras = staticFallback.filter(s => !apiCodes.has(s.iataCode));
               setAllAirports([...data, ...extras]);
            } else {
               setAllAirports(staticFallback);
            }
         } catch {
            setAllAirports(staticFallback);
         }
      };
      fetchAirports();
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [lang]);

   // URL parametrelerinden form alanlarını doldur
   useEffect(() => {
      const urlFrom = searchParams?.get("from");
      const urlTo = searchParams?.get("to");
      const urlDate = searchParams?.get("date");
      const urlReturn = searchParams?.get("retdate");
      const urlPax = searchParams?.get("pax");
      const urlClass = searchParams?.get("class");
      const urlType = searchParams?.get("type");

      if (urlFrom) setFrom(urlFrom.toUpperCase());
      if (urlTo) setTo(urlTo.toUpperCase());
      if (urlDate) {
         const d = new Date(urlDate.includes('T') ? urlDate : urlDate + 'T00:00:00');
         if (!isNaN(d.getTime())) setDepartDate(d);
      }
      if (urlReturn) {
         const d = new Date(urlReturn.includes('T') ? urlReturn : urlReturn + 'T00:00:00');
         if (!isNaN(d.getTime())) setReturnDate(d);
      }
      if (urlPax) {
         const n = parseInt(urlPax, 10);
         if (n > 0 && n <= 9) setPassengers(prev => ({ ...prev, adult: n }));
      }
      if (urlClass === "business") setFlightClass("business");
      if (urlClass === "premiumeconomy") setFlightClass("premiumeconomy");
      if (urlClass === "first") setFlightClass("first");
      if (urlType === "roundtrip" || urlType === "oneway") setTripType(urlType);
   }, [searchParams]);

   // Redux searchParams'tan form alanlarını doldur (URL parametreleri yoksa)
   useEffect(() => {
      if (reduxParamsLoadedRef.current || !reduxSearchParams) return;
      // URL parametreleri varsa onlar öncelikli
      if (searchParams?.get("from") || searchParams?.get("to")) return;
      reduxParamsLoadedRef.current = true;

      const rp = reduxSearchParams;
      if (rp.origin) setFrom(rp.origin.toUpperCase());
      if (rp.destination) setTo(rp.destination.toUpperCase());
      if (rp.departureDate) {
         const d = new Date(rp.departureDate + 'T00:00:00');
         if (!isNaN(d.getTime())) setDepartDate(d);
      }
      if (rp.returnDate) {
         const d = new Date(rp.returnDate + 'T00:00:00');
         if (!isNaN(d.getTime())) setReturnDate(d);
      }
      if (rp.flightType === 'RT') setTripType('roundtrip');
      else if (rp.flightType === 'MP') setTripType('multicity');
      else setTripType('oneway');

      const cls = (rp.flightClass ?? 'Economy').toLowerCase();
      if (cls === 'premiumeconomy') setFlightClass('premiumeconomy');
      else if (cls === 'business') setFlightClass('business');
      else if (cls === 'first') setFlightClass('first');
      else setFlightClass('economy');

      setPassengers({
         adult: rp.adultCount ?? 1,
         child: rp.childCount ?? 0,
         infant: rp.infantCount ?? 0,
      });

      if (rp.originCountryCode) setFromCountryCode(rp.originCountryCode);
      if (rp.destinationCountryCode) setToCountryCode(rp.destinationCountryCode);
      if (rp.originIsCity) setFromIsCity(true);
      if (rp.destinationIsCity) setToIsCity(true);
      if (rp.directFlightsOnly) setDirectOnly(true);
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [reduxSearchParams]);

   // allAirports yüklenince URL'deki from/to kodlarının countryCode ve isCity'sini resolve et
   // (Dropdown seçiminde zaten set ediliyor; bu effect URL ile gelip allAirports hazır olmadan
   //  mount olan form için çalışır.)
   useEffect(() => {
      if (allAirports.length === 0 || urlCountryCodeResolvedRef.current) return;
      const urlFrom = searchParams?.get("from");
      const urlTo = searchParams?.get("to");
      if (!urlFrom && !urlTo) return;

      urlCountryCodeResolvedRef.current = true;

      const resolveCode = (rawCode: string): { countryCode: string; isCity: boolean } => {
         const code = rawCode.toUpperCase();
         // Önce city group kodu olarak bak (cityCode === code, farklı bir IATA koduna sahip)
         const cityGroupMembers = allAirports.filter(
            a => a.cityCode && a.cityCode === code && a.iataCode !== code
         );
         if (cityGroupMembers.length >= 1) {
            return { countryCode: cityGroupMembers[0].countryCode ?? 'TR', isCity: true };
         }
         // Doğrudan IATA kodu ekleştir
         const airport = allAirports.find(a => a.iataCode === code);
         if (airport) {
            return { countryCode: airport.countryCode ?? 'TR', isCity: false };
         }
         return { countryCode: 'TR', isCity: false };
      };

      if (urlFrom) {
         const { countryCode, isCity } = resolveCode(urlFrom);
         setFromCountryCode(countryCode);
         setFromIsCity(isCity);
      }
      if (urlTo) {
         const { countryCode, isCity } = resolveCode(urlTo);
         setToCountryCode(countryCode);
         setToIsCity(isCity);
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [allAirports]);

   // Dışarı tıklanınca dropdown kapat (mousedown + touchstart for mobile)
   useEffect(() => {
      const handler = (e: MouseEvent | TouchEvent) => {
         const target = e.target as Node;
         if (fromRef.current && !fromRef.current.contains(target)) setFromOpen(false);
         if (toRef.current && !toRef.current.contains(target)) setToOpen(false);
         // Portal renders outside paxRef, so also check [data-pax-portal] to avoid closing when tapping inside the bottom sheet
         const inPaxPortal = (target as Element).closest?.('[data-pax-portal]');
         if (paxRef.current && !paxRef.current.contains(target) && !inPaxPortal) setPassengerOpen(false);
         // Close multi-city dropdowns only when clicking outside the multi-city form
         if (multiCityRef.current && !multiCityRef.current.contains(target)) {
            setSegments(prev => prev.map(s => ({ ...s, fromOpen: false, toOpen: false })));
         }
      };
      document.addEventListener("mousedown", handler);
      document.addEventListener("touchstart", handler, { passive: true });
      return () => {
         document.removeEventListener("mousedown", handler);
         document.removeEventListener("touchstart", handler);
      };
   }, []);

   // Body scroll lock when pax bottom sheet is open on mobile
   useEffect(() => {
      if (!passengerOpen) return;
      const mq = window.matchMedia("(max-width: 768px)");
      if (!mq.matches) return;
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      return () => {
         document.body.style.position = "";
         document.body.style.top = "";
         document.body.style.left = "";
         document.body.style.right = "";
         document.body.style.overflow = "";
         window.scrollTo(0, scrollY);
      };
   }, [passengerOpen]);

   /** Seçilen havalimanını allAirports'a ekle (yoksa) — getAirportLabel'ın bulabilmesi için */
   const addToAirportsList = useCallback((airport: AirportDto) => {
      setAllAirports(prev => {
         if (prev.some(a => a.iataCode === airport.iataCode)) return prev;
         return [...prev, airport];
      });
   }, []);

   const getAirportLabel = (code: string, isCity?: boolean) => {
      if (!code) return "";
      const a = allAirports.find(ap => ap.iataCode === code);
      const trInfo = getTurkishAirportInfo(code);
      const city = trInfo?.cityName ?? a?.city ?? code;
      if (isCity && a) {
         const cityKey = normalizeForSearch(a.city || '');
         const members = cityIndex.get(cityKey);
         if (members && members.length > 1) {
            const codes = members.map(ap => ap.iataCode).join(', ');
            return `${city} (${codes})`;
         }
      }
      return a ? `${city} (${a.iataCode})` : code;
   };

   /** Tüm allAirports'u şehir bazında indeksle — grupları hızlıca bulmak için */
   const cityIndex = useMemo(() => {
      const map = new Map<string, AirportDto[]>();
      for (const a of allAirports) {
         const key = normalizeForSearch(a.city || '');
         if (!key) continue;
         const arr = map.get(key) || [];
         arr.push(a);
         map.set(key, arr);
      }
      return map;
   }, [allAirports]);

   /** Havalimanlarını state'teki listeden filtrele — anlık sonuç, şehir gruplarını da ekler */
   const filterAirports = useCallback((search: string, exclude?: string): AirportDropdownItem[] => {
      if (!search || search.length < 2) return [];
      const q = normalizeForSearch(search);
      // Word-boundary aware match: "dam" must START the city/name or a word within it
      const matchText = (text: string): boolean => {
         const n = normalizeForSearch(text);
         return n.startsWith(q) || n.includes(' ' + q);
      };
      const matched = allAirports
         .filter(a =>
            a.iataCode !== exclude &&
            (a.iataCode.toLowerCase().startsWith(q) ||
             matchText(a.city || '') ||
             matchText(a.name || ''))
         )
         .slice(0, 12);

      // Eşleşen havalimanlarının şehirlerini al, o şehirdeki TÜM havalimanlarından grup oluştur
      const seenCities = new Set<string>();
      const groups: AirportDropdownItem[] = [];
      for (const a of matched) {
         const cityKey = normalizeForSearch(a.city || '');
         if (!cityKey || seenCities.has(cityKey)) continue;
         seenCities.add(cityKey);
         const allInCity = cityIndex.get(cityKey);
         if (allInCity && allInCity.length >= 2) {
            const codes = allInCity.map(ap => ap.iataCode);
            const groupCityCode = allInCity[0].cityCode || codes[0];
            groups.push({
               iataCode: groupCityCode,
               name: `${allInCity[0].city} - ${t.allAirports}`,
               city: allInCity[0].city,
               cityCode: groupCityCode,
               countryCode: allInCity[0].countryCode,
               isDomestic: allInCity[0].isDomestic,
               isCityGroup: true,
               groupCodes: codes,
            });
         }
      }

      return [...groups, ...matched].slice(0, 12);
   }, [allAirports, t.allAirports, cityIndex]);

   /** Focus'ta gösterilecek başlangıç önerileri — şehir gruplarını içerir */
   const getInitialSuggestions = useCallback((): AirportDropdownItem[] => {
      const top = allAirports.slice(0, 10);
      const seenCities = new Set<string>();
      const groups: AirportDropdownItem[] = [];
      for (const a of top) {
         const cityKey = normalizeForSearch(a.city || '');
         if (!cityKey || seenCities.has(cityKey)) continue;
         seenCities.add(cityKey);
         const allInCity = cityIndex.get(cityKey);
         if (allInCity && allInCity.length >= 2) {
            const codes = allInCity.map(ap => ap.iataCode);
            const groupCityCode = allInCity[0].cityCode || codes[0];
            groups.push({
               iataCode: groupCityCode,
               name: `${allInCity[0].city} - ${t.allAirports}`,
               city: allInCity[0].city,
               cityCode: groupCityCode,
               countryCode: allInCity[0].countryCode,
               isDomestic: allInCity[0].isDomestic,
               isCityGroup: true,
               groupCodes: codes,
            });
         }
      }
      return [...groups, ...top].slice(0, 10);
   }, [allAirports, t.allAirports, cityIndex]);

   /** API'den async havalimanı araması — yerel sonuç yetersizse tetiklenir */
   const apiSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const searchAirportsAsync = useCallback((search: string, exclude: string | undefined, setter: React.Dispatch<React.SetStateAction<AirportDropdownItem[]>>) => {
      if (apiSearchTimerRef.current) clearTimeout(apiSearchTimerRef.current);
      if (!search || search.length < 2) return;
      apiSearchTimerRef.current = setTimeout(async () => {
         try {
            const results = await searchAirports(search, lang);
            const merged = results.filter(a => a.iataCode !== exclude);
            if (merged.length > 0) {
               setter(prev => {
                  const existingCodes = new Set(prev.map(p => p.iataCode));
                  const newOnes = merged.filter(m => !existingCodes.has(m.iataCode));
                  return newOnes.length > 0 ? [...prev, ...newOnes].slice(0, 12) : prev;
               });
            }
         } catch { /* sessizce geç */ }
      }, 300);
   }, [lang]);

   /** Aynı şehir kontrolü — Türkçe karakter normalize'lu */
   const isSameCity = useCallback((city1: string, city2: string): boolean => {
      if (!city1 || !city2) return false;
      return normalizeForSearch(city1) === normalizeForSearch(city2);
   }, []);

   const updatePassenger = (type: keyof PassengerCounts, delta: number) => {
      setPassengers(prev => {
         const limits: Record<keyof PassengerCounts, [number, number]> = {
            adult: [1, 9],
            child: [0, 9],
            infant: [0, prev.adult], // infant max = adult count
         };
         const [min, max] = limits[type];
         const next = Math.min(max, Math.max(min, prev[type] + delta));
         // total adult+child max 9
         if ((type === "adult" || type === "child") && (prev.adult + prev.child + delta > 9) && delta > 0) return prev;
         const result = { ...prev, [type]: next };
         // if adult decreased, cap infant to new adult count
         if (type === "adult" && result.infant > result.adult) result.infant = result.adult;
         return result;
      });
   };

   const paxSummary = useMemo(() => {
      const parts: string[] = [];
      if (passengers.adult > 0) parts.push(`${passengers.adult} ${t.adult}`);
      if (passengers.child > 0) parts.push(`${passengers.child} ${t.child}`);
      if (passengers.infant > 0) parts.push(`${passengers.infant} ${t.infant}`);
      const classLabel: Record<string, string> = {
         economy: t.economy,
         premiumeconomy: t.premiumEconomy,
         business: t.business,
         first: t.first,
      };
      parts.push(classLabel[flightClass] ?? t.economy);
      return parts.join(", ");
   }, [passengers, flightClass, t]);

   const handleSwap = () => {
      const tempFrom = from;
      const tempTo = to;
      const tempFromCity = fromCity;
      const tempToCity = toCity;
      const tempFromCountryCode = fromCountryCode;
      const tempToCountryCode = toCountryCode;
      const tempFromIsCity = fromIsCity;
      const tempToIsCity = toIsCity;
      setFrom(tempTo);
      setTo(tempFrom);
      setFromCity(tempToCity);
      setToCity(tempFromCity);
      setFromCountryCode(tempToCountryCode);
      setToCountryCode(tempFromCountryCode);
      setFromIsCity(tempToIsCity);
      setToIsCity(tempFromIsCity);
      if (tempFromCity && tempToCity && isSameCity(tempToCity, tempFromCity)) {
         setErrors(prev => ({ ...prev, to: t.sameCityError }));
      } else {
         setErrors(prev => ({ ...prev, from: '', to: '' }));
      }
   };

   // Calendar selection handlers
   const handleSingleDateSelect = useCallback((date: Date) => {
      if (calendarTarget === "depart") {
         setDepartDate(date);
         // If return date is before new depart date, clear it
         if (returnDate && returnDate <= date) setReturnDate(null);
      } else {
         setReturnDate(date);
      }
   }, [calendarTarget, returnDate]);

   const handleRangeSelect = useCallback((start: Date, end: Date) => {
      setDepartDate(start);
      setReturnDate(end);
   }, []);

   // Multi-city segment helpers
   const updateSegment = (idx: number, patch: Partial<MultiCitySegment>) => {
      setSegments(prev => {
         const next = prev.map((s, i) => i === idx ? { ...s, ...patch } : s);
         // Zincirleme: to değişince sonraki segmentin from'unu otomatik set et
         if (patch.to !== undefined && idx < next.length - 1) {
            next[idx + 1] = { ...next[idx + 1], from: patch.to };
         }
         // Tarih zincirleme: seçilen tarih sonraki segmentlerden büyükse, onları da güncelle
         if (patch.date !== undefined) {
            for (let i = idx + 1; i < next.length; i++) {
               if (next[i].date < next[idx].date) {
                  next[i] = { ...next[i], date: patch.date };
               }
            }
         }
         return next;
      });
   };

   const addSegment = () => {
      if (segments.length < 4) {
         setSegments(prev => {
            const last = prev[prev.length - 1];
            const newSeg = createSegment();
            newSeg.from = last?.to || '';
            newSeg.date = last?.date || new Date();
            return [...prev, newSeg];
         });
      }
   };

   const removeSegment = (idx: number) => {
      if (segments.length > 2) setSegments(prev => prev.filter((_, i) => i !== idx));
   };

   const validate = (): boolean => {
      const errs: Record<string, string> = {};

      /** Kod-bazlı aynı şehir kontrolü (validate için listeden bak) */
      const isSameCityByCode = (code1: string, code2: string): boolean => {
         const a1 = allAirports.find(a => a.iataCode === code1);
         const a2 = allAirports.find(a => a.iataCode === code2);
         if (!a1 || !a2) return false;
         return normalizeForSearch(a1.city) === normalizeForSearch(a2.city);
      };

      if (tripType === "multicity") {
         segments.forEach((seg, i) => {
            if (!seg.from) errs[`seg${i}from`] = t.selectOrigin;
            if (!seg.to) errs[`seg${i}to`] = t.selectDestination;
            if (seg.from && seg.to && (seg.from === seg.to || isSameCityByCode(seg.from, seg.to))) errs[`seg${i}to`] = t.sameCityError;
            // Tarih sıralama kontrolü: her segment bir öncekinden >= olmalı
            if (i > 0) {
               const prevDate = segments[i - 1].date;
               if (seg.date < prevDate) errs[`seg${i}date`] = t.returnDateError;
            }
         });
      } else if (tripType === "group") {
         if (!groupName.trim()) errs.groupName = t.enterFullName;
         if (!groupPhone.trim()) errs.groupPhone = t.enterPhone;
         if (!groupEmail.trim()) errs.groupEmail = t.enterEmail;
         if (!groupFrom) errs.groupFrom = t.selectOrigin;
         if (!groupTo) errs.groupTo = t.selectDestination;
         if (groupFrom && groupTo && (groupFrom === groupTo || isSameCityByCode(groupFrom, groupTo))) errs.groupTo = t.sameCityError;
         const pax = parseInt(groupPax, 10);
         if (isNaN(pax) || pax < 10) errs.groupPax = t.minPassengers;
      } else {
         if (!from) errs.from = t.selectOrigin;
         if (!to) errs.to = t.selectDestination;
         if (from && to && (from === to || isSameCity(fromCity, toCity))) errs.to = t.sameCityError;
         if (!departDate) errs.departDate = t.selectDate;
         if (tripType === "roundtrip" && !returnDate) errs.returnDate = t.selectDate;
         if (tripType === "roundtrip" && departDate && returnDate && returnDate < departDate) errs.returnDate = t.returnDateError;
      }
      setErrors(errs);
      return Object.keys(errs).length === 0;
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      if (tripType === "group") {
         // TODO: Implement group request API call
         return;
      }

      if (tripType === "multicity") {
         const formatDateForApi = (d: Date): string => {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
         };

         const resolveAirportMeta = (code: string) => {
            const airport = allAirports.find(a => a.iataCode === code);
            const cityGroupMembers = allAirports.filter(
               a => a.cityCode && a.cityCode === code && a.iataCode !== code
            );
            const isCity = cityGroupMembers.length >= 1;
            const countryCode = airport?.countryCode ?? cityGroupMembers[0]?.countryCode ?? 'TR';
            return { countryCode, isCity };
         };

         const apiSegments = segments.map(seg => {
            const fromMeta = resolveAirportMeta(seg.from);
            const toMeta = resolveAirportMeta(seg.to);
            return {
               origin: seg.from,
               destination: seg.to,
               originCountryCode: fromMeta.countryCode,
               destinationCountryCode: toMeta.countryCode,
               originIsCity: fromMeta.isCity,
               destinationIsCity: toMeta.isCity,
               departureDate: formatDateForApi(seg.date),
            };
         });

         const classMap: Record<string, CabinClass> = {
            economy: 'Economy',
            premiumeconomy: 'PremiumEconomy',
            business: 'Business',
            first: 'First',
         };

         const searchRequest: FlightSearchRequest = {
            origin: segments[0].from,
            destination: segments[0].to,
            originCountryCode: apiSegments[0].originCountryCode,
            destinationCountryCode: apiSegments[0].destinationCountryCode,
            originIsCity: apiSegments[0].originIsCity,
            destinationIsCity: apiSegments[0].destinationIsCity,
            departureDate: apiSegments[0].departureDate,
            returnDate: null,
            flightType: 'MP',
            flightClass: classMap[flightClass] ?? 'Economy',
            adultCount: passengers.adult,
            childCount: passengers.child,
            infantCount: passengers.infant,
            directFlightsOnly: directOnly,
            refundablesOnly: false,
            searchTimeoutMilliseconds: 0,
            preferredAirlines: airlines.length > 0 ? airlines : null,
            searchReason: 'SearchAndBook',
            segments: apiSegments,
         };

         dispatch(resetPayment());
         dispatch(resetBooking());
         dispatch(clearSearch());
         sessionStorage.removeItem('payment_3ds_session');
         dispatch(setSearchParams(searchRequest));
         dispatch(searchFlightsThunk(searchRequest));
         router.push('/ucus-sonuclari');
         return;
      }

      // URL search params builder (OW + RT only; multi-city skips URL params)
      const buildSearchUrl = (req: FlightSearchRequest): string => {
         if (req.flightType === 'MP') return '/ucus-sonuclari';
         const p = new URLSearchParams();
         p.set('from', req.origin);
         p.set('to', req.destination);
         p.set('date', req.departureDate);
         p.set('adt', String(req.adultCount ?? 1));
         p.set('chd', String(req.childCount ?? 0));
         p.set('inf', String(req.infantCount ?? 0));
         p.set('class', (req.flightClass ?? 'Economy').toLowerCase());
         p.set('type', req.flightType === 'RT' ? 'roundtrip' : 'oneway');
         if (req.returnDate && req.flightType === 'RT') p.set('retdate', req.returnDate);
         return `/ucus-sonuclari?${p.toString()}`;
      };

      // Tarih formatı: YYYY-MM-DD (lokal saat dilimi — UTC kaymasını önler)
      const formatDateForApi = (d: Date): string => {
         const yyyy = d.getFullYear();
         const mm = String(d.getMonth() + 1).padStart(2, '0');
         const dd = String(d.getDate()).padStart(2, '0');
         return `${yyyy}-${mm}-${dd}`;
      };

      // Form verilerini API formatına dönüştür
      const searchRequest: FlightSearchRequest = {
         origin: from,
         destination: to,
         originCountryCode: fromCountryCode || 'TR',
         destinationCountryCode: toCountryCode || 'TR',
         originIsCity: fromIsCity,
         destinationIsCity: toIsCity,
         departureDate: formatDateForApi(departDate!),
         returnDate: tripType === 'roundtrip' && returnDate ? formatDateForApi(returnDate) : null,
         flightType: tripType === 'oneway' ? 'OW' : 'RT',
         flightClass: (({ economy: 'Economy', premiumeconomy: 'PremiumEconomy', business: 'Business', first: 'First' } as Record<string, CabinClass>)[flightClass] ?? 'Economy') as CabinClass,
         adultCount: passengers.adult,
         childCount: passengers.child,
         infantCount: passengers.infant,
         directFlightsOnly: directOnly,
         refundablesOnly: false,
         searchTimeoutMilliseconds: 0,
         preferredAirlines: airlines.length > 0 ? airlines : null,
         searchReason: 'SearchAndBook',
      };

      // Clear all previous booking state before starting a new search
      dispatch(resetPayment());
      dispatch(resetBooking());
      dispatch(clearSearch());
      sessionStorage.removeItem('payment_3ds_session');

      // Redux'a kaydet ve API çağrısı yap
      dispatch(setSearchParams(searchRequest));
      dispatch(searchFlightsThunk(searchRequest));

      // Arama sonuçları sayfasına yönlendir (URL params ile — F5/geri tuşu desteği)
      router.push(buildSearchUrl(searchRequest));
   };

   // ── Shared airport dropdown renderer ──
   const renderAirportDropdown = (
      list: AirportDropdownItem[],
      onSelect: (airport: AirportDropdownItem) => void,
      highlightedIndex: number,
   ) => {
      const groups = list.filter(a => a.isCityGroup);
      const airports = list.filter(a => !a.isCityGroup);

      const renderItem = (a: AirportDropdownItem, flatIdx: number) => {
         const isGroup = !!a.isCityGroup;
         return (
            <li
               key={isGroup ? `group-${a.iataCode}-${flatIdx}` : `${a.iataCode}-${flatIdx}`}
               role="option"
               aria-selected={flatIdx === highlightedIndex}
               className={`${flatIdx === highlightedIndex ? 'bb-dropdown-highlighted' : ''} ${isGroup ? 'bb-dropdown-city-group' : ''}`}
               onClick={() => { addToAirportsList(a); onSelect(a); }}
            >
               {isGroup ? (
                  <>
                     <div className="bb-dropdown-top">
                        <strong className="bb-city-group-label">{a.city}</strong>
                        <div className="bb-city-group-codes">
                           {a.groupCodes?.map(code => (
                              <span key={code} className="bb-airport-code">{code}</span>
                           ))}
                        </div>
                     </div>
                     <small className="bb-city-group-sub">{a.name}</small>
                  </>
               ) : (() => {
                  const trInfo = getTurkishAirportInfo(a.iataCode);
                  const cityLabel = trInfo?.cityName ?? a.city;
                  const nameLabel = trInfo?.airportName ?? a.name;
                  return (
                     <>
                        <div className="bb-dropdown-top">
                           <strong>{cityLabel}</strong>
                           <span className="bb-airport-code">{a.iataCode}</span>
                        </div>
                        <small>{nameLabel}</small>
                     </>
                  );
               })()}
            </li>
         );
      };

      return (
         <ul className="bb-flight-form__dropdown" role="listbox">
            {groups.length > 0 && (
               <>
                  <li className="bb-dropdown-section-header" role="presentation" aria-hidden="true">
                     <i className="fa-solid fa-city" aria-hidden="true"></i>
                     {lang === 'en' ? 'City' : 'Şehir'}
                  </li>
                  {groups.map((a, i) => renderItem(a, i))}
               </>
            )}
            {airports.length > 0 && (
               <>
                  {groups.length > 0 && <li className="bb-dropdown-section-divider" role="presentation" aria-hidden="true" />}
                  <li className="bb-dropdown-section-header" role="presentation" aria-hidden="true">
                     <i className="fa-solid fa-plane" aria-hidden="true"></i>
                     {lang === 'en' ? 'Airport' : 'Havalimanı'}
                  </li>
                  {airports.map((a, i) => renderItem(a, groups.length + i))}
               </>
            )}
            {list.length === 0 && <li className="bb-flight-form__no-result">{t.noResult}</li>}
         </ul>
      );
   };

   /** Keyboard handler for airport input fields */
   const handleAirportKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>,
      suggestions: AirportDropdownItem[],
      highlightedIndex: number,
      setHighlight: (i: number) => void,
      onSelect: (airport: AirportDropdownItem) => void,
      setOpen: (open: boolean) => void,
   ) => {
      if (!suggestions.length) return;
      if (e.key === 'ArrowDown') {
         e.preventDefault();
         setHighlight(highlightedIndex < suggestions.length - 1 ? highlightedIndex + 1 : 0);
      } else if (e.key === 'ArrowUp') {
         e.preventDefault();
         setHighlight(highlightedIndex > 0 ? highlightedIndex - 1 : suggestions.length - 1);
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
         e.preventDefault();
         addToAirportsList(suggestions[highlightedIndex]);
         onSelect(suggestions[highlightedIndex]);
         setHighlight(-1);
      } else if (e.key === 'Escape') {
         setOpen(false);
         setHighlight(-1);
      }
   };

   // ── GROUP FORM ──
   if (tripType === "group") {
      return (
         <form role="search" aria-label={t.groupFlightRequest} onSubmit={handleSubmit} className="bb-flight-form">
            <div className="bb-flight-form__trip-toggle mb-15">
               {renderTripToggle(tripType, setTripType, t, directOnly, setDirectOnly)}
            </div>
            <h3 className="bb-group-title mb-15">{t.groupFlightRequest}</h3>
            <div className="bb-flight-form__fields bb-flight-form__fields--group">
               <div className="bb-flight-form__field">
                  <label className="bb-flight-form__label">{t.fullName}</label>
                  <input type="text" className={`bb-flight-form__input ${errors.groupName ? "bb-flight-form__input--error" : ""}`} value={groupName} onChange={e => setGroupName(e.target.value)} autoComplete="name" />
                  {errors.groupName && <span className="bb-flight-form__error">{errors.groupName}</span>}
               </div>
               <div className="bb-flight-form__field">
                  <label className="bb-flight-form__label">{t.phone}</label>
                  <input type="tel" className={`bb-flight-form__input ${errors.groupPhone ? "bb-flight-form__input--error" : ""}`} value={groupPhone} onChange={e => setGroupPhone(e.target.value)} autoComplete="tel" />
                  {errors.groupPhone && <span className="bb-flight-form__error">{errors.groupPhone}</span>}
               </div>
               <div className="bb-flight-form__field">
                  <label className="bb-flight-form__label">{t.email}</label>
                  <input type="email" className={`bb-flight-form__input ${errors.groupEmail ? "bb-flight-form__input--error" : ""}`} value={groupEmail} onChange={e => setGroupEmail(e.target.value)} autoComplete="email" />
                  {errors.groupEmail && <span className="bb-flight-form__error">{errors.groupEmail}</span>}
               </div>
               <div className="bb-flight-form__field">
                  <label className="bb-flight-form__label">{t.from}</label>
                  <input type="text" className={`bb-flight-form__input ${errors.groupFrom ? "bb-flight-form__input--error" : ""}`} placeholder={t.cityOrAirport} value={groupFrom} onChange={e => setGroupFrom(e.target.value)} autoComplete="off" />
                  {errors.groupFrom && <span className="bb-flight-form__error">{errors.groupFrom}</span>}
               </div>
               <div className="bb-flight-form__field">
                  <label className="bb-flight-form__label">{t.to}</label>
                  <input type="text" className={`bb-flight-form__input ${errors.groupTo ? "bb-flight-form__input--error" : ""}`} placeholder={t.cityOrAirport2} value={groupTo} onChange={e => setGroupTo(e.target.value)} autoComplete="off" />
                  {errors.groupTo && <span className="bb-flight-form__error">{errors.groupTo}</span>}
               </div>
               <div className="bb-flight-form__field bb-calendar-wrapper">
                  <label className="bb-flight-form__label">{t.departureDate}</label>
                  <input type="text" className="bb-flight-form__input" value={groupDepart ? formatDate(groupDepart) : ""} placeholder={t.selectDate} readOnly onClick={() => { setGroupCalTarget("depart"); setGroupCalOpen(true); }} />
                  {groupCalOpen && groupCalTarget === "depart" && (
                     <Calendar isOpen mode="single" onClose={() => setGroupCalOpen(false)} onSelectDate={(d) => { setGroupDepart(d); setGroupCalOpen(false); }} selectedDate={groupDepart} />
                  )}
               </div>
               <div className="bb-flight-form__field bb-calendar-wrapper">
                  <label className="bb-flight-form__label">{t.returnDate} ({t.optional})</label>
                  <input type="text" className="bb-flight-form__input" value={groupReturn ? formatDate(groupReturn) : ""} placeholder={t.selectDate} readOnly onClick={() => { setGroupCalTarget("return"); setGroupCalOpen(true); }} />
                  {groupCalOpen && groupCalTarget === "return" && (
                     <Calendar isOpen mode="single" onClose={() => setGroupCalOpen(false)} onSelectDate={(d) => { setGroupReturn(d); setGroupCalOpen(false); }} selectedDate={groupReturn} minDate={groupDepart} />
                  )}
               </div>
               <div className="bb-flight-form__field">
                  <label className="bb-flight-form__label">{t.estimatedPassengers}</label>
                  <input type="number" min={10} className={`bb-flight-form__input ${errors.groupPax ? "bb-flight-form__input--error" : ""}`} value={groupPax} onChange={e => setGroupPax(e.target.value)} />
                  {errors.groupPax && <span className="bb-flight-form__error">{errors.groupPax}</span>}
               </div>
               <div className="bb-flight-form__field bb-flight-form__field--submit">
                  <button type="submit" className="bb-flight-form__submit" data-event="group_request">
                     <i className="fa-solid fa-paper-plane"></i> {t.requestQuote}
                  </button>
               </div>
            </div>
         </form>
      );
   }

   // ── MULTI-CITY FORM ──
   if (tripType === "multicity") {
      return (
         <form role="search" aria-label={t.multiCity} onSubmit={handleSubmit} className="bb-flight-form">
            <div className="bb-flight-form__trip-toggle mb-15">
               {renderTripToggle(tripType, setTripType, t, directOnly, setDirectOnly)}
            </div>
            <div className="bb-multicity-segments" ref={multiCityRef}>
               {segments.map((seg, idx) => (
                  <div key={idx} className="bb-multicity-row">
                     <span className="bb-multicity-row__label">{t.flightN} {idx + 1}</span>
                     <div className="bb-multicity-row__fields">
                        <div className="bb-flight-form__field bb-flight-form__field--airport">
                           <label className="bb-flight-form__label">{t.from}</label>
                           {idx > 0 ? (
                              <input
                                 type="text"
                                 className="bb-flight-form__input bb-flight-form__input--readonly"
                                 value={getAirportLabel(seg.from)}
                                 readOnly
                                 tabIndex={-1}
                              />
                           ) : (
                              <input
                                 type="text"
                                 className={`bb-flight-form__input ${errors[`seg${idx}from`] ? "bb-flight-form__input--error" : ""}`}
                                 placeholder={t.cityOrAirport}
                                 value={seg.fromOpen ? seg.fromSearch : getAirportLabel(seg.from)}
                                 onChange={e => {
                                    const val = e.target.value;
                                    updateSegment(idx, { fromSearch: val, fromOpen: true });
                                 }}
                                 onFocus={() => {
                                    setSegments(prev => prev.map((s, i) => i === idx
                                       ? { ...s, fromOpen: true, fromSearch: "", toOpen: false }
                                       : { ...s, fromOpen: false, toOpen: false }
                                    ));
                                 }}
                                 autoComplete="off"
                              />
                           )}
                           {errors[`seg${idx}from`] && <span className="bb-flight-form__error">{errors[`seg${idx}from`]}</span>}
                           {idx === 0 && seg.fromOpen && renderAirportDropdown(
                              seg.fromSearch.length >= 2 ? filterAirports(seg.fromSearch, seg.to) : getInitialSuggestions(),
                              (airport) => {
                                 updateSegment(idx, { from: airport.iataCode, fromOpen: false, fromSearch: "" });
                                 const toAp = allAirports.find(a => a.iataCode === seg.to);
                                 if (toAp && isSameCity(airport.city, toAp.city)) {
                                    setErrors(prev => ({ ...prev, [`seg${idx}to`]: t.sameCityError }));
                                 } else {
                                    setErrors(prev => { const next = { ...prev }; delete next[`seg${idx}to`]; return next; });
                                 }
                              },
                              -1,
                           )}
                        </div>
                        <div className="bb-flight-form__field bb-flight-form__field--airport">
                           <label className="bb-flight-form__label">{t.to}</label>
                           <input
                              type="text"
                              className={`bb-flight-form__input ${errors[`seg${idx}to`] ? "bb-flight-form__input--error" : ""}`}
                              placeholder={t.cityOrAirport}
                              value={seg.toOpen ? seg.toSearch : getAirportLabel(seg.to)}
                              onChange={e => updateSegment(idx, { toSearch: e.target.value, toOpen: true })}
                              onFocus={() => {
                                 setSegments(prev => prev.map((s, i) => i === idx
                                    ? { ...s, toOpen: true, toSearch: "", fromOpen: false }
                                    : { ...s, fromOpen: false, toOpen: false }
                                 ));
                              }}
                              autoComplete="off"
                           />
                           {errors[`seg${idx}to`] && <span className="bb-flight-form__error">{errors[`seg${idx}to`]}</span>}
                           {seg.toOpen && renderAirportDropdown(
                              seg.toSearch.length >= 2 ? filterAirports(seg.toSearch, seg.from) : getInitialSuggestions(),
                              (airport) => {
                                 updateSegment(idx, { to: airport.iataCode, toOpen: false, toSearch: "" });
                                 const fromAp = allAirports.find(a => a.iataCode === seg.from);
                                 if (fromAp && isSameCity(fromAp.city, airport.city)) {
                                    setErrors(prev => ({ ...prev, [`seg${idx}to`]: t.sameCityError }));
                                 } else {
                                    setErrors(prev => { const next = { ...prev }; delete next[`seg${idx}to`]; return next; });
                                 }
                              },
                              -1,
                           )}
                        </div>
                        <div className="bb-flight-form__field bb-calendar-wrapper">
                           <label className="bb-flight-form__label">{t.departureDate}</label>
                           <input
                              type="text"
                              className={`bb-flight-form__input ${errors[`seg${idx}date`] ? "bb-flight-form__input--error" : ""}`}
                              value={formatDate(seg.date)}
                              placeholder={t.selectDate}
                              readOnly
                              onClick={() => updateSegment(idx, { calOpen: true })}
                           />
                           {errors[`seg${idx}date`] && <span className="bb-flight-form__error">{errors[`seg${idx}date`]}</span>}
                           {seg.calOpen && (
                              <Calendar
                                 isOpen
                                 mode="single"
                                 onClose={() => updateSegment(idx, { calOpen: false })}
                                 onSelectDate={(d) => { updateSegment(idx, { date: d, calOpen: false }); }}
                                 selectedDate={seg.date}
                                 minDate={idx > 0 ? segments[idx - 1].date : undefined}
                              />
                           )}
                        </div>
                     </div>
                     {segments.length > 2 && (
                        <button type="button" className="bb-multicity-row__remove" onClick={() => removeSegment(idx)} aria-label={t.removeFlight}>
                           <i className="fa-solid fa-xmark"></i>
                        </button>
                     )}
                  </div>
               ))}
            </div>
            {segments.length < 4 && (
               <button type="button" className="bb-multicity-add" onClick={addSegment}>
                  <i className="fa-solid fa-plus"></i> {t.addFlight}
               </button>
            )}
            <div className="bb-flight-form__fields bb-flight-form__fields--bottom mt-15">
               {/* Yolcu */}
               <div ref={paxRef} className="bb-flight-form__field bb-flight-form__field--pax">
                  <label className="bb-flight-form__label">{t.passenger}</label>
                  <button type="button" className="bb-flight-form__input bb-flight-form__pax-toggle" onClick={() => setPassengerOpen(p => !p)} aria-expanded={passengerOpen} aria-haspopup="dialog">
                     <span className="bb-pax-toggle__text">{paxSummary}</span>
                     <i className="fa-solid fa-chevron-down"></i>
                  </button>
                  {passengerOpen && renderPaxDropdown()}
               </div>
               <div className="bb-flight-form__field bb-flight-form__field--submit">
                  <button type="submit" className="bb-flight-form__submit" data-event="multicity_search">
                     <i className="fa-solid fa-magnifying-glass"></i> {t.searchFlight}
                  </button>
               </div>
            </div>
         </form>
      );
   }

   // ── Passenger dropdown renderer ──
   function renderPaxDropdown() {
      const paxRows: { key: keyof PassengerCounts; label: string; desc: string; icon: ReactNode }[] = [
         { key: "adult", label: t.adult, desc: t.ageRange12, icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
         )},
         { key: "child", label: t.child, desc: t.ageRange2_12, icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="3"/><path d="M9 13l-2 8h10l-2-8"/><path d="M9 13h6"/></svg>
         )},
         { key: "infant", label: t.infant, desc: t.ageRange0_2, icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="3"/><path d="M6 20v-1a6 6 0 0 1 12 0v1"/><path d="M8 9H6a2 2 0 0 0-2 2v1"/><path d="M16 9h2a2 2 0 0 1 2 2v1"/></svg>
         )},
      ];

      const cabinOptions = [
         { value: "economy", label: t.economy },
         { value: "premiumeconomy", label: t.premiumEconomy },
         { value: "business", label: t.business },
         { value: "first", label: t.first },
      ];

      const closePax = () => setPassengerOpen(false);

      const sheet = (
         <>
            <div className="bb-pax-overlay" onClick={closePax} onTouchEnd={(e) => { e.preventDefault(); closePax(); }} />
            <div className="bb-flight-form__pax-dropdown bb-flight-form__pax-dropdown--portal" data-pax-portal>
               <div className="bb-pax-drag-handle" />
               <p className="bb-pax-section-title">{t.passenger}</p>
               {paxRows.map(({ key, label, desc, icon }) => (
                  <div key={key} className="bb-pax-row">
                     <div className="bb-pax-row__info">
                        <span className="bb-pax-type-icon">{icon}</span>
                        <div>
                           <span className="bb-pax-label">{label}</span>
                           <small className="bb-pax-desc">{desc}</small>
                        </div>
                     </div>
                     <div className="bb-pax-controls">
                        <button
                           type="button"
                           className="bb-pax-btn bb-pax-btn--minus"
                           onClick={() => updatePassenger(key, -1)}
                           aria-label={`${label} ${t.decrease}`}
                           disabled={passengers[key] <= (key === "adult" ? 1 : 0)}
                        >
                           <svg width="12" height="2" viewBox="0 0 12 2"><rect width="12" height="2" rx="1" fill="currentColor"/></svg>
                        </button>
                        <span className="bb-pax-count">{passengers[key]}</span>
                        <button
                           type="button"
                           className="bb-pax-btn bb-pax-btn--plus"
                           onClick={() => updatePassenger(key, 1)}
                           aria-label={`${label} ${t.increase}`}
                        >
                           <svg width="12" height="12" viewBox="0 0 12 12"><rect x="5" y="0" width="2" height="12" rx="1" fill="currentColor"/><rect x="0" y="5" width="12" height="2" rx="1" fill="currentColor"/></svg>
                        </button>
                     </div>
                  </div>
               ))}
               <div className="bb-pax-divider" />
               <p className="bb-pax-section-title">{t.class}</p>
               <div className="bb-pax-cabin-grid">
                  {cabinOptions.map(opt => (
                     <button
                        key={opt.value}
                        type="button"
                        className={`bb-pax-cabin-btn${flightClass === opt.value ? " bb-pax-cabin-btn--active" : ""}`}
                        onClick={() => setFlightClass(opt.value)}
                     >
                        {opt.label}
                     </button>
                  ))}
               </div>
               <button type="button" className="bb-pax-apply" onClick={closePax}>{t.apply}</button>
            </div>
         </>
      );

      // On mobile, portal to body so fixed positioning isn't clipped
      if (typeof window !== "undefined" && window.innerWidth <= 768) {
         return createPortal(sheet, document.body);
      }
      return sheet;
   }

   // ── STANDARD FORM (oneway / roundtrip) ──
   return (
      <form role="search" aria-label={t.searchFlight} onSubmit={handleSubmit} className="bb-flight-form">
         {/* Sefer tipi toggle */}
         <div className="bb-flight-form__trip-toggle mb-15">
            {renderTripToggle(tripType, setTripType, t, directOnly, setDirectOnly)}
         </div>

         <div className="bb-flight-form__fields">
            {/* Nereden */}
            <div ref={fromRef} className="bb-flight-form__field bb-flight-form__field--airport bb-flight-form__field--with-icon">
               <label className="bb-flight-form__label">{t.from}</label>
               <i className="fa-solid fa-plane-departure bb-flight-form__input-icon" aria-hidden="true"></i>
               <input
                  type="text"
                  className={`bb-flight-form__input ${errors.from ? "bb-flight-form__input--error" : ""}`}
                  placeholder={t.cityOrAirport}
                  value={fromOpen ? fromSearch : getAirportLabel(from, fromIsCity)}
                  onChange={(e) => {
                     const val = e.target.value;
                     setFromSearch(val); setFromOpen(true); setFromHighlight(-1);
                     const local = filterAirports(val, to);
                     setFromSuggestions(local);
                     searchAirportsAsync(val, to, setFromSuggestions);
                  }}
                  onFocus={() => {
                     setFromOpen(true); setFromSearch(""); setFromHighlight(-1);
                     setFromSuggestions(getInitialSuggestions());
                  }}
                  onKeyDown={(e) => handleAirportKeyDown(e, fromSuggestions, fromHighlight, setFromHighlight, (airport) => {
                     setFrom(airport.iataCode); setFromCity(airport.city); setFromCountryCode(airport.countryCode ?? ''); setFromIsCity(!!airport.isCityGroup); setFromOpen(false); setFromSearch(""); setFromSuggestions([]);
                     if (toCity && isSameCity(airport.city, toCity)) {
                        setErrors(prev => ({ ...prev, to: t.sameCityError }));
                     } else {
                        setErrors(prev => ({ ...prev, from: '', to: prev.to === t.sameCityError ? '' : prev.to }));
                        if (!to) setTimeout(() => { setToOpen(true); setToSearch(""); setToHighlight(-1); setToSuggestions(getInitialSuggestions()); toInputRef.current?.focus(); }, 60);
                     }
                  }, setFromOpen)}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={fromOpen}
                  aria-autocomplete="list"
                  aria-activedescendant={fromHighlight >= 0 && fromSuggestions[fromHighlight] ? `from-option-${fromSuggestions[fromHighlight].iataCode}` : undefined}
               />
               {errors.from && <span className="bb-flight-form__error">{errors.from}</span>}
               {fromOpen && fromSuggestions.length > 0 && renderAirportDropdown(fromSuggestions, (airport) => {
                  setFrom(airport.iataCode); setFromCity(airport.city); setFromCountryCode(airport.countryCode ?? ''); setFromIsCity(!!airport.isCityGroup); setFromOpen(false); setFromSearch(""); setFromSuggestions([]);
                  if (toCity && isSameCity(airport.city, toCity)) {
                     setErrors(prev => ({ ...prev, to: t.sameCityError }));
                  } else {
                     setErrors(prev => ({ ...prev, from: '', to: prev.to === t.sameCityError ? '' : prev.to }));
                     if (!to) setTimeout(() => { setToOpen(true); setToSearch(""); setToHighlight(-1); setToSuggestions(getInitialSuggestions()); toInputRef.current?.focus(); }, 60);
                  }
               }, fromHighlight)}
            </div>

            {/* Swap button */}
            <button type="button" className="bb-swap-btn" onClick={handleSwap} aria-label="Swap">
               <i className="fa-solid fa-right-left"></i>
            </button>

            {/* Nereye */}
            <div ref={toRef} className="bb-flight-form__field bb-flight-form__field--airport bb-flight-form__field--with-icon">
               <label className="bb-flight-form__label">{t.to}</label>
               <i className="fa-solid fa-plane-arrival bb-flight-form__input-icon" aria-hidden="true"></i>
               <input
                  ref={toInputRef}
                  type="text"
                  className={`bb-flight-form__input ${errors.to ? "bb-flight-form__input--error" : ""}`}
                  placeholder={t.cityOrAirport2}
                  value={toOpen ? toSearch : getAirportLabel(to, toIsCity)}
                  onChange={(e) => {
                     const val = e.target.value;
                     setToSearch(val); setToOpen(true); setToHighlight(-1);
                     const local = filterAirports(val, from);
                     setToSuggestions(local);
                     searchAirportsAsync(val, from, setToSuggestions);
                  }}
                  onFocus={() => {
                     setToOpen(true); setToSearch(""); setToHighlight(-1);
                     setToSuggestions(getInitialSuggestions());
                  }}
                  onKeyDown={(e) => handleAirportKeyDown(e, toSuggestions, toHighlight, setToHighlight, (airport) => {
                     setTo(airport.iataCode); setToCity(airport.city); setToCountryCode(airport.countryCode ?? ''); setToIsCity(!!airport.isCityGroup); setToOpen(false); setToSearch(""); setToSuggestions([]);
                     if (fromCity && isSameCity(fromCity, airport.city)) {
                        setErrors(prev => ({ ...prev, to: t.sameCityError }));
                     } else {
                        setErrors(prev => ({ ...prev, to: '' }));
                     }
                  }, setToOpen)}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={toOpen}
                  aria-autocomplete="list"
                  aria-activedescendant={toHighlight >= 0 && toSuggestions[toHighlight] ? `to-option-${toSuggestions[toHighlight].iataCode}` : undefined}
               />
               {errors.to && <span className="bb-flight-form__error">{errors.to}</span>}
               {toOpen && toSuggestions.length > 0 && renderAirportDropdown(toSuggestions, (airport) => {
                  setTo(airport.iataCode); setToCity(airport.city); setToCountryCode(airport.countryCode ?? ''); setToIsCity(!!airport.isCityGroup); setToOpen(false); setToSearch(""); setToSuggestions([]);
                  if (fromCity && isSameCity(fromCity, airport.city)) {
                     setErrors(prev => ({ ...prev, to: t.sameCityError }));
                  } else {
                     setErrors(prev => ({ ...prev, to: '' }));
                  }
               }, toHighlight)}
            </div>

            {/* Gidiş Tarihi */}
            <div className="bb-flight-form__field bb-calendar-wrapper bb-flight-form__field--with-icon">
               <label className="bb-flight-form__label">{t.departureDate}</label>
               <i className="fa-solid fa-calendar-days bb-flight-form__input-icon" aria-hidden="true"></i>
               <input
                  type="text"
                  className="bb-flight-form__input"
                  value={departDate ? formatDate(departDate) : ""}
                  placeholder={t.selectDate}
                  readOnly
                  onClick={() => openCalendar("depart")}
               />
               {calendarOpen && calendarTarget === "depart" && (
                  <Calendar
                     isOpen
                     mode="single"
                     onClose={closeCalendar}
                     onSelectDate={(date) => {
                        setDepartDate(date);
                        if (returnDate && returnDate <= date) setReturnDate(null);
                        closeCalendar();
                        if (tripType === "roundtrip") setTimeout(() => openCalendar("return"), 120);
                     }}
                     selectedDate={departDate}
                  />
               )}
            </div>

            {/* Dönüş Tarihi — oneway'de "ekle" butonu olarak, roundtrip'te normal alan */}
            <div className="bb-flight-form__field bb-calendar-wrapper bb-flight-form__field--with-icon">
               <label className="bb-flight-form__label">{t.returnDate}</label>
               <i className={`fa-solid ${tripType === "roundtrip" ? "fa-calendar-days" : "fa-plus"} bb-flight-form__input-icon`} aria-hidden="true"></i>
               <input
                  type="text"
                  className={`bb-flight-form__input ${errors.returnDate ? "bb-flight-form__input--error" : ""} ${tripType === "oneway" ? "bb-flight-form__input--add-return" : ""}`}
                  value={tripType === "roundtrip" && returnDate ? formatDate(returnDate) : ""}
                  placeholder={tripType === "oneway" ? t.addReturnDate : t.selectDate}
                  readOnly
                  onClick={() => {
                     if (tripType === "oneway") {
                        setTripType("roundtrip");
                        // Mode switch render'ından sonra takvimi aç
                        setTimeout(() => openCalendar("return"), 60);
                     } else {
                        openCalendar("return");
                     }
                  }}
               />
               {tripType === "roundtrip" && (
                  <button
                     type="button"
                     className="bb-flight-form__clear-btn"
                     aria-label={t.removeFlight}
                     onClick={(e) => {
                        e.stopPropagation();
                        setReturnDate(null);
                        setTripType("oneway");
                        if (calendarOpen && calendarTarget === "return") closeCalendar();
                        setErrors(prev => ({ ...prev, returnDate: '' }));
                     }}
                  >
                     <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                  </button>
               )}
               {errors.returnDate && <span className="bb-flight-form__error">{errors.returnDate}</span>}
               {tripType === "roundtrip" && calendarOpen && calendarTarget === "return" && (
                  <Calendar
                     isOpen
                     mode="single"
                     onClose={closeCalendar}
                     onSelectDate={(date) => {
                        setReturnDate(date);
                        closeCalendar();
                     }}
                     selectedDate={returnDate}
                     minDate={departDate || undefined}
                     initialMonth={departDate || undefined}
                  />
               )}
            </div>

            {/* Yolcu */}
            <div ref={paxRef} className="bb-flight-form__field bb-flight-form__field--pax bb-flight-form__field--with-icon">
               <label className="bb-flight-form__label">{t.passenger}</label>
               <i className="fa-solid fa-user bb-flight-form__input-icon" aria-hidden="true"></i>
               <button type="button" className="bb-flight-form__input bb-flight-form__pax-toggle" onClick={() => setPassengerOpen(p => !p)} aria-expanded={passengerOpen} aria-haspopup="dialog">
                  <span className="bb-pax-toggle__text">{paxSummary}</span>
                  <i className="fa-solid fa-chevron-down"></i>
               </button>
               {passengerOpen && renderPaxDropdown()}
            </div>

            {/* Ara butonu */}
            <div className="bb-flight-form__field bb-flight-form__field--submit">
               <button type="submit" className="bb-flight-form__submit" data-event="flight_search" data-action="click" disabled={searchLoading}>
                  {searchLoading ? (
                     <><i className="fa-solid fa-spinner fa-spin"></i> {t.searchingFlights}</>
                  ) : (
                     <><i className="fa-solid fa-magnifying-glass"></i> {t.searchFlight}</>
                  )}
               </button>
            </div>
         </div>
      </form>
   );
};

/** Shared trip type toggle buttons */
function renderTripToggle(
   active: TripType,
   setType: (t: TripType) => void,
   t: ReturnType<typeof import("../../../context/LanguageContext").useTranslation>["t"],
   directOnly?: boolean,
   setDirectOnly?: (v: boolean) => void,
) {
   const types: { value: TripType; label: string; icon?: string; disabled?: boolean; badge?: string }[] = [
      { value: "oneway", label: t.oneWay },
      { value: "roundtrip", label: t.roundTrip },
   ];

   return (
      <>
         {types.map(({ value, label, icon, disabled, badge }) => (
            <label
               key={value}
               className={`bb-trip-radio ${active === value ? "bb-trip-radio--active" : ""} ${value === "group" ? "bb-trip-radio--group" : ""} ${disabled ? "bb-trip-radio--disabled" : ""}`}
               style={disabled ? { opacity: 0.5, cursor: 'not-allowed', position: 'relative' } : undefined}
            >
               <input type="radio" name="tripType" value={value} checked={active === value} onChange={() => !disabled && setType(value)} disabled={disabled} />
               <span className="bb-trip-radio__box">
                  {active === value && (
                     <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                  )}
               </span>
               {icon && <i className={icon}></i>} {label}
               {badge && (
                  <span style={{ fontSize: 10, background: '#eab308', color: '#fff', borderRadius: 8, padding: '1px 6px', marginLeft: 6, fontWeight: 600 }}>
                     {badge}
                  </span>
               )}
            </label>
         ))}

         {setDirectOnly && (
            <label
               className={`bb-trip-checkbox ${directOnly ? "bb-trip-checkbox--active" : ""}`}
               onClick={(e) => { e.preventDefault(); setDirectOnly(!directOnly); }}
            >
               <span className="bb-trip-checkbox__box">
                  {directOnly && (
                     <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                  )}
               </span>
               {t.nonstop}
            </label>
         )}
      </>
   );
}

export default BannerFormOne;
