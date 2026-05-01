import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import HeaderOne from '../layouts/headers/HeaderOne';
import { useCurrency } from '@/context/CurrencyContext';
import FooterOne from '../layouts/footers/FooterOne';
import FlightCard from '../components/booking/FlightCard';
import BundleFlightCard from '../components/booking/BundleFlightCard';
import MultiCityBundleCard from '../components/booking/MultiCityBundleCard';
import FilterSidebar from '../components/booking/FilterSidebar';
import SortBar from '../components/booking/SortBar';
import FlightSearchLoading from '../components/flight/FlightSearchLoading';
// import PriceCalendar, { generateMockPrices } from '../components/flight/PriceCalendar';
import { searchFlightsThunk, setSelectedFlight, setSelectedReturnFlight, setSelectedBrandedFareItemId, setSelectedLegFlight, clearSelectedLegFlight, clearSelectedLegFlights, allocateFlightThunk, clearAllocate, setSearchParams, clearSearch } from '../redux/features/flightSlice';
import { resetBooking } from '../redux/features/bookingSlice';
import { resetPayment } from '../redux/features/paymentSlice';
import { filterFlights, sortFlights, INITIAL_FILTERS } from '../utils/flightFilters';
import { airports as staticAirports } from '../data/AirportData';
import BannerFormOne from '../components/common/banner-form/BannerFormOne';
import type { RootState, AppDispatch } from '../redux/store';
import type { FlightResult, FlightFilters, FlightSortBy, AllocateResponse, FarePackage } from '@/types';
import { findBestFlightId } from '../utils/flightScoring';

interface BundlePackage {
  bundleProductId: string;
  outbound: FlightResult;
  returnFlight: FlightResult;
}

interface MultiCityPackage {
  bundleProductId: string;
  legs: FlightResult[];
}

/* ── Turkish date helpers (search edit bar & date nav) ── */
const TR_MONTHS_SHORT = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const TR_MONTHS_FULL = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const TR_DAYS_SHORT = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
const TR_DAYS_FULL = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];

const CABIN_LABELS: Record<string, string> = { Economy:'Ekonomi', PremiumEconomy:'Premium Ekonomi', Business:'Business', First:'First' };

