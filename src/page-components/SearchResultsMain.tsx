import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import FlightCard from '../components/booking/FlightCard';
import FilterSidebar from '../components/booking/FilterSidebar';
import SortBar from '../components/booking/SortBar';
import { searchFlightsThunk, setSelectedFlight, allocateFlightThunk, clearAllocate } from '../redux/features/flightSlice';
import { filterFlights, sortFlights, INITIAL_FILTERS } from '../utils/flightFilters';
import type { RootState, AppDispatch } from '../redux/store';
import type { FlightResult, FlightFilters, FlightSortBy } from '@/types';

const SearchResultsMain = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { searchResults, searchLoading, searchError, searchParams, allocateLoading, allocateError } = useSelector(
    (state: RootState) => state.flight
  );

  const [filters, setFilters] = useState<FlightFilters>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<FlightSortBy>('cheapest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Client-side filtreleme + sıralama — API çağrısı yok
  const displayedFlights = useMemo(() => {
    if (!searchResults?.flights) return [];
    const filtered = filterFlights(searchResults.flights, filters);
    return sortFlights(filtered, sortBy);
  }, [searchResults?.flights, filters, sortBy]);

  const handleSelectFlight = (flight: FlightResult, brandedFareItemId?: string | null) => {
    if (allocateLoading || !searchResults) return;
    dispatch(setSelectedFlight(flight));
    dispatch(allocateFlightThunk({
      searchId: searchResults.searchId!,
      productId: brandedFareItemId ?? flight.productId!,
    })).unwrap()
      .then(() => router.push('/checkout'))
      .catch(() => {});
  };

  const handleRetry = () => {
    if (searchParams) {
      dispatch(searchFlightsThunk(searchParams));
    }
  };

  // Loading
  if (searchLoading) {
    return (
      <>
        <HeaderOne />
        <main className="bb-search-results">
          <div className="bb-spinner-overlay">
            <div className="bb-spinner-wrapper">
              <div className="bb-spinner bb-spinner--large"></div>
              <p className="bb-spinner-text">Uçuşlar aranıyor...</p>
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
          <div className="bb-error-modal-overlay" style={{ position: 'relative', minHeight: 400 }}>
            <div className="bb-error-modal" style={{ position: 'relative' }}>
              <div className="bb-error-modal__header">
                <h3>Hata Oluştu</h3>
              </div>
              <div className="bb-error-modal__body">
                <p>{searchError}</p>
              </div>
              <div className="bb-error-modal__footer">
                <button className="bb-error-modal__btn bb-error-modal__btn--retry" onClick={handleRetry}>
                  Tekrar Dene
                </button>
                <button className="bb-error-modal__btn bb-error-modal__btn--close" onClick={() => router.push('/')}>
                  Ana Sayfa
                </button>
              </div>
            </div>
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
          <div className="bb-search-results__header">
            <h1>Uçuş Bulunamadı</h1>
            <p>Arama kriterlerinize uygun uçuş bulunamadı. Lütfen farklı tarih veya güzergah deneyin.</p>
          </div>
          <button className="bb-flight-card__select" onClick={() => router.push('/')}>
            Yeni Arama Yap
          </button>
        </main>
        <FooterOne />
      </>
    );
  }

  // Allocate hata
  if (allocateError) {
    return (
      <>
        <HeaderOne />
        <main className="bb-search-results">
          <div className="bb-error-modal-overlay" style={{ position: 'relative', minHeight: 400 }}>
            <div className="bb-error-modal" style={{ position: 'relative' }}>
              <div className="bb-error-modal__header">
                <h3>Tahsis Hatası</h3>
              </div>
              <div className="bb-error-modal__body">
                <p>{allocateError}</p>
              </div>
              <div className="bb-error-modal__footer">
                <button className="bb-error-modal__btn bb-error-modal__btn--retry" onClick={() => dispatch(clearAllocate())}>
                  Tekrar Dene
                </button>
                <button className="bb-error-modal__btn bb-error-modal__btn--close" onClick={() => dispatch(clearAllocate())}>
                  Başka Uçuş Seç
                </button>
              </div>
            </div>
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
        {allocateLoading && (
          <div className="bb-spinner-overlay">
            <div className="bb-spinner-wrapper">
              <div className="bb-spinner bb-spinner--large"></div>
              <p className="bb-spinner-text">Uçuş tahsis ediliyor...</p>
            </div>
          </div>
        )}

        <div className="bb-search-results__header">
          <h1>{searchParams?.origin} → {searchParams?.destination}</h1>
          <p>{searchResults.flights.length} uçuş bulundu</p>
        </div>

        {/* Mobil filtre butonu */}
        <button
          className="bb-filter-toggle"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
        >
          {mobileFilterOpen ? 'Filtreleri Kapat' : 'Filtreler'}
        </button>

        <div className="bb-search-results__layout">
          {/* Sidebar */}
          <div className={`bb-search-results__sidebar ${mobileFilterOpen ? 'bb-search-results__sidebar--open' : ''}`}>
            <FilterSidebar
              options={searchResults.filterOptions}
              filters={filters}
              onChange={setFilters}
              resultCount={displayedFlights.length}
            />
          </div>

          {/* Ana içerik */}
          <div className="bb-search-results__content">
            <SortBar sortBy={sortBy} onChange={setSortBy} />

            {displayedFlights.length === 0 ? (
              <div className="bb-search-results__empty">
                <p>Seçili filtrelere uygun uçuş bulunamadı.</p>
                <button className="bb-filter-sidebar__reset" onClick={() => setFilters(INITIAL_FILTERS)}>
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div className="bb-search-results__list">
                {displayedFlights.map((flight) => (
                  <FlightCard
                    key={flight.productId}
                    flight={flight}
                    onSelect={(brandedFareItemId) => handleSelectFlight(flight, brandedFareItemId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <FooterOne />
    </>
  );
};

export default SearchResultsMain;
