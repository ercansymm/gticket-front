import HeaderOne from "../layouts/headers/HeaderOne"
import TrustBar from "../components/homes/home-one/TrustBar"
import FooterOne from "../layouts/footers/FooterOne"
import { useState } from "react"
import { useTranslation } from "../context/LanguageContext"
import { useDispatch, useSelector } from "react-redux"
import { getBookingByPnrThunk, clearBookingDetail } from "../redux/features/paymentSlice"
import type { RootState, AppDispatch } from "../redux/store"
import type { BookingStatus } from "@/types/flight"

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

const BOOKING_STATUS_MAP: Record<string, { label: string; color: string }> = {
   PreBooked: { label: 'Ön Rezervasyon', color: '#eab308' },
   Reserved: { label: 'Rezerve Edildi', color: '#f59e0b' },
   Confirmed: { label: 'Onaylandı', color: '#10b981' },
   Paid: { label: 'Ödendi', color: '#3b82f6' },
   Ticketed: { label: 'Biletlendi', color: '#22c55e' },
   Cancelled: { label: 'İptal Edildi', color: '#ef4444' },
   Failed: { label: 'Hata Oluştu', color: '#6b7280' },
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
      dispatch(getBookingByPnrThunk(pnr.trim()));
   };

   const statusInfo = bookingDetail?.status ? BOOKING_STATUS_MAP[bookingDetail.status] : null;

   return (
      <>
         <TrustBar />
         <HeaderOne />
         <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", background: "#f8f9fa" }}>
            <div style={{ width: '100%', maxWidth: 600 }}>
               <div className="bb-booking-check-card">
                  <h1 className="bb-booking-check-card__title">{t.bookingCheckTitle}</h1>
                  <form onSubmit={handleSubmit}>
                     <div className="bb-flight-form__field" style={{ marginBottom: 16 }}>
                        <label className="bb-flight-form__label">{t.pnrCode}</label>
                        <input
                           type="text"
                           className={`bb-flight-form__input ${errors.pnr ? "bb-flight-form__input--error" : ""}`}
                           placeholder={t.pnrPlaceholder}
                           value={pnr}
                           onChange={handlePnrChange}
                           maxLength={10}
                           autoComplete="off"
                        />
                        {errors.pnr && <span className="bb-flight-form__error">{errors.pnr}</span>}
                     </div>
                     <div className="bb-flight-form__field" style={{ marginBottom: 16 }}>
                        <label className="bb-flight-form__label">{t.lastName}</label>
                        <input
                           type="text"
                           className={`bb-flight-form__input ${errors.surname ? "bb-flight-form__input--error" : ""}`}
                           placeholder={t.lastNamePlaceholder}
                           value={surname}
                           onChange={handleSurnameChange}
                           autoComplete="off"
                        />
                        {errors.surname && <span className="bb-flight-form__error">{errors.surname}</span>}
                     </div>
                     <button type="submit" className="bb-flight-form__submit" data-event="booking_check" style={{ width: "100%" }} disabled={bookingDetailLoading}>
                        {bookingDetailLoading ? (
                           <span>Sorgulanıyor...</span>
                        ) : (
                           <><i className="fa-solid fa-magnifying-glass"></i> {t.query}</>
                        )}
                     </button>
                  </form>
               </div>

               {/* Error */}
               {bookingDetailError && (
                  <div className="bb-booking-check-card" style={{ marginTop: 16, borderLeft: '4px solid #ef4444' }}>
                     <p style={{ color: '#ef4444', fontWeight: 500, margin: 0 }}>{bookingDetailError}</p>
                     <button
                        type="button"
                        className="bb-flight-form__submit"
                        style={{ marginTop: 12, width: '100%' }}
                        onClick={() => { dispatch(clearBookingDetail()); }}
                     >
                        Tekrar Dene
                     </button>
                  </div>
               )}

               {/* Result */}
               {bookingDetail && !bookingDetail.hasError && (
                  <div className="bb-booking-check-card" style={{ marginTop: 16 }}>
                     {/* Header */}
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ margin: 0, fontSize: 18 }}>Rezervasyon Detayı</h2>
                        {statusInfo && (
                           <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: 20,
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#fff',
                              backgroundColor: statusInfo.color,
                           }}>
                              {statusInfo.label}
                           </span>
                        )}
                     </div>

                     {/* PNR */}
                     <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid #e5e7eb', marginBottom: 16 }}>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>PNR Kodu</div>
                        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4, color: '#1d4ed8' }}>
                           {bookingDetail.pnr ?? bookingDetail.bookingCode ?? '—'}
                        </div>
                     </div>

                     {/* Route & segments */}
                     {bookingDetail.segments?.map((seg, idx) => (
                        <div key={idx} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                           <div style={{ fontWeight: 600 }}>
                              {seg.originCode} → {seg.destinationCode}
                           </div>
                           <div style={{ fontSize: 13, color: '#6b7280' }}>
                              {seg.departureDay} {seg.departureTime} — {seg.arrivalDay} {seg.arrivalTime}
                           </div>
                           <div style={{ fontSize: 12, color: '#6b7280' }}>
                              {seg.marketingAirline} {seg.flightNumber}
                           </div>
                        </div>
                     ))}

                     {/* Passengers */}
                     {bookingDetail.passengers?.length > 0 && (
                        <div style={{ marginTop: 16, marginBottom: 16 }}>
                           <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Yolcular</h3>
                           {bookingDetail.passengers.map((pax, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                                 <span>{pax.firstName} {pax.lastName}</span>
                                 <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#6b7280' }}>
                                    {pax.ticketNumber ?? pax.paxType}
                                 </span>
                              </div>
                           ))}
                        </div>
                     )}

                     {/* Price */}
                     <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #e5e7eb', fontWeight: 700 }}>
                        <span>Toplam</span>
                        <span>{(bookingDetail.grandTotal || bookingDetail.totalFare)?.toFixed(2)} {bookingDetail.currency}</span>
                     </div>

                     {bookingDetail.createdAt && (
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
                           Oluşturulma: {new Date(bookingDetail.createdAt).toLocaleString('tr-TR')}
                        </div>
                     )}
                  </div>
               )}
            </div>
         </main>
         <FooterOne />
      </>
   )
}

export default BookingCheckMain