function trDateShort(s: string) { const d = new Date(s+'T00:00:00'); return `${d.getDate()} ${TR_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}, ${TR_DAYS_SHORT[d.getDay()]}`; }
function trDateLong(s: string) { const d = new Date(s+'T00:00:00'); return `${d.getDate()} ${TR_MONTHS_FULL[d.getMonth()]} ${TR_DAYS_FULL[d.getDay()]}`; }
function airportCity(code: string) { return staticAirports.find(a => a.code.toUpperCase() === code.toUpperCase())?.cityTr ?? code; }
function fmtDateApi(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function addDays(s: string, n: number) { const d = new Date(s+'T00:00:00'); d.setDate(d.getDate()+n); return d; }
function isPastOrToday(s: string) { const d = new Date(s+'T00:00:00'); const now = new Date(); now.setHours(0,0,0,0); return d <= now; }

const SORT_OPTIONS: { value: FlightSortBy; label: string }[] = [
  { value: 'cheapest', label: 'En Ucuz' },
  { value: 'expensive', label: 'En Pahalı' },
  { value: 'earliest', label: 'En Erken' },
  { value: 'latest', label: 'En Geç' },
  { value: 'shortest', label: 'En Kısa' },
  { value: 'stops', label: 'En Az Aktarma' },
  { value: 'airline', label: 'Havayolu' },
];

const SearchResultsMain = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { searchResults, searchLoading, searchError, searchParams, allocateLoading, allocateError, selectedFlight, selectedLegFlights } = useSelector(
    (state: RootState) => state.flight
  );

  const [filters, setFilters] = useState<FlightFilters>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<FlightSortBy>('cheapest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [priceChangedData, setPriceChangedData] = useState<AllocateResponse | null>(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [dateNavLoading, setDateNavLoading] = useState<string | null>(null);

  // // Günlük tahmini fiyatlar (mock data)
  // const mockPrices = useMemo(
  //   () => (searchParams?.departureDate ? generateMockPrices(searchParams.departureDate) : []),
  //   [searchParams?.departureDate]
  // );

  // const handlePriceDateSelect = useCallback(
  //   (date: string) => {
  //     if (searchParams) {
  //       dispatch(searchFlightsThunk({ ...searchParams, departureDate: date }));
  //     }
  //   },
  //   [dispatch, searchParams]
  // );

  // Gidiş-dönüş seçimleri
  const [selectedOutbound, setSelectedOutbound] = useState<{ flight: FlightResult; brandedFareItemId: string | null } | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<{ flight: FlightResult; brandedFareItemId: string | null } | null>(null);
  const [rtAllocating, setRtAllocating] = useState(false);
  const returnSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedOutbound && returnSectionRef.current) {
      setTimeout(() => {
        returnSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, [selectedOutbound]);

  const isRoundTrip = searchParams?.flightType === 'RT';
  const isMultiCity = searchParams?.flightType === 'MP';

  const closeMobileFilter = useCallback(() => setMobileFilterOpen(false), []);
  const closeMobileSort = useCallback(() => setMobileSortOpen(false), []);

  // Lock body scroll when mobile drawers are open
  useEffect(() => {
    document.body.style.overflow = mobileFilterOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileFilterOpen]);

  // Reset filters when new search results arrive so no filter is active initially
  // If directFlightsOnly was selected in search form, pre-apply it
  useEffect(() => {
    if (searchResults?.flights) {
      setFilters({
        ...INITIAL_FILTERS,
        directOnly: searchParams?.directFlightsOnly ?? false,
      });
    }
  }, [searchResults]);

  // Client-side filtreleme + sıralama — API çağrısı yok
  const displayedFlights = useMemo(() => {
    if (!searchResults?.flights) return [];
    const filtered = filterFlights(searchResults.flights, filters);
    return sortFlights(filtered, sortBy);
  }, [searchResults?.flights, filters, sortBy]);

  // Multi-city: uçuşları bacak (leg) bazında grupla
  const multiCityLegs = useMemo(() => {
    if (!isMultiCity || !searchParams?.segments || !displayedFlights.length) return [];
    return searchParams.segments.map((seg, idx) => {
      const legFlights = displayedFlights.filter(f => {
        // SequenceNo bazında eşleştirme (BiletBank segment SequenceNo ile)
        if (f.segments.length > 0 && f.segments.some(s => s.sequenceNo === idx + 1)) return true;
        // Fallback: origin/destination eşleştirmesi
        return (
          (f.originCode ?? '').toUpperCase() === seg.origin.toUpperCase() &&
          (f.destinationCode ?? '').toUpperCase() === seg.destination.toUpperCase()
        );
      });
      return {
        legIndex: idx,
        origin: seg.origin,
        destination: seg.destination,
        date: seg.departureDate,
        flights: legFlights,
      };
    });
  }, [isMultiCity, searchParams?.segments, displayedFlights]);

  // Multi-city: RecommendationBox uçuşlarını bundleProductId'ye göre paketler halinde grupla
  const multiCityBundles = useMemo((): MultiCityPackage[] => {
    if (!isMultiCity) return [];
    const bundleFlights = displayedFlights.filter(f => f.isRoundTripBundle && f.bundleProductId);
    const groupMap = new Map<string, FlightResult[]>();
    for (const f of bundleFlights) {
      const key = f.bundleProductId!;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(f);
    }
    const packages: MultiCityPackage[] = [];
    for (const [pid, flights] of groupMap) {
      flights.sort((a, b) => {
        const seqA = a.segments[0]?.sequenceNo ?? 0;
        const seqB = b.segments[0]?.sequenceNo ?? 0;
        return seqA - seqB;
      });
      packages.push({ bundleProductId: pid, legs: flights });
    }
    packages.sort((a, b) => (a.legs[0]?.totalFare ?? 0) - (b.legs[0]?.totalFare ?? 0));
    return packages;
  }, [isMultiCity, displayedFlights]);

  // Multi-city: bundle olmayan (bağımsız FlightOption) uçuşlar
  const nonBundleMpFlights = useMemo(() => {
    if (!isMultiCity) return [];
    return displayedFlights.filter(f => !f.isRoundTripBundle);
  }, [isMultiCity, displayedFlights]);

  // Gidiş-Dönüş: uçuşları yöne göre ayır
  // BiletBank RT aramasında her T_FlightOption'da segment.sequenceNo=1 → gidiş, sequenceNo=2 → dönüş.
  // Fallback olarak originCode/destinationCode karşılaştırması kullanılır (multi-airport için split+includes).
  const hasDirectionalSequenceNos = useMemo(() => {
    return displayedFlights.some(f => f.segments.some(s => s.sequenceNo === 2));
  }, [displayedFlights]);

  const outboundFlights = useMemo(() => {
    if (!isRoundTrip || !searchParams) return displayedFlights;

    if (hasDirectionalSequenceNos) {
      // SequenceNo tabanlı: tüm segmentleri SequenceNo=1 olan uçuşlar gidiş yönüdür
      return displayedFlights.filter(f =>
        f.segments.length > 0 && f.segments.every(s => s.sequenceNo <= 1)
      );
    }

    // Fallback — origin/destination kodu eşleştirmesi
    const originCodes = searchParams.origin.split(',').map(c => c.trim().toUpperCase());
    const destCodes = searchParams.destination.split(',').map(c => c.trim().toUpperCase());
    return displayedFlights.filter(f =>
      originCodes.includes((f.originCode ?? '').toUpperCase()) &&
      destCodes.includes((f.destinationCode ?? '').toUpperCase())
    );
  }, [displayedFlights, isRoundTrip, searchParams, hasDirectionalSequenceNos]);

  const returnFlights = useMemo(() => {
    if (!isRoundTrip || !searchParams) return [];

    if (hasDirectionalSequenceNos) {
      // SequenceNo tabanlı: herhangi bir segmenti SequenceNo=2 olan uçuşlar dönüş yönüdür
      return displayedFlights.filter(f =>
        f.segments.some(s => s.sequenceNo === 2)
      );
    }

    // Fallback — origin/destination kodu eşleştirmesi (ters yön)
    const originCodes = searchParams.origin.split(',').map(c => c.trim().toUpperCase());
    const destCodes = searchParams.destination.split(',').map(c => c.trim().toUpperCase());
    return displayedFlights.filter(f =>
      destCodes.includes((f.originCode ?? '').toUpperCase()) &&
      originCodes.includes((f.destinationCode ?? '').toUpperCase())
    );
  }, [displayedFlights, isRoundTrip, searchParams, hasDirectionalSequenceNos]);

  // ── RT Bundle (RecommendationBox) paketleri ──
  // isRoundTripBundle=true olan uçuşları bundleProductId'ye göre eşleştir
  const bundlePackages = useMemo((): BundlePackage[] => {
    if (!isRoundTrip) return [];
    const outbounds = displayedFlights.filter(f => f.isRoundTripBundle && !f.isReturnLeg);
    const returns = displayedFlights.filter(f => f.isRoundTripBundle && f.isReturnLeg);

    const packages: BundlePackage[] = [];
    for (const ob of outbounds) {
      const pid = ob.bundleProductId;
      if (!pid) continue;
      const ret = returns.find(r => r.bundleProductId === pid);
      if (ret) {
        packages.push({ bundleProductId: pid, outbound: ob, returnFlight: ret });
      }
    }
    return packages;
  }, [displayedFlights, isRoundTrip]);

  // Bundle olmayan (normal FlightOption) gidiş ve dönüş uçuşları
  const regularOutbound = useMemo(
    () => outboundFlights.filter(f => !f.isRoundTripBundle),
    [outboundFlights]
  );
  const regularReturn = useMemo(
    () => returnFlights.filter(f => !f.isRoundTripBundle),
    [returnFlights]
  );

  // "En Uygun Uçuş" — filtrelenmiş (regular, non-bundle) listeler üzerinden hesaplanır.
  // Sıralama değişse bile aynı uçuş vurgulu kalır.
  const bestOutboundId = useMemo(() => findBestFlightId(regularOutbound), [regularOutbound]);
  const bestReturnId = useMemo(() => findBestFlightId(regularReturn), [regularReturn]);
  const bestOneWayId = useMemo(
    () => findBestFlightId(displayedFlights.filter((f) => !f.isRoundTripBundle)),
    [displayedFlights]
  );

  const hasBundles = bundlePackages.length > 0;

  /**
   * BiletBank, farklı branded fare seçildiğinde IsPriceChanged=true döner
   * çünkü orijinal ShoppingFile fiyatıyla karşılaştırır. Kullanıcı bile bile
   * farklı tarife seçtiğinde bu "fiyat değişikliği" değil, tarife farkıdır.
   * Gerçek fiyat değişikliği: allocate fiyatı ≠ seçilen tarifeye ait bilinen fiyat.
   */
  const isRealPriceChange = (
    result: AllocateResponse,
    flight: FlightResult,
    brandedFareItemId?: string | null,
  ): boolean => {
    if (!result.isPriceChanged) return false;

    const allocateTotal = result.priceSummary?.grandTotal
      ?? result.airBookings?.reduce((s, ab) => s + (ab.totalFare ?? 0), 0)
      ?? 0;

    // Seçilen branded fare'in bilinen fiyatını bul
    if (brandedFareItemId) {
      const selectedPkg = (flight.farePackages ?? [])
        .find((fp: FarePackage) => fp.brandedFareItemId === brandedFareItemId);
      if (selectedPkg && selectedPkg.totalFare > 0) {
        // %2 tolerans — küçük kuruş farkları yok sayılır
        const tolerance = selectedPkg.totalFare * 0.02;
        if (Math.abs(allocateTotal - selectedPkg.totalFare) <= tolerance) {
          return false; // tarife farkı, gerçek fiyat değişikliği değil
        }
      }
    }

    // BrandedFareItemId yok veya eşleşmedi → orijinal uçuş fiyatıyla karşılaştır
    if (flight.totalFare && flight.totalFare > 0) {
      const tolerance = flight.totalFare * 0.02;
      if (Math.abs(allocateTotal - flight.totalFare) <= tolerance) {
        return false;
      }
    }

    return true; // gerçekten fiyat değişmiş
  };

  // Tek yön uçuş seçimi (allocate + yönlendir)
  const handleSelectFlight = (flight: FlightResult, brandedFareItemId?: string | null) => {
    if (allocateLoading || !searchResults) return;
    dispatch(setSelectedFlight(flight));
    dispatch(setSelectedBrandedFareItemId(brandedFareItemId ?? null));
    dispatch(allocateFlightThunk({
      searchId: searchResults.searchId!,
      productId: flight.productId!,
      brandedFareItemId: brandedFareItemId ?? undefined,
    })).unwrap()
      .then((result: AllocateResponse) => {
        if (isRealPriceChange(result, flight, brandedFareItemId)) {
          setPriceChangedData(result);
        } else {
          router.push('/checkout');
        }
      })
      .catch(() => {});
  };

  // Gidiş-Dönüş: gidiş seçimi
  const handleSelectOutbound = (flight: FlightResult, brandedFareItemId?: string | null) => {
    setSelectedOutbound({ flight, brandedFareItemId: brandedFareItemId ?? null });
    setSelectedReturn(null);
  };

  // Gidiş-Dönüş: dönüş seçimi → her ikisini de allocate et
  const handleSelectReturn = async (flight: FlightResult, brandedFareItemId?: string | null) => {
    const returnSelection = { flight, brandedFareItemId: brandedFareItemId ?? null };
    setSelectedReturn(returnSelection);

    if (!selectedOutbound || !searchResults) return;

    setRtAllocating(true);
    dispatch(setSelectedFlight(selectedOutbound.flight));
    dispatch(setSelectedReturnFlight(flight));

    try {
      if (flight.isRoundTripBundle && flight.bundleProductId) {
        // RecommendationBox bundle: tek IO_AllocationItem + SubOptions (gidiş+dönüş FlightId'leri)
        const bundleResult = await dispatch(allocateFlightThunk({
          searchId: searchResults.searchId!,
          productId: selectedOutbound.flight.productId!,
          brandedFareItemId: selectedOutbound.brandedFareItemId ?? selectedOutbound.flight.defaultBrandedFareItemId ?? undefined,
          returnProductId: flight.productId!,
          returnBrandedFareItemId: brandedFareItemId ?? flight.defaultBrandedFareItemId ?? undefined,
          subOptionFlightIds: selectedOutbound.flight.subOptionFlightIds ?? flight.subOptionFlightIds ?? undefined,
        })).unwrap();

        if (isRealPriceChange(bundleResult, flight, brandedFareItemId)) {
          setPriceChangedData(bundleResult);
        } else {
          router.push('/checkout');
        }
      } else {
        // Bağımsız FlightOption: gidiş+dönüş iki IO_AllocationItem ile tek seferde allocate et
        const retResult = await dispatch(allocateFlightThunk({
          searchId: searchResults.searchId!,
          productId: selectedOutbound.flight.productId!,
          brandedFareItemId: selectedOutbound.brandedFareItemId ?? undefined,
          returnProductId: returnSelection.flight.productId!,
          returnBrandedFareItemId: returnSelection.brandedFareItemId ?? undefined,
        })).unwrap();

        if (isRealPriceChange(retResult, returnSelection.flight, returnSelection.brandedFareItemId)) {
          setPriceChangedData(retResult);
        } else {
          router.push('/checkout');
        }
      }
    } catch {
      // Redux hata yönetimi zaten çalışıyor
    } finally {
      setRtAllocating(false);
    }
  };

  // Gidiş seçimini temizle
  const handleClearOutbound = () => {
    setSelectedOutbound(null);
    setSelectedReturn(null);
  };

  // Bundle (RecommendationBox) paketi seç — tek allocate çağrısıyla gidiş+dönüş
  const handleSelectBundle = async (pkg: BundlePackage, brandedFareItemId?: string | null) => {
    if (!searchResults) return;
    setRtAllocating(true);
    dispatch(setSelectedFlight(pkg.outbound));
    dispatch(setSelectedReturnFlight(pkg.returnFlight));
    dispatch(setSelectedBrandedFareItemId(brandedFareItemId ?? pkg.outbound.defaultBrandedFareItemId ?? null));

    try {
      const result = await dispatch(allocateFlightThunk({
        searchId: searchResults.searchId!,
        productId: pkg.outbound.productId!,
        brandedFareItemId: brandedFareItemId ?? pkg.outbound.defaultBrandedFareItemId ?? undefined,
        returnProductId: pkg.returnFlight.productId!,
        returnBrandedFareItemId: brandedFareItemId ?? pkg.returnFlight.defaultBrandedFareItemId ?? undefined,
        subOptionFlightIds: pkg.outbound.subOptionFlightIds ?? undefined,
      })).unwrap();

      if (isRealPriceChange(result, pkg.outbound, brandedFareItemId ?? pkg.outbound.defaultBrandedFareItemId)) {
        setPriceChangedData(result);
      } else {
        router.push('/checkout');
      }
    } catch {
      // Redux hata yönetimi çalışıyor
    } finally {
      setRtAllocating(false);
    }
  };

  // Multi-city: bacak bazlı uçuş seçimi
  const handleSelectLegFlight = (legIndex: number, flight: FlightResult, brandedFareItemId?: string | null) => {
    dispatch(setSelectedLegFlight({ legIndex, flight }));
    dispatch(setSelectedBrandedFareItemId(brandedFareItemId ?? null));
  };

  // Multi-city: tüm bacaklar seçildiyse allocate yap (sadece non-bundle FlightOption'lar için)
  const handleMultiCityAllocate = async () => {
    if (!searchResults || !searchParams?.segments) return;
    const totalLegs = searchParams.segments.length;
    if (Object.keys(selectedLegFlights).length < totalLegs) return;

    setRtAllocating(true);
    const firstLeg = selectedLegFlights[0];
    dispatch(setSelectedFlight(firstLeg));

    try {
      // Bağımsız FlightOption: gidiş + dönüş iki IO_AllocationItem olarak tek seferde allocate et
      const secondLeg = selectedLegFlights[1];
      await dispatch(allocateFlightThunk({
        searchId: searchResults.searchId!,
        productId: firstLeg.productId!,
        brandedFareItemId: firstLeg.defaultBrandedFareItemId ?? undefined,
        returnProductId: secondLeg?.productId ?? undefined,
        returnBrandedFareItemId: secondLeg?.defaultBrandedFareItemId ?? undefined,
      })).unwrap();
      router.push('/checkout');
    } catch {
      // Redux hata yönetimi çalışıyor
    } finally {
      setRtAllocating(false);
    }
  };

  // Multi-city bundle: tek RecommendationBox kartı seçimi → doğrudan allocate
  const handleSelectMultiCityBundle = async (pkg: MultiCityPackage, brandedFareItemId?: string | null) => {
    if (!searchResults) return;
    setRtAllocating(true);
    const firstLeg = pkg.legs[0];
    dispatch(setSelectedFlight(firstLeg));

    try {
      const secondLeg = pkg.legs.length > 1 ? pkg.legs[1] : null;
      const result = await dispatch(allocateFlightThunk({
        searchId: searchResults.searchId!,
        productId: firstLeg.productId!,
        brandedFareItemId: brandedFareItemId ?? firstLeg.defaultBrandedFareItemId ?? undefined,
        returnProductId: secondLeg?.productId ?? undefined,
        returnBrandedFareItemId: secondLeg ? (brandedFareItemId ?? secondLeg.defaultBrandedFareItemId ?? undefined) : undefined,
        subOptionFlightIds: firstLeg.subOptionFlightIds ?? undefined,
      })).unwrap();

      if (isRealPriceChange(result, firstLeg, brandedFareItemId ?? firstLeg.defaultBrandedFareItemId)) {
        setPriceChangedData(result);
      } else {
        router.push('/checkout');
      }
    } catch {
      // Redux hata yönetimi çalışıyor
    } finally {
      setRtAllocating(false);
    }
  };

  const handleAcceptPriceChange = () => {
    setPriceChangedData(null);
    router.push('/checkout');
  };

  const handleRejectPriceChange = () => {
    dispatch(clearAllocate());
    setPriceChangedData(null);
  };

  const handleRetry = () => {
    if (searchParams) {
      dispatch(searchFlightsThunk(searchParams));
    }
  };

  // Auto-close edit form when a new search starts (searchLoading flips to true)
  useEffect(() => {
    if (searchLoading) setEditFormOpen(false);
  }, [searchLoading]);

  // Date navigation arrow handler
  const handleDateNav = useCallback((arrow: 'dep-prev' | 'dep-next' | 'ret-prev' | 'ret-next') => {
    if (!searchParams || searchLoading) return;
    let dep = searchParams.departureDate;
    let ret = searchParams.returnDate ?? null;
    if (arrow === 'dep-prev') { if (isPastOrToday(dep)) return; dep = fmtDateApi(addDays(dep, -1)); }
    if (arrow === 'dep-next') { dep = fmtDateApi(addDays(dep, 1)); if (ret && dep >= ret) ret = fmtDateApi(addDays(dep, 1)); }
    if (arrow === 'ret-prev') { if (!ret) return; const nd = fmtDateApi(addDays(ret, -1)); if (nd <= dep) return; ret = nd; }
    if (arrow === 'ret-next') { if (!ret) return; ret = fmtDateApi(addDays(ret, 1)); }
    const p = { ...searchParams, departureDate: dep, returnDate: ret };
    setDateNavLoading(arrow);
    dispatch(resetPayment());
    dispatch(resetBooking());
    dispatch(clearSearch());
    dispatch(setSearchParams(p));
    dispatch(searchFlightsThunk(p)).finally(() => setDateNavLoading(null));
  }, [searchParams, searchLoading, dispatch]);

  /* ── Arama özeti yardımcı bilgileri ── */
  const paxText = searchParams ? [
    (searchParams.adultCount ?? 1) > 0 ? `${searchParams.adultCount ?? 1} Yetişkin` : '',
    (searchParams.childCount ?? 0) > 0 ? `${searchParams.childCount} Çocuk` : '',
    (searchParams.infantCount ?? 0) > 0 ? `${searchParams.infantCount} Bebek` : '',
  ].filter(Boolean).join(', ') : '';

  const tripTypeText = searchParams?.flightType === 'RT' ? 'Gidiş-Dönüş' : searchParams?.flightType === 'MP' ? 'Çoklu Şehir' : 'Tek Yön';

  // Loading — skeleton + centered spinner card
  if (searchLoading) {
    const loadingSegments = isMultiCity && searchParams?.segments
      ? searchParams.segments
      : null;

    return (
      <>
        <HeaderOne />
        <main className="bb-search-results" style={{ position: 'relative' }}>
          {/* Immersive loading overlay */}
          <FlightSearchLoading
            origin={loadingSegments ? loadingSegments[0].origin : (searchParams?.origin ?? '...')}
            destination={loadingSegments ? loadingSegments[loadingSegments.length - 1].destination : (searchParams?.destination ?? '...')}
            departureDate={loadingSegments ? loadingSegments[0].departureDate : (searchParams?.departureDate ?? '')}
            passengerCount={(searchParams?.adultCount ?? 1) + (searchParams?.childCount ?? 0) + (searchParams?.infantCount ?? 0)}
            cabinClass={searchParams?.flightClass ?? 'Economy'}
            tripType={searchParams?.flightType === 'RT' ? 'round-trip' : 'one-way'}
          />

          {/* Background skeleton */}
          <div className="bb-search-summary">
            <div className="bb-search-summary__inner">
              <div className="bb-search-summary__route">
                {loadingSegments ? (
                  loadingSegments.map((seg, i) => (
                    <span key={i}>
                      {i > 0 && <span className="bb-search-summary__arrow">→</span>}
                      <span className="bb-search-summary__city">{seg.origin}</span>
                    </span>
                  )).concat(
                    <span key="last">
                      <span className="bb-search-summary__arrow">→</span>
                      <span className="bb-search-summary__city">{loadingSegments[loadingSegments.length - 1].destination}</span>
                    </span>
                  )
                ) : (
                  <>
                    <span className="bb-search-summary__city">{searchParams?.origin ?? '...'}</span>
                    <span className="bb-search-summary__arrow">→</span>
                    <span className="bb-search-summary__city">{searchParams?.destination ?? '...'}</span>
                  </>
                )}
              </div>
              <div className="bb-search-summary__meta">
                <span className="bb-search-summary__meta-item">{searchParams?.departureDate}</span>
                <span className="bb-search-summary__meta-item">{paxText}</span>
              </div>
            </div>
          </div>
          <div className="bb-search-results__layout">
            <div className="bb-search-results__sidebar">
              <div className="bb-loading-skeleton bb-skeleton-sidebar" />
            </div>
            <div className="bb-search-results__content">
              <div className="bb-loading-skeleton bb-skeleton-card" />
              <div className="bb-loading-skeleton bb-skeleton-card" />
              <div className="bb-loading-skeleton bb-skeleton-card" />
              <div className="bb-loading-skeleton bb-skeleton-card" />
            </div>
          </div>
        </main>
        <FooterOne />
      </>
    );
  }

  // Hata
  if (searchError) {
    return (
      <>
        <HeaderOne />
        <main className="bb-search-results">
          <div className="bb-empty-state">
            <div className="bb-empty-state__icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
            <h2 className="bb-empty-state__title">Arama Sırasında Hata Oluştu</h2>
            <p className="bb-empty-state__text">{searchError}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="bb-empty-state__btn" onClick={handleRetry}>
                Tekrar Dene
              </button>
              <button className="bb-empty-state__btn" style={{ background: '#f1f5f9', color: '#475569' }} onClick={() => {
                router.push('/');
              }}>
                Ana Sayfa
              </button>
            </div>
          </div>
        </main>
        <FooterOne />
      </>
    );
  }

  // Allocate hatası
  if (allocateError) {
    return (
      <>
        <HeaderOne />
        <main className="bb-search-results">
          <div className="bb-empty-state">
            <div className="bb-empty-state__icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
            <h2 className="bb-empty-state__title">Uçuş Tahsis Edilemedi</h2>
            <p className="bb-empty-state__text">{allocateError}</p>
            <button className="bb-empty-state__btn" onClick={() => dispatch(clearAllocate())}>
              Başka Uçuş Seç
            </button>
          </div>
        </main>
        <FooterOne />
      </>
    );
  }

  // Sonuç yok veya henüz arama yapılmadı
  if (!searchResults || searchResults.flights.length === 0) {
    return (
      <>
        <HeaderOne />
        <main className="bb-search-results">
          <div className="bb-empty-state">
            <div className="bb-empty-state__icon"><i className="fa-solid fa-plane"></i></div>
            <h2 className="bb-empty-state__title">Uçuş Bulunamadı</h2>
            <p className="bb-empty-state__text">
              Arama kriterlerinize uygun uçuş bulunamadı. Farklı tarih veya güzergah deneyebilirsiniz.
            </p>
            <button className="bb-empty-state__btn" onClick={() => {
              router.push('/');
            }}>
              Yeni Arama Yap
            </button>
          </div>
        </main>
        <FooterOne />
      </>
    );
  }

  // Sonuçları listele
  return (
    <>
      <HeaderOne />
      <main className="bb-search-results" style={{ position: 'relative' }}>
        {(allocateLoading || rtAllocating) && (
          <div className="bb-spinner-overlay">
            <div className="bb-spinner-wrapper">
              <div className="bb-spinner bb-spinner--large"></div>
            </div>
          </div>
        )}

        {/* ── Compact edit summary + date navigation ── */}
        {searchParams && (
          <>
            {/* Summary line with edit toggle */}
            <div className="bb-edit-summary">
              <span className="bb-edit-summary__text">
                {airportCity(searchParams.origin)} → {airportCity(searchParams.destination)}
                {' | '}{trDateShort(searchParams.departureDate)}
                {searchParams.flightType === 'RT' && searchParams.returnDate && ` - ${trDateShort(searchParams.returnDate)}`}
                {' | '}{(searchParams.adultCount ?? 1) + (searchParams.childCount ?? 0) + (searchParams.infantCount ?? 0)} Yolcu
                {' | '}{CABIN_LABELS[searchParams.flightClass ?? 'Economy'] ?? 'Ekonomi'}
              </span>
              <button type="button" className="bb-edit-summary__btn" onClick={() => setEditFormOpen(v => !v)}>
                Aramayı Düzenle {editFormOpen ? '▲' : '▼'}
              </button>
            </div>
            {editFormOpen && (
              <div className="bb-edit-summary__form">
                <BannerFormOne />
              </div>
            )}

            {/* Date navigation arrows */}
            <div className="bb-date-arrows">
              <div className="bb-date-arrows__group">
                <button className="bb-date-arrows__btn" disabled={isPastOrToday(searchParams.departureDate) || searchLoading} onClick={() => handleDateNav('dep-prev')} aria-label="Önceki gün">
                  {dateNavLoading === 'dep-prev' ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-chevron-left" />}
                </button>
                <span className="bb-date-arrows__label">
                  <span className="bb-date-arrows__prefix">Gidiş</span> - {trDateLong(searchParams.departureDate)}
                </span>
                <button className="bb-date-arrows__btn" disabled={searchLoading} onClick={() => handleDateNav('dep-next')} aria-label="Sonraki gün">
                  {dateNavLoading === 'dep-next' ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-chevron-right" />}
                </button>
              </div>
              {searchParams.flightType === 'RT' && searchParams.returnDate && (
                <div className="bb-date-arrows__group">
                  <button className="bb-date-arrows__btn" disabled={(() => { if (!searchParams.returnDate) return true; const r = new Date(searchParams.returnDate+'T00:00:00'); const d = new Date(searchParams.departureDate+'T00:00:00'); return (r.getTime()-d.getTime())/(86400000) <= 1; })() || searchLoading} onClick={() => handleDateNav('ret-prev')} aria-label="Önceki gün">
                    {dateNavLoading === 'ret-prev' ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-chevron-left" />}
                  </button>
                  <span className="bb-date-arrows__label">
                    <span className="bb-date-arrows__prefix">Dönüş</span> - {trDateLong(searchParams.returnDate)}
                  </span>
                  <button className="bb-date-arrows__btn" disabled={searchLoading} onClick={() => handleDateNav('ret-next')} aria-label="Sonraki gün">
                    {dateNavLoading === 'ret-next' ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-chevron-right" />}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Arama özeti bar */}
        <div className="bb-search-summary">
          <div className="bb-search-summary__inner">
            <div className="bb-search-summary__route">
              {isMultiCity && searchParams?.segments ? (
                searchParams.segments.map((seg, i) => (
                  <span key={i}>
                    {i > 0 && <span className="bb-search-summary__arrow">→</span>}
                    <span className="bb-search-summary__city">{seg.origin}</span>
                  </span>
                )).concat(
                  <span key="last">
                    <span className="bb-search-summary__arrow">→</span>
                    <span className="bb-search-summary__city">{searchParams.segments[searchParams.segments.length - 1].destination}</span>
                  </span>
                )
              ) : (
                <>
                  <span className="bb-search-summary__city">{searchParams?.origin}</span>
                  <span className="bb-search-summary__arrow">→</span>
                  <span className="bb-search-summary__city">{searchParams?.destination}</span>
                </>
              )}
            </div>
            <div className="bb-search-summary__meta">
              <span className="bb-search-summary__meta-item">{searchParams?.departureDate}</span>
              {searchParams?.flightType === 'RT' && searchParams?.returnDate && (
                <span className="bb-search-summary__meta-item">{searchParams.returnDate}</span>
              )}
              <span className="bb-search-summary__meta-item">{paxText}</span>
              <span className="bb-search-summary__meta-item">{tripTypeText}</span>
            </div>
            <span className="bb-search-summary__count">
              {searchResults.flights.length} uçuş
            </span>
          </div>
        </div>

        {/* Mobil sıralama + filtre barı (Enuygun pattern) */}
        <div className="bb-mobile-filter-bar">
          <button
            className="bb-mobile-filter-bar__btn"
            onClick={() => setMobileSortOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="8" y2="18"/></svg>
            Sırala
          </button>
          <button
            className="bb-mobile-filter-bar__btn"
            onClick={() => setMobileFilterOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filtrele
          </button>
        </div>

        {/* Mobil filtre drawer */}
        <div className={`bb-mobile-filter-drawer ${mobileFilterOpen ? 'is-open' : ''}`}>
          <div className="bb-mobile-filter-drawer__header">
            <h3 className="bb-mobile-filter-drawer__title">Filtreler</h3>
            <button className="bb-mobile-filter-drawer__close" onClick={closeMobileFilter} aria-label="Kapat">
              ✕
            </button>
          </div>
          <FilterSidebar
            options={searchResults.filterOptions}
            filters={filters}
            onChange={setFilters}
            resultCount={displayedFlights.length}
            totalCount={searchResults.flights.length}
          />
          <div className="bb-mobile-filter-drawer__footer">
            <button className="bb-mobile-filter-drawer__reset" onClick={() => setFilters(INITIAL_FILTERS)}>
              Temizle
            </button>
            <button className="bb-mobile-filter-drawer__apply" onClick={closeMobileFilter}>
              {displayedFlights.length} Uçuş Göster
            </button>
          </div>
        </div>

        {/* Mobil sıralama drawer */}
        {mobileSortOpen && (
          <div className="bb-mobile-sort-drawer__overlay" onClick={closeMobileSort} />
        )}
        <div className={`bb-mobile-sort-drawer ${mobileSortOpen ? 'is-open' : ''}`}>
          <div className="bb-mobile-sort-drawer__header">
            <h3 className="bb-mobile-sort-drawer__title">Sırala</h3>
          </div>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`bb-mobile-sort-option ${sortBy === opt.value ? 'bb-mobile-sort-option--active' : ''}`}
              onClick={() => { setSortBy(opt.value); closeMobileSort(); }}
            >
              <span>{opt.label}</span>
              {sortBy === opt.value && <span style={{ marginLeft: 'auto' }}>✓</span>}
            </button>
          ))}
        </div>

        {/* Günlük Tahmini Fiyatlar — devre dışı */}
        {/* {mockPrices.length > 0 && searchParams?.departureDate && (
          <div className="px-4 lg:px-6 mt-3">
            <PriceCalendar
              prices={mockPrices}
              selectedDate={searchParams.departureDate}
              onDateSelect={handlePriceDateSelect}
            />
          </div>
        )} */}

        <div className="bb-search-results__layout">
          {/* Sidebar — desktop only */}
          <div className="bb-search-results__sidebar">
            <FilterSidebar
              options={searchResults.filterOptions}
              filters={filters}
              onChange={setFilters}
              resultCount={displayedFlights.length}
              totalCount={searchResults.flights.length}
            />
          </div>

          {/* Ana içerik */}
          <div className="bb-search-results__content">
            <SortBar sortBy={sortBy} onChange={setSortBy} />

            {displayedFlights.length === 0 ? (
              <div className="bb-empty-state">
                <div className="bb-empty-state__icon"><i className="fa-solid fa-magnifying-glass"></i></div>
                <h2 className="bb-empty-state__title">Filtre Sonucu Bulunamadı</h2>
                <p className="bb-empty-state__text">Seçili filtrelere uygun uçuş yok. Filtreleri değiştirmeyi deneyin.</p>
                <button className="bb-empty-state__btn" onClick={() => setFilters(INITIAL_FILTERS)}>
                  Filtreleri Temizle
                </button>
              </div>
            ) : isRoundTrip ? (
              /* ═══ Gidiş-Dönüş Modu ═══ */
              <div className="bb-search-results__list">

                {/* ── Paket Uçuşlar (RecommendationBox bundles) ── */}
                {hasBundles && (
                  <>
                    <div className="bb-direction-header bb-direction-header--bundle">
                      <div className="bb-direction-header__icon" style={{ background: '#047857' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                      </div>
                      <div className="bb-direction-header__info">
                        <h3 className="bb-direction-header__title">Gidiş + Dönüş Paketleri</h3>
                        <span className="bb-direction-header__route">
                          {searchParams?.origin} ⇄ {searchParams?.destination}
                          <span className="bb-direction-header__date">{searchParams?.departureDate} – {searchParams?.returnDate}</span>
                        </span>
                      </div>
                      <span className="bb-direction-header__count">{bundlePackages.length} paket</span>
                    </div>

                    {bundlePackages.map((pkg) => (
                      <BundleFlightCard
                        key={pkg.bundleProductId}
                        outbound={pkg.outbound}
                        returnFlight={pkg.returnFlight}
                        onSelect={(fareItemId) => handleSelectBundle(pkg, fareItemId)}
                        loading={rtAllocating}
                      />
                    ))}
                  </>
                )}

                {/* ── Ayrı gidiş/dönüş seçimi (regular FlightOptions) ── */}
                {regularOutbound.length > 0 && (
                  <>
                    <div className="bb-direction-header" style={{ marginTop: hasBundles ? 24 : 0 }}>
                      <div className="bb-direction-header__icon">
                        <i className="fa-solid fa-plane-departure" />
                      </div>
                      <div className="bb-direction-header__info">
                        <h3 className="bb-direction-header__title">Gidiş Uçuşu</h3>
                        <span className="bb-direction-header__route">
                          {searchParams?.origin} → {searchParams?.destination}
                          <span className="bb-direction-header__date">{searchParams?.departureDate}</span>
                        </span>
                      </div>
                      <span className="bb-direction-header__count">{regularOutbound.length} uçuş</span>
                    </div>

                    {/* Seçili gidiş özeti */}
                    {selectedOutbound ? (
                      <div className="bb-selected-summary">
                        <div className="bb-selected-summary__badge">
                          <i className="fa-solid fa-check-circle" /> Gidiş Seçildi
                        </div>
                        <div className="bb-selected-summary__info">
                          <span className="bb-selected-summary__airline">{selectedOutbound.flight.airlineName}</span>
                          <span className="bb-selected-summary__flight">{selectedOutbound.flight.flightNumber}</span>
                          <span className="bb-selected-summary__time">
                            {selectedOutbound.flight.departureTime} → {selectedOutbound.flight.arrivalTime}
                          </span>
                          <span className="bb-selected-summary__price">
                            {formatPrice(selectedOutbound.flight.totalFare ?? 0)}
                          </span>
                        </div>
                        <button className="bb-selected-summary__change" onClick={handleClearOutbound}>
                          Değiştir
                        </button>
                      </div>
                    ) : (
                      regularOutbound.map((flight) => (
                        <FlightCard
                          key={flight.productId}
                          flight={flight}
                          onSelect={(fareItemId) => handleSelectOutbound(flight, fareItemId)}
                          isBest={flight.productId === bestOutboundId}
                        />
                      ))
                    )}

                    {/* ── Dönüş bölümü (gidiş seçildikten sonra) ── */}
                    {selectedOutbound && (
                      <>
                        <div ref={returnSectionRef} className="bb-direction-header bb-direction-header--return">
                          <div className="bb-direction-header__icon">
                            <i className="fa-solid fa-plane-arrival" />
                          </div>
                          <div className="bb-direction-header__info">
                            <h3 className="bb-direction-header__title">Dönüş Uçuşu</h3>
                            <span className="bb-direction-header__route">
                              {searchParams?.destination} → {searchParams?.origin}
                              <span className="bb-direction-header__date">{searchParams?.returnDate}</span>
                            </span>
                          </div>
                          <span className="bb-direction-header__count">{regularReturn.length} uçuş</span>
                        </div>

                        {regularReturn.length === 0 ? (
                          <div className="bb-empty-state" style={{ marginTop: 12 }}>
                            <p className="bb-empty-state__text">Bu güzergâh için dönüş uçuşu bulunamadı.</p>
                          </div>
                        ) : (
                          regularReturn.map((flight) => (
                            <FlightCard
                              key={flight.productId}
                              flight={flight}
                              onSelect={(fareItemId) => handleSelectReturn(flight, fareItemId)}
                              isBest={flight.productId === bestReturnId}
                            />
                          ))
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Hiç uçuş yoksa */}
                {!hasBundles && regularOutbound.length === 0 && (
                  <div className="bb-empty-state">
                    <div className="bb-empty-state__icon"><i className="fa-solid fa-magnifying-glass"></i></div>
                    <h2 className="bb-empty-state__title">Filtre Sonucu Bulunamadı</h2>
                    <p className="bb-empty-state__text">Seçili filtrelere uygun uçuş yok. Filtreleri değiştirmeyi deneyin.</p>
                    <button className="bb-empty-state__btn" onClick={() => setFilters(INITIAL_FILTERS)}>Filtreleri Temizle</button>
                  </div>
                )}
              </div>
            ) : isMultiCity ? (
              /* ═══ Çoklu Şehir Modu ═══ */
              <div className="bb-search-results__list">

                {/* ── Paket Uçuşlar (RecommendationBox bundles) ── */}
                {multiCityBundles.length > 0 && (
                  <>
                    <div className="bb-direction-header bb-direction-header--bundle">
                      <div className="bb-direction-header__icon" style={{ background: '#047857' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                      </div>
                      <div className="bb-direction-header__info">
                        <h3 className="bb-direction-header__title">Çoklu Şehir Paketleri</h3>
                        <span className="bb-direction-header__route">
                          {searchParams?.segments?.map((seg, i) => (
                            <span key={i}>
                              {i > 0 && ' → '}
                              {seg.origin}
                            </span>
                          ))}
                          {searchParams?.segments && searchParams.segments.length > 0 && (
                            <span> → {searchParams.segments[searchParams.segments.length - 1].destination}</span>
                          )}
                        </span>
                      </div>
                      <span className="bb-direction-header__count">{multiCityBundles.length} paket</span>
                    </div>

                    {multiCityBundles.map((pkg) => (
                      <MultiCityBundleCard
                        key={pkg.bundleProductId}
                        legs={pkg.legs}
                        onSelect={(fareItemId) => handleSelectMultiCityBundle(pkg, fareItemId)}
                        loading={rtAllocating}
                      />
                    ))}
                  </>
                )}

                {/* ── Bağımsız FlightOption'lar (bundle olmayan) — bacak bazlı seçim ── */}
                {nonBundleMpFlights.length > 0 && (
                  <>
                    {multiCityBundles.length > 0 && (
                      <div className="bb-direction-header" style={{ marginTop: 24 }}>
                        <div className="bb-direction-header__icon">
                          <i className="fa-solid fa-plane-departure" />
                        </div>
                        <div className="bb-direction-header__info">
                          <h3 className="bb-direction-header__title">Tekli Uçuşlar</h3>
                        </div>
                      </div>
                    )}

                    {multiCityLegs.map((leg) => {
                      const legNonBundle = leg.flights.filter(f => !f.isRoundTripBundle);
                      if (legNonBundle.length === 0) return null;
                      const legSelected = selectedLegFlights[leg.legIndex];
                      return (
                        <div key={leg.legIndex}>
                          <div className="bb-direction-header">
                            <div className="bb-direction-header__icon">
                              <i className="fa-solid fa-plane-departure" />
                            </div>
                            <div className="bb-direction-header__info">
                              <h3 className="bb-direction-header__title">Uçuş {leg.legIndex + 1}</h3>
                              <span className="bb-direction-header__route">
                                {leg.origin} → {leg.destination}
                                <span className="bb-direction-header__date">{leg.date}</span>
                              </span>
                            </div>
                            <span className="bb-direction-header__count">{legNonBundle.length} uçuş</span>
                          </div>

                          {legSelected && !legSelected.isRoundTripBundle ? (
                            <div className="bb-selected-summary">
                              <div className="bb-selected-summary__badge">
                                <i className="fa-solid fa-check-circle" /> Uçuş {leg.legIndex + 1} Seçildi
                              </div>
                              <div className="bb-selected-summary__info">
                                <span className="bb-selected-summary__airline">{legSelected.airlineName}</span>
                                <span className="bb-selected-summary__flight">{legSelected.flightNumber}</span>
                                <span className="bb-selected-summary__time">
                                  {legSelected.departureTime} → {legSelected.arrivalTime}
                                </span>
                                <span className="bb-selected-summary__price">
                                  {formatPrice(legSelected.totalFare ?? 0)}
                                </span>
                              </div>
                              <button className="bb-selected-summary__change" onClick={() => dispatch(clearSelectedLegFlight(leg.legIndex))}>
                                Değiştir
                              </button>
                            </div>
                          ) : (
                            legNonBundle.map((flight) => (
                              <FlightCard
                                key={flight.productId}
                                flight={flight}
                                onSelect={(fareItemId) => handleSelectLegFlight(leg.legIndex, flight, fareItemId)}
                              />
                            ))
                          )}
                        </div>
                      );
                    })}

                    {/* Tüm bacaklar seçildiyse Devam Et butonu (sadece non-bundle) */}
                    {searchParams?.segments && Object.keys(selectedLegFlights).length === searchParams.segments.length && 
                      Object.values(selectedLegFlights).every(f => f != null) && (
                      <div className="bb-multicity-continue">
                        <button
                          className="bb-flight-form__submit"
                          onClick={handleMultiCityAllocate}
                          disabled={rtAllocating}
                        >
                          {rtAllocating ? 'Tahsis ediliyor...' : 'Devam Et'}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Hiç sonuç yoksa */}
                {multiCityBundles.length === 0 && nonBundleMpFlights.length === 0 && (
                  <div className="bb-empty-state">
                    <div className="bb-empty-state__icon"><i className="fa-solid fa-magnifying-glass"></i></div>
                    <h2 className="bb-empty-state__title">Filtre Sonucu Bulunamadı</h2>
                    <p className="bb-empty-state__text">Seçili filtrelere uygun uçuş yok. Filtreleri değiştirmeyi deneyin.</p>
                    <button className="bb-empty-state__btn" onClick={() => setFilters(INITIAL_FILTERS)}>Filtreleri Temizle</button>
                  </div>
                )}
              </div>
            ) : (
              /* ═══ Tek Yön Modu ═══ */
              <div className="bb-search-results__list">
                {displayedFlights.map((flight) => (
                  <FlightCard
                    key={flight.productId}
                    flight={flight}
                    onSelect={(fareItemId) => handleSelectFlight(flight, fareItemId)}
                    allocateLoading={allocateLoading && selectedFlight?.productId === flight.productId}
                    isBest={flight.productId === bestOneWayId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fiyat Değişikliği Modalı */}
        {priceChangedData && (
          <div className="bb-modal-overlay" role="dialog" aria-modal="true" aria-label="Fiyat değişikliği bildirimi">
            <div className="bb-modal bb-modal--price-change">
              <div className="bb-modal__header">
                <h3 className="bb-modal__title">⚠ Fiyat Güncellemesi</h3>
              </div>
              <div className="bb-modal__body">
                <p>Seçtiğiniz uçuşun fiyatı güncellenmiştir.</p>
                <div className="bb-modal__price-compare">
                  <div className="bb-modal__price-old">
                    <span className="bb-modal__price-label">Eski Fiyat</span>
                    <span className="bb-modal__price-amount bb-modal__price-amount--old">
                      {formatPrice(selectedFlight?.totalFare ?? 0)}
                    </span>
                  </div>
                  <span className="bb-modal__price-arrow">→</span>
                  <div className="bb-modal__price-new">
                    <span className="bb-modal__price-label">Yeni Fiyat</span>
                    <span className="bb-modal__price-amount bb-modal__price-amount--new">
                      {formatPrice(priceChangedData.priceSummary?.grandTotal ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bb-modal__footer">
                <button className="bb-modal__btn bb-modal__btn--secondary" onClick={handleRejectPriceChange}>
                  Vazgeç, Aramaya Dön
                </button>
                <button className="bb-modal__btn bb-modal__btn--primary" onClick={handleAcceptPriceChange}>
                  Yeni Fiyatla Devam Et
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <FooterOne />
    </>
  );
};

export default SearchResultsMain;
