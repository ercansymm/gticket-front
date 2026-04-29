import HeaderOne from "../layouts/headers/HeaderOne"
import TrustBar from "../components/homes/home-one/TrustBar"
import FooterOne from "../layouts/footers/FooterOne"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
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
import TicketRequestForm, { TicketRequestPayload, TicketRequestType } from "../components/pnr/TicketRequestForm"
import {
   saveGuestSession,
   getGuestSession,
   clearGuestSession,
   guestFetch,
} from "../lib/guest-support"

// Frontend talep tipi -> backend SupportTicketType enum
// (Refund=1, Change=2, Complaint=3, Technical=4)
const REQUEST_TYPE_TO_BACKEND: Record<TicketRequestType, number> = {
   iptal: 1,
   degisiklik: 2,
   tekerlekli_sandalye: 3,
   ozel_yemek: 3,
   bagaj: 3,
   diger: 3,
};

const REQUEST_TYPE_LABEL: Record<TicketRequestType, string> = {
   iptal: "İptal Talebi",
   degisiklik: "Değişiklik Talebi",
   tekerlekli_sandalye: "Tekerlekli Sandalye Talebi",
   ozel_yemek: "Özel Yemek Talebi",
   bagaj: "Ek Bagaj Talebi",
   diger: "Genel Talep",
};

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
   const router = useRouter();
   const { status: authStatus } = useSession();
   const isAuthenticated = authStatus === "authenticated";
   const dispatch = useDispatch<AppDispatch>();
   const { bookingDetail, bookingDetailLoading, bookingDetailError } = useSelector(
      (state: RootState) => state.payment
   );
   const [pnr, setPnr] = useState("");
   const [surname, setSurname] = useState("");
   const [errors, setErrors] = useState<Record<string, string>>({});
   const [showMobileRequestModal, setShowMobileRequestModal] = useState(false);
   const [mobileSubmitting, setMobileSubmitting] = useState(false);
   const [guestSessionReady, setGuestSessionReady] = useState(false);

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
      // Misafir oturumu da temizle ki başka PNR sorgulamasında karışmasın
      if (!isAuthenticated) {
         clearGuestSession();
         setGuestSessionReady(false);
      }
   };

   const isCancelled = bookingDetail?.status === "Cancelled";
   const hasResult = bookingDetail && !bookingDetail.hasError;

   // Misafir kullan\u0131c\u0131 PNR + soyad ile ba\u015far\u0131l\u0131 sorgu yapt\u0131\u011f\u0131nda
   // arka planda misafir destek token'\u0131 al\u0131p sessionStorage'a yaz\u0131yoruz.
   // B\u00f6ylece "\u0130\u015flemler" panelinden talep olu\u015fturabilirler.
   useEffect(() => {
      if (isAuthenticated) return;
      if (!hasResult) return;
      if (guestSessionReady) return;

      const existing = getGuestSession();
      if (existing && existing.pnr === bookingDetail?.pnr) {
         setGuestSessionReady(true);
         return;
      }

      const pnrCode = (bookingDetail?.pnr || pnr).trim().toUpperCase();
      const surnameValue = surname.trim();
      if (!pnrCode || !surnameValue) return;

      let cancelled = false;
      (async () => {
         try {
            const res = await fetch("/api/support/guest/lookup", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ pnr: pnrCode, surname: surnameValue }),
               cache: "no-store",
            });
            if (!res.ok) return;
            const data = await res.json().catch(() => null);
            if (cancelled || !data?.token) return;
            saveGuestSession({
               token: data.token,
               expiresAt: data.expiresAt,
               pnr: data.pnr,
               passengerDisplayName: data.passengerDisplayName,
               bookingId: data.bookingId,
            });
            setGuestSessionReady(true);
         } catch {
            // Sessizce yutulur; panel yine giri\u015f yapan kullan\u0131c\u0131 deneyimini bozmaz.
         }
      })();

      return () => {
         cancelled = true;
      };
   }, [isAuthenticated, hasResult, bookingDetail, pnr, surname, guestSessionReady]);

   const canCreateRequest = isAuthenticated || guestSessionReady;

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

   const handleSubmitRequest = async (data: TicketRequestPayload) => {
      const pnrCode = bookingDetail?.pnr ?? "";
      const typeLabel = REQUEST_TYPE_LABEL[data.type] ?? "Talep";
      const backendType = REQUEST_TYPE_TO_BACKEND[data.type] ?? 3;

      const subject = pnrCode
         ? `${typeLabel} - PNR ${pnrCode}`
         : typeLabel;

      const message = [
         `Talep tipi: ${typeLabel}`,
         pnrCode ? `PNR: ${pnrCode}` : null,
         "",
         data.description,
      ]
         .filter(Boolean)
         .join("\n");

      // Not: BookingId backend'de "kullanıcıya ait olmalı" kontrolü yapıyor.
      // PNR sorgulama akışında kullanıcı kendine ait olmayan bir bilet için de
      // talep açabildiğinden bookingId göndermiyoruz; PNR konu ve mesajda yer alıyor,
      // admin paneli üzerinden eşleştirilebilir. Backend'de Refund/Change tipleri
      // bookingId zorunlu kılındığı için bu tipleri Complaint(3) olarak gönderiyoruz.
      const safeBackendType = (backendType === 1 || backendType === 2) ? 3 : backendType;

      const payload: Record<string, unknown> = {
         type: safeBackendType,
         subject,
         message,
      };

      // Giriş yapmış kullanıcı -> normal endpoint
      // Misafir (token sahibi) -> guest endpoint
      const useGuest = !isAuthenticated && guestSessionReady;
      const res = useGuest
         ? await guestFetch("/api/support/guest/tickets", {
              method: "POST",
              body: JSON.stringify(payload),
           })
         : await fetch("/api/support/tickets", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
           });

      if (!res.ok) {
         const err = await res.json().catch(() => ({}));
         throw new Error(err?.error || "Talep gönderilirken bir hata oluştu.");
      }

      const created = await res.json().catch(() => null);
      const newId = (created && (created as { id?: string }).id) || null;

      alert("Talebiniz alınmıştır. Destek ekibimiz en kısa sürede sizinle iletişime geçecektir.");
      if (useGuest) {
         router.push(newId ? `/destek/talepler/${newId}` : "/destek/talepler");
      } else {
         router.push(newId ? `/destek-taleplerim/${newId}` : "/destek-taleplerim");
      }
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

                     {/* Sidebar — Action Panel (giriş yapan kullanıcı veya misafir token sahibi) */}
                     <div>
                        <ActionPanel
                           isCancelled={isCancelled}
                           onSubmitRequest={handleSubmitRequest}
                           allowGuest={guestSessionReady}
                        />
                     </div>
                  </div>

                  {/* Mobile sticky bottom action bar */}
                  {canCreateRequest && (
                     <div className="pnr-mobile-bar">
                        <div className="pnr-mobile-bar__inner">
                           <button
                              type="button"
                              onClick={() => setShowMobileRequestModal(true)}
                              className="pnr-mobile-bar__btn pnr-mobile-bar__btn--cancel"
                              style={{ width: "100%" }}
                           >
                              Talep Oluştur
                           </button>
                        </div>
                     </div>
                  )}
                  {canCreateRequest && showMobileRequestModal && (
                     <TicketRequestForm
                        submitting={mobileSubmitting}
                        onClose={() => {
                           if (!mobileSubmitting) setShowMobileRequestModal(false);
                        }}
                        onSubmit={async (data) => {
                           try {
                              setMobileSubmitting(true);
                              await handleSubmitRequest(data);
                              setShowMobileRequestModal(false);
                           } finally {
                              setMobileSubmitting(false);
                           }
                        }}
                     />
                  )}
               </div>
            )}
         </main>
         <FooterOne />
      </>
   )
}

export default BookingCheckMain
