import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import FlightCard from '../components/booking/FlightCard';
import { searchFlightsThunk, setSelectedFlight, allocateFlightThunk, clearAllocate } from '../redux/features/flightSlice';
import type { RootState, AppDispatch } from '../redux/store';
import type { FlightResult } from '@/types';

const SearchResultsMain = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { searchResults, searchLoading, searchError, searchParams, allocateLoading, allocateError } = useSelector(
    (state: RootState) => state.flight
  );

  const handleSelectFlight = (flight: FlightResult) => {
    if (allocateLoading || !searchResults) return;
    dispatch(setSelectedFlight(flight));
    // GÜVENLİ: Sadece searchId + productId gönderiliyor
    // sessionId/sessionToken server-side'da eklenir
    dispatch(allocateFlightThunk({
      searchId: searchResults.searchId!,
      productId: flight.productId!,
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
        <div className="bb-search-results__list">
          {searchResults.flights.map((flight) => (
            <FlightCard
              key={flight.productId}
              flight={flight}
              onSelect={() => handleSelectFlight(flight)}
            />
          ))}
        </div>
      </main>
      <FooterOne />
    </>
  );
};

export default SearchResultsMain;
