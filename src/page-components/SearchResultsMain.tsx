import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import FlightCard from '../components/booking/FlightCard';
import FilterSidebar from '../components/booking/FilterSidebar';
import SortBar from '../components/booking/SortBar';
import { searchFlightsThunk, setSelectedFlight, setSelectedBrandedFareItemId, allocateFlightThunk, clearAllocate } from '../redux/features/flightSlice';
import { filterFlights, sortFlights, INITIAL_FILTERS } from '../utils/flightFilters';
import type { RootState, AppDispatch } from '../redux/store';
import type { FlightResult, FlightFilters, FlightSortBy, AllocateResponse } from '@/types';

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
  const { searchResults, searchLoading, searchError, searchParams, allocateLoading, allocateError, selectedFlight } = useSelector(
    (state: RootState) => state.flight
  );

  const [filters, setFilters] = useState<FlightFilters>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<FlightSortBy>('cheapest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [priceChangedData, setPriceChangedData] = useState<AllocateResponse | null>(null);

  // Gidiş-dönüş seçimleri
  const [selectedOutbound, setSelectedOutbound] = useState<{ flight: FlightResult; brandedFareItemId: string | null } | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<{ flight: FlightResult; brandedFareItemId: string | null } | null>(null);
  const [rtAllocating, setRtAllocating] = useState(false);

  const isRoundTrip = searchParams?.flightType === 'RT';

  const closeMobileFilter = useCallback(() => setMobileFilterOpen(false), []);
  const closeMobileSort = useCallback(() => setMobileSortOpen(false), []);

  // Lock body scroll when mobile drawers are open
  useEffect(() => {
    document.body.style.overflow = mobileFilterOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileFilterOpen]);

  // Client-side filtreleme + sıralama — API çağrısı yok
  const displayedFlights = useMemo(() => {
    if (!searchResults?.flights) return [];
    const filtered = filterFlights(searchResults.flights, filters);
    return sortFlights(filtered, sortBy);
  }, [searchResults?.flights, filters, sortBy]);

  // Gidiş-Dönüş: uçuşları yöne göre ayır
  const outboundFlights = useMemo(() => {
    if (!isRoundTrip || !searchParams) return displayedFlights;
    return displayedFlights.filter(f =>
      f.originCode === searchParams.origin && f.destinationCode === searchParams.destination
    );
  }, [displayedFlights, isRoundTrip, searchParams]);

  const returnFlights = useMemo(() => {
    if (!isRoundTrip || !searchParams) return [];
    return displayedFlights.filter(f =>
      f.originCode === searchParams.destination && f.destinationCode === searchParams.origin
    );
  }, [displayedFlights, isRoundTrip, searchParams]);

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
        if (result.isPriceChanged) {
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

    try {
      // 1. Gidiş uçuşunu tahsis et
      await dispatch(allocateFlightThunk({
        searchId: searchResults.searchId!,
        productId: selectedOutbound.flight.productId!,
        brandedFareItemId: selectedOutbound.brandedFareItemId ?? undefined,
      })).unwrap();

      // 2. Dönüş uçuşunu tahsis et (aynı oturumda)
      const retResult = await dispatch(allocateFlightThunk({
        searchId: searchResults.searchId!,
        productId: returnSelection.flight.productId!,
        brandedFareItemId: returnSelection.brandedFareItemId ?? undefined,
      })).unwrap();

      if (retResult.isPriceChanged) {
        setPriceChangedData(retResult);
      } else {
        router.push('/checkout');
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

  /* ── Arama özeti yardımcı bilgileri ── */
  const paxText = searchParams ? [
    (searchParams.adultCount ?? 1) > 0 ? `${searchParams.adultCount ?? 1} Yetişkin` : '',
    (searchParams.childCount ?? 0) > 0 ? `${searchParams.childCount} Çocuk` : '',
    (searchParams.infantCount ?? 0) > 0 ? `${searchParams.infantCount} Bebek` : '',
  ].filter(Boolean).join(', ') : '';

  const tripTypeText = searchParams?.flightType === 'RT' ? 'Gidiş-Dönüş' : 'Tek Yön';

  // Loading — skeleton + centered spinner card
  if (searchLoading) {
    return (
      <>
        <HeaderOne />
        <main className="bb-search-results" style={{ position: 'relative' }}>
          {/* Spinner card overlay */}
          <div className="bb-flight-loading-overlay">
            <div className="bb-flight-loading__card">
              <div className="bb-flight-loading__logo">
                <span style={{ color: '#DC2626' }}>Ata</span>
                <span style={{ color: '#0F172A' }}>Bilet</span>
              </div>
              <div className="bb-flight-loading__bar">
                <div className="bb-flight-loading__bar-fill"></div>
              </div>
              <div className="bb-flight-loading__route">
                <span>{searchParams?.origin ?? '...'}</span>
                <i className="fa-solid fa-plane" style={{ fontSize: 13, color: '#0C4A6E' }}></i>
                <span>{searchParams?.destination ?? '...'}</span>
              </div>
              <p className="bb-flight-loading__text">Uçuşlar aranıyor<span className="bb-flight-loading__dots"></span></p>
            </div>
          </div>

          {/* Background skeleton */}
          <div className="bb-search-summary">
            <div className="bb-search-summary__inner">
              <div className="bb-search-summary__route">
                <span className="bb-search-summary__city">{searchParams?.origin ?? '...'}</span>
                <span className="bb-search-summary__arrow">→</span>
                <span className="bb-search-summary__city">{searchParams?.destination ?? '...'}</span>
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
              <button className="bb-empty-state__btn" style={{ background: '#f1f5f9', color: '#475569' }} onClick={() => router.push('/')}>
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
            <button className="bb-empty-state__btn" onClick={() => router.push('/')}>
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
              <p className="bb-spinner-text">Uçuş tahsis ediliyor...</p>
            </div>
          </div>
        )}

        {/* Arama özeti bar */}
        <div className="bb-search-summary">
          <div className="bb-search-summary__inner">
            <div className="bb-search-summary__route">
              <span className="bb-search-summary__city">{searchParams?.origin}</span>
              <span className="bb-search-summary__arrow">→</span>
              <span className="bb-search-summary__city">{searchParams?.destination}</span>
            </div>
            <div className="bb-search-summary__meta">
              <span className="bb-search-summary__meta-item">{searchParams?.departureDate}</span>
              {searchParams?.flightType === 'RT' && searchParams?.returnDate && (
                <span className="bb-search-summary__meta-item">{searchParams.returnDate}</span>
              )}
              <span className="bb-search-summary__meta-item">{paxText}</span>
              <span className="bb-search-summary__meta-item">{tripTypeText}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="bb-search-summary__count">
                {searchResults.flights.length} uçuş
              </span>
              <button className="bb-search-summary__edit" onClick={() => router.push('/')}>
                Arama Değiştir
              </button>
            </div>
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
                {/* ── Gidiş bölümü ── */}
                <div className="bb-direction-header">
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
                  <span className="bb-direction-header__count">{outboundFlights.length} uçuş</span>
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
                        {selectedOutbound.flight.totalFare?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {selectedOutbound.flight.currency ?? 'TRY'}
                      </span>
                    </div>
                    <button className="bb-selected-summary__change" onClick={handleClearOutbound}>
                      Değiştir
                    </button>
                  </div>
                ) : (
                  /* Gidiş uçuşları listesi */
                  outboundFlights.map((flight) => (
                    <FlightCard
                      key={flight.productId}
                      flight={flight}
                      onSelect={(fareItemId) => handleSelectOutbound(flight, fareItemId)}
                    />
                  ))
                )}

                {/* ── Dönüş bölümü (gidiş seçildikten sonra) ── */}
                {selectedOutbound && (
                  <>
                    <div className="bb-direction-header bb-direction-header--return">
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
                      <span className="bb-direction-header__count">{returnFlights.length} uçuş</span>
                    </div>

                    {returnFlights.length === 0 ? (
                      <div className="bb-empty-state" style={{ marginTop: 12 }}>
                        <p className="bb-empty-state__text">Bu güzergâh için dönüş uçuşu bulunamadı.</p>
                      </div>
                    ) : (
                      returnFlights.map((flight) => (
                        <FlightCard
                          key={flight.productId}
                          flight={flight}
                          onSelect={(fareItemId) => handleSelectReturn(flight, fareItemId)}
                        />
                      ))
                    )}
                  </>
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
                      {selectedFlight?.totalFare?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {selectedFlight?.currency ?? 'TRY'}
                    </span>
                  </div>
                  <span className="bb-modal__price-arrow">→</span>
                  <div className="bb-modal__price-new">
                    <span className="bb-modal__price-label">Yeni Fiyat</span>
                    <span className="bb-modal__price-amount bb-modal__price-amount--new">
                      {priceChangedData.priceSummary?.grandTotal?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {priceChangedData.priceSummary?.currency ?? 'TRY'}
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
