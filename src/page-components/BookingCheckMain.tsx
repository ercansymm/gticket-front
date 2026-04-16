import HeaderOne from "../layouts/headers/HeaderOne"
import TrustBar from "../components/homes/home-one/TrustBar"
import FooterOne from "../layouts/footers/FooterOne"
import { useState } from "react"
import { useTranslation } from "../context/LanguageContext"
import { useDispatch, useSelector } from "react-redux"
import { getBookingByPnrThunk, clearBookingDetail } from "../redux/features/paymentSlice"
import type { RootState, AppDispatch } from "../redux/store"
import { Search, Loader2, SearchX, AlertTriangle, ArrowLeft } from "lucide-react"
import PnrHeaderCard from "../components/pnr/PnrHeaderCard"
import FlightSegmentCard from "../components/pnr/FlightSegmentCard"
import PassengerListCard from "../components/pnr/PassengerListCard"
import PriceBreakdownCard from "../components/pnr/PriceBreakdownCard"
import ActionPanel from "../components/pnr/ActionPanel"
import RulesAccordion from "../components/pnr/RulesAccordion"

const turkishToEnglishUpper = (value: string): string => {
   const charMap: Record<string, string> = {
      'ş': 'S', 'Ş': 'S',
      'ç': 'C', 'Ç': 'C',
      'ğ': 'G', 'Ğ': 'G',
      'ı': 'I', 'İ': 'I',
      'ö': 'O', 'Ö': 'O',
      'ü': 'U', 'Ü': 'U',
      'â': 'A', 'Â': 'A',
      'î': 'I', 'Î': 'I',
      'û': 'U', 'Û': 'U',
      'i': 'I',
   };
   return value
      .split('')
      .map(char => charMap[char] || char)
      .join('')
      .toUpperCase();
};

