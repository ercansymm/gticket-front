"use client";

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';
import type { RootState } from '@/redux/store';

export default function CheckoutClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const { allocateResult, selectedFlight, searchParams } = useSelector(
    (state: RootState) => state.flight
  );

  useEffect(() => {
    if (!allocateResult) {
      router.push('/');
    }
  }, [allocateResult, router]);

  if (!allocateResult || !selectedFlight) {
    return null;
  }

  const { priceSummary, passengers, isPriceChanged } = allocateResult;

  if (!priceSummary) {
    return null;
  }

  return (
    <>
      <HeaderOne />
      <main className="bb-checkout">
        {/* Misafir / Üye banner */}
        {session?.user ? (
          <div className="bb-checkout__auth-banner" style={{
            background: '#f0fdf4', borderLeft: '4px solid #22c55e', borderRadius: 8,
            padding: '12px 20px', marginBottom: 20, color: '#166534',
          }}>
            Hoş geldiniz, <strong>{session.user.name}</strong>
          </div>
        ) : (
          <div className="bb-checkout__auth-banner" style={{
            background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: 8,
            padding: '16px 20px', marginBottom: 20, color: '#1e40af',
          }}>
            <p style={{ margin: 0, marginBottom: 10 }}>
              Misafir olarak devam edebilirsiniz. Üye olarak giriş yaparsanız biletlerinizi hesabınızdan takip edebilirsiniz.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="bb-error-modal__btn bb-error-modal__btn--retry"
                style={{ padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
                onClick={() => {}}
              >
                Misafir Olarak Devam Et
              </button>
              <button
                className="bb-error-modal__btn bb-error-modal__btn--close"
                style={{ padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
                onClick={() => window.open('/login?callbackUrl=/checkout', '_blank')}
              >
                Giriş Yap
              </button>
            </div>
          </div>
        )}

        {/* Fiyat değişikliği uyarısı */}
        {isPriceChanged && (
          <div className="bb-checkout__price-warning" style={{
            background: '#fff3f3', border: '1px solid #e74c3c', borderRadius: 8,
            padding: '12px 20px', marginBottom: 20, color: '#c0392b', fontWeight: 600,
          }}>
            ⚠ Fiyat güncellenmiştir. Lütfen yeni fiyatı kontrol ediniz.
          </div>
        )}

        {/* Uçuş Özeti */}
        <section className="bb-checkout__flight-summary" style={{
          background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,.08)',
        }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Uçuş Özeti</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <strong>{selectedFlight.airlineName}</strong>
              <span style={{ marginLeft: 8, color: '#666' }}>{selectedFlight.flightNumber}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {selectedFlight.departureTime}
              <span style={{ margin: '0 8px', color: '#999', fontSize: 14 }}>→</span>
              {selectedFlight.arrivalTime}
            </div>
            <div style={{ color: '#666' }}>
              {selectedFlight.originCode} — {selectedFlight.destinationCode}
            </div>
            <div style={{ color: '#888', fontSize: 14 }}>
              {selectedFlight.durationFormatted}
            </div>
          </div>
          <div style={{ marginTop: 8, color: '#555', fontSize: 14 }}>
            {selectedFlight.departureDate}
          </div>
        </section>

        {/* Fiyat Özeti */}
        <section className="bb-checkout__price-summary" style={{
          background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,.08)',
        }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Fiyat Özeti</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '6px 0' }}>Bilet Ücreti</td>
                <td style={{ textAlign: 'right' }}>{priceSummary.totalBaseFare.toFixed(2)} {priceSummary.currency}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0' }}>Vergiler</td>
                <td style={{ textAlign: 'right' }}>{priceSummary.totalTaxes.toFixed(2)} {priceSummary.currency}</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0' }}>Hizmet Bedeli</td>
                <td style={{ textAlign: 'right' }}>{priceSummary.totalServiceFee.toFixed(2)} {priceSummary.currency}</td>
              </tr>
              <tr style={{ borderTop: '2px solid #eee', fontWeight: 700, fontSize: 16 }}>
                <td style={{ padding: '10px 0' }}>Toplam</td>
                <td style={{ textAlign: 'right' }}>{priceSummary.grandTotal.toFixed(2)} {priceSummary.currency}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Yolcular */}
        <section className="bb-checkout__passengers" style={{
          background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,.08)',
        }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Yolcular</h2>
          {passengers.map((pax) => (
            <div key={pax.sequenceNo} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '1px solid #f0f0f0',
            }}>
              <span>Yolcu {pax.sequenceNo}</span>
              <span style={{ color: '#666' }}>{pax.type}</span>
            </div>
          ))}
          <p style={{ marginTop: 16, color: '#999', fontStyle: 'italic' }}>
            Yolcu bilgilerini doldurunuz
          </p>
        </section>

        {/* Butonlar */}
        <div className="bb-checkout__actions" style={{
          display: 'flex', gap: 12, justifyContent: 'flex-end', marginBottom: 40,
        }}>
          <button
            className="bb-error-modal__btn bb-error-modal__btn--close"
            onClick={() => router.push('/search-results')}
            style={{ padding: '12px 28px', borderRadius: 8, cursor: 'pointer' }}
          >
            Geri Dön
          </button>
          <button
            className="bb-error-modal__btn bb-error-modal__btn--retry"
            disabled
            title="Yolcu bilgi formu yakında eklenecek"
            style={{ padding: '12px 28px', borderRadius: 8, opacity: 0.5, cursor: 'not-allowed' }}
          >
            Devam Et
          </button>
        </div>
      </main>
      <FooterOne />
    </>
  );
}