const BookingCheckMain = () => {
   const { t } = useTranslation();
   const dispatch = useDispatch<AppDispatch>();
   const { bookingDetail, bookingDetailLoading, bookingDetailError } = useSelector(
      (state: RootState) => state.payment
   );
   const [pnr, setPnr] = useState("");
   const [surname, setSurname] = useState("");
   const [errors, setErrors] = useState<Record<string, string>>({});

   const handlePnrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = turkishToEnglishUpper(e.target.value);
      value = value.replace(/[^A-Z0-9]/g, '');
      setPnr(value);
   };

   const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = turkishToEnglishUpper(e.target.value);
      value = value.replace(/[^A-Z\s]/g, '');
      setSurname(value);
   };

   const validate = (): boolean => {
      const errs: Record<string, string> = {};
      if (!pnr.trim()) errs.pnr = t.enterPnr;
      if (!surname.trim()) errs.surname = t.enterLastName;
      setErrors(errs);
      return Object.keys(errs).length === 0;
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      dispatch(clearBookingDetail());
      dispatch(getBookingByPnrThunk({ pnr: pnr.trim(), lastName: surname.trim() }));
   };

   const handleNewSearch = () => {
      dispatch(clearBookingDetail());
      setPnr("");
      setSurname("");
      setErrors({});
   };

   const isCancelled = bookingDetail?.status === "Cancelled";
   const hasResult = bookingDetail && !bookingDetail.hasError;

   // Segment labels for round-trip detection
   const getSegmentLabel = (idx: number, total: number): string | undefined => {
      if (total <= 1) return undefined;
      if (idx === 0) return "Gidiş";
      if (idx === total - 1 && total === 2) return "Dönüş";
      return `Segment ${idx + 1}`;
   };

   // Action handlers (placeholder — wire up to real logic)
   const handleDownloadPdf = () => {
      // TODO: integrate with PDF download endpoint
   };
   const handleSendEmail = () => {
      // TODO: integrate with email endpoint
   };
   const handlePrint = () => {
      window.print();
   };
   const handleCancel = () => {
      // TODO: integrate with cancel endpoint
   };
   const handleChange = () => {
      // TODO: integrate with change flow
   };
   const handleOpenTicket = () => {
      // TODO: integrate with open ticket flow
   };

   return (
      <>
         <TrustBar />
         <HeaderOne />
         <main className="pnr-page">
            {/* ===== SEARCH FORM ===== */}
            {!hasResult && (
               <div className="pnr-page__center">
                  <div className="pnr-card">
                     <h1 className="pnr-search__title">
                        {t.bookingCheckTitle}
                     </h1>
                     <form onSubmit={handleSubmit}>
                        <div className="pnr-search__field">
                           <label className="pnr-search__label">
                              {t.pnrCode}
                           </label>
                           <input
                              type="text"
                              className={`pnr-search__input pnr-search__input--pnr ${errors.pnr ? "pnr-search__input--error" : ""}`}
                              placeholder={t.pnrPlaceholder}
                              value={pnr}
                              onChange={handlePnrChange}
                              maxLength={10}
                              autoComplete="off"
                           />
                           {errors.pnr && (
                              <span className="pnr-search__error">{errors.pnr}</span>
                           )}
                        </div>
                        <div className="pnr-search__field">
                           <label className="pnr-search__label">
                              {t.lastName}
                           </label>
                           <input
                              type="text"
                              className={`pnr-search__input ${errors.surname ? "pnr-search__input--error" : ""}`}
                              placeholder={t.lastNamePlaceholder}
                              value={surname}
                              onChange={handleSurnameChange}
                              autoComplete="off"
                           />
                           {errors.surname && (
                              <span className="pnr-search__error">{errors.surname}</span>
                           )}
                        </div>
                        <button
                           type="submit"
                           disabled={bookingDetailLoading}
                           className="pnr-search__btn"
                        >
                           {bookingDetailLoading ? (
                              <>
                                 <Loader2 size={16} className="pnr-spin" />
                                 Sorgulanıyor...
                              </>
                           ) : (
                              <>
                                 <Search size={16} />
                                 {t.query}
                              </>
                           )}
                        </button>
                     </form>
                  </div>

                  {/* Loading skeleton */}
                  {bookingDetailLoading && (
                     <div className="pnr-skeleton">
                        <div className="pnr-card">
                           <div className="pnr-skeleton__block" style={{ width: 96, height: 16, marginBottom: 12 }} />
                           <div className="pnr-skeleton__block" style={{ width: 192, height: 32, marginBottom: 16 }} />
                           <div className="pnr-skeleton__block" style={{ width: 128, height: 12 }} />
                        </div>
                        <div className="pnr-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div>
                              <div className="pnr-skeleton__block" style={{ width: 64, height: 32, marginBottom: 8 }} />
                              <div className="pnr-skeleton__block" style={{ width: 48, height: 12 }} />
                           </div>
                           <div className="pnr-skeleton__block" style={{ width: 80, height: 16 }} />
                           <div style={{ textAlign: 'right' }}>
                              <div className="pnr-skeleton__block" style={{ width: 64, height: 32, marginBottom: 8, marginLeft: 'auto' }} />
                              <div className="pnr-skeleton__block" style={{ width: 48, height: 12, marginLeft: 'auto' }} />
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Error state */}
                  {bookingDetailError && (
                     <div className="pnr-card" style={{ marginTop: 24, borderColor: '#FECACA' }}>
                        <div className="pnr-error">
                           <div className="pnr-error__icon">
                              <AlertTriangle size={20} />
                           </div>
                           <div>
                              <h3 className="pnr-error__title">Sorgulama Başarısız</h3>
                              <p className="pnr-error__text">{bookingDetailError}</p>
                           </div>
                        </div>
                        <button
                           type="button"
                           onClick={handleNewSearch}
                           className="pnr-retry-btn"
                           style={{ width: '100%', marginTop: 16 }}
                        >
                           Tekrar Dene
                        </button>
                     </div>
                  )}

                  {/* Empty state — PNR not found */}
                  {bookingDetail?.hasError && !bookingDetailError && (
                     <div className="pnr-card" style={{ marginTop: 24 }}>
                        <div className="pnr-empty">
                           <div className="pnr-empty__icon">
                              <SearchX size={28} />
                           </div>
                           <h3 className="pnr-empty__title">Rezervasyon Bulunamadı</h3>
                           <p className="pnr-empty__text">
                              Girilen PNR kodu ve soyad ile eşleşen bir rezervasyon bulunamadı. Lütfen bilgilerinizi kontrol ederek tekrar deneyin.
                           </p>
                           <button
                              type="button"
                              onClick={handleNewSearch}
                              className="pnr-retry-btn"
                           >
                              Yeni Sorgulama
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            )}

            {/* ===== RESULT VIEW ===== */}
            {hasResult && (
               <div className="pnr-page__wide">
                  {/* Back to search */}
                  <button type="button" onClick={handleNewSearch} className="pnr-back">
                     <ArrowLeft size={16} />
                     Yeni Sorgulama
                  </button>

                  <div className="pnr-page__grid">
                     {/* Main content */}
                     <div className="pnr-page__main">
                        {/* A. Header Card */}
                        <PnrHeaderCard
                           booking={bookingDetail}
                           onDownloadPdf={handleDownloadPdf}
                           onSendEmail={handleSendEmail}
                           onPrint={handlePrint}
                        />

                        {/* B. Flight Segments */}
                        {bookingDetail.segments?.map((seg, idx) => (
                           <FlightSegmentCard
                              key={idx}
                              segment={seg}
                              index={idx}
                              label={getSegmentLabel(idx, bookingDetail.segments?.length ?? 0)}
                           />
                        ))}

                        {/* C. Passenger & Price */}
                        <div className="pnr-info-grid">
                           <PassengerListCard
                              passengers={bookingDetail.passengers ?? []}
                              tickets={bookingDetail.tickets ?? []}
                           />
                           <PriceBreakdownCard booking={bookingDetail} />
                        </div>

                        {/* D. Rules Accordion */}
                        <RulesAccordion />
                     </div>

                     {/* Sidebar — Action Panel (desktop only, hidden on mobile via CSS) */}
                     <div>
                        <ActionPanel
                           isCancelled={isCancelled}
                           onCancel={handleCancel}
                           onChange={handleChange}
                           onOpenTicket={handleOpenTicket}
                        />
                     </div>
                  </div>

                  {/* Mobile sticky bottom action bar */}
                  <div className="pnr-mobile-bar">
                     <div className="pnr-mobile-bar__inner">
                        {isCancelled ? (
                           <div className="pnr-mobile-bar__cancelled">
                              <AlertTriangle size={16} />
                              Bu bilet iptal edilmiştir
                           </div>
                        ) : (
                           <>
                              <button
                                 type="button"
                                 onClick={handleCancel}
                                 className="pnr-mobile-bar__btn pnr-mobile-bar__btn--cancel"
                              >
                                 İptal Et
                              </button>
                              <button
                                 type="button"
                                 onClick={handleChange}
                                 className="pnr-mobile-bar__btn pnr-mobile-bar__btn--primary"
                              >
                                 Değişiklik
                              </button>
                              <button
                                 type="button"
                                 onClick={handleOpenTicket}
                                 className="pnr-mobile-bar__btn pnr-mobile-bar__btn--secondary"
                              >
                                 Açık Bilet
                              </button>
                           </>
                        )}
                     </div>
                  </div>
               </div>
            )}
         </main>
         <FooterOne />
      </>
   )
}

export default BookingCheckMain
