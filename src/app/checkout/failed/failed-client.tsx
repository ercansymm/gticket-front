"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';

interface PaymentStatusInfo {
  bookingId: string;
  pnr: string | null;
  status: string | null;
  grandTotal: number | null;
  currency: string | null;
  origin: string | null;
  destination: string | null;
  ticketTimeLimit: string | null;
  isExpired: boolean;
  remainingMinutes: number | null;
  isAlreadyPaid: boolean;
  isCancelled: boolean;
  canRetry: boolean;
}

/* ── Banka/BiletBank teknik hata mesajlarini kullaniciya nazik Turkce mesajlara cevir ── */
function humanizeError(raw: string | null): { title: string; detail: string } {
  if (!raw) {
    return {
      title: 'Ödeme tamamlanamadı',
      detail: 'Ödemeniz işlenirken beklenmeyen bir sorun oluştu. Lütfen tekrar deneyiniz.',
    };
  }

  const lower = raw.toLowerCase();

  if (lower.includes('3d') && (lower.includes('not approved') || lower.includes('denied') || lower.includes('reject'))) {
    return {
      title: '3D Secure doğrulaması reddedildi',
      detail: 'Bankanız 3D Secure adımında ödemeyi onaylamadı. Bilgilerinizi kontrol edip tekrar deneyebilir veya farklı bir kartla ödeme yapabilirsiniz.',
    };
  }

  if (lower.includes('cardinformationisnotvalid') || lower.includes('card information')) {
    return {
      title: 'Kart bilgileri geçersiz',
      detail: 'Girdiğiniz kart bilgileri banka tarafından doğrulanamadı. Kart numarası, son kullanma tarihi ve CVV bilgilerini kontrol ediniz.',
    };
  }

  if (lower.includes('insufficient') || lower.includes('limit')) {
    return {
      title: 'Yetersiz bakiye / limit',
      detail: 'Kart limitiniz veya bakiyeniz bu işlem için yeterli değil. Farklı bir kart deneyiniz.',
    };
  }

  if (lower.includes('timeout') || lower.includes('zaman')) {
    return {
      title: 'Bağlantı zaman aşımına uğradı',
      detail: 'Banka ile iletişimde gecikme yaşandı. Lütfen birkaç saniye sonra tekrar deneyiniz.',
    };
  }

  if (lower.includes('session')) {
    return {
      title: 'Oturum süresi doldu',
      detail: 'Ödeme oturumunuz sona erdi. Lütfen uçuşunuzu yeniden seçerek işlemi baştan başlatınız.',
    };
  }

  return {
    title: 'Ödeme tamamlanamadı',
    detail: raw,
  };
}

function formatRemaining(minutes: number | null): string {
  if (minutes === null || minutes <= 0) return '';
  if (minutes < 60) return `${minutes} dakika`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} saat ${m} dakika` : `${h} saat`;
}

function formatTimeLimit(iso: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function FailedClient() {
  const searchParams = useSearchParams();
  const [errorInfo, setErrorInfo] = useState<{ title: string; detail: string }>({
    title: 'Ödeme tamamlanamadı',
    detail: '',
  });
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [statusInfo, setStatusInfo] = useState<PaymentStatusInfo | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);

  useEffect(() => {
    const rawError = searchParams.get('error');
    setErrorInfo(humanizeError(rawError));
    const bid = searchParams.get('bookingId');
    setBookingId(bid);

    // Olasi 3DS oturum izlerini temizle
    try {
      sessionStorage.removeItem('payment_3ds_session');
    } catch {
      // sessionStorage erisilemiyorsa sessizce gec
    }

    // Rezervasyonun hala gecerli olup olmadigini ve kalan sureyi backend'den cek
    if (bid) {
      setStatusLoading(true);
      fetch(`/api/flight/booking/${encodeURIComponent(bid)}/payment-status`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: PaymentStatusInfo | null) => {
          if (data && data.bookingId) {
            setStatusInfo(data);
            setRemainingMinutes(data.remainingMinutes);
          }
        })
        .catch(() => {
          // Sessizce gec — eski davranisa fallback
        })
        .finally(() => setStatusLoading(false));
    }
  }, [searchParams]);

  // Geri sayim — her dakika remainingMinutes'i azalt
  useEffect(() => {
    if (remainingMinutes === null || remainingMinutes <= 0) return;
    const id = setInterval(() => {
      setRemainingMinutes((prev) => (prev === null ? null : Math.max(0, prev - 1)));
    }, 60_000);
    return () => clearInterval(id);
  }, [remainingMinutes]);

  const isExpired = statusInfo?.isExpired === true || (remainingMinutes !== null && remainingMinutes <= 0);
  const canRetry = statusInfo?.canRetry === true && !isExpired;
  const showCountdown = statusInfo?.ticketTimeLimit && !isExpired && !statusInfo.isAlreadyPaid && !statusInfo.isCancelled;

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <HeaderOne />

      <section className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Üst kırmızı şerit */}
          <div className="bg-red-50 border-b border-red-100 px-8 py-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">{errorInfo.title}</h1>
              <p className="text-sm text-slate-500 mt-0.5">Biletiniz oluşturulmadı, kartınızdan ücret çekilmedi.</p>
            </div>
          </div>

          {/* İçerik */}
          <div className="px-8 py-6 space-y-5">
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-700 leading-relaxed">
              {errorInfo.detail}
            </div>

            {bookingId && (
              <div className="text-xs text-slate-400">
                İşlem referansı: <span className="font-mono text-slate-500">{bookingId}</span>
                {statusInfo?.pnr && (
                  <>
                    {' · '}PNR: <span className="font-mono text-slate-500">{statusInfo.pnr}</span>
                  </>
                )}
              </div>
            )}

            {/* Rezervasyon süresi durumu */}
            {statusLoading && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-500">
                Rezervasyon durumu kontrol ediliyor…
              </div>
            )}

            {!statusLoading && showCountdown && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-emerald-900">Rezervasyonunuz hâlâ geçerli</h3>
                    <p className="text-sm text-emerald-900/90 mt-1">
                      {remainingMinutes !== null && remainingMinutes > 0 ? (
                        <>
                          Kalan süre: <span className="font-semibold">{formatRemaining(remainingMinutes)}</span>
                        </>
                      ) : (
                        <>Son tarihe kadar geçerli: <span className="font-semibold">{formatTimeLimit(statusInfo!.ticketTimeLimit)}</span></>
                      )}
                    </p>
                    <p className="text-xs text-emerald-900/70 mt-1">
                      Bu süre içinde aynı rezervasyon üzerinden tekrar ödeme yapabilirsiniz. Süre dolarsa koltuk yeniden satışa açılır ve yeni arama yapmanız gerekir.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!statusLoading && isExpired && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
                <h3 className="text-sm font-semibold text-red-900 mb-1">Rezervasyon süresi doldu</h3>
                <p className="text-sm text-red-900/90">
                  Maalesef rezervasyonunuzun ödeme süresi doldu ve koltuk yeniden satışa açıldı. Lütfen yeni bir arama yaparak tekrar deneyin.
                </p>
              </div>
            )}

            {!statusLoading && statusInfo?.isAlreadyPaid && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                <h3 className="text-sm font-semibold text-emerald-900 mb-1">Bu rezervasyonun ödemesi zaten yapılmış</h3>
                <p className="text-sm text-emerald-900/90">
                  Biletiniz oluşturuldu. &quot;Biletlerim&quot; sayfasından detayları görüntüleyebilirsiniz.
                </p>
              </div>
            )}

            {!isExpired && !statusInfo?.isAlreadyPaid && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
                <h3 className="text-sm font-semibold text-amber-900 mb-1">Ne yapabilirsiniz?</h3>
                <ul className="text-sm text-amber-900/90 list-disc list-inside space-y-1">
                  <li>Kart bilgilerinizi kontrol edip tekrar deneyebilirsiniz.</li>
                  <li>Farklı bir banka kartı ile ödeme yapabilirsiniz.</li>
                  <li>Sorun devam ederse bankanızla iletişime geçiniz.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Aksiyonlar */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            {canRetry ? (
              <Link
                href={bookingId ? `/checkout/payment?bookingId=${encodeURIComponent(bookingId)}` : '/checkout/payment'}
                className="flex-1 text-center py-3 px-5 rounded-lg bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition-colors"
              >
                Ödemeyi Tekrar Dene
              </Link>
            ) : isExpired ? (
              <Link
                href="/"
                className="flex-1 text-center py-3 px-5 rounded-lg bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition-colors"
              >
                Yeni Arama Yap
              </Link>
            ) : (
              // Status henuz cekilmediyse eski davranis
              <Link
                href="/checkout/payment"
                className="flex-1 text-center py-3 px-5 rounded-lg bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition-colors"
              >
                Ödemeyi Tekrar Dene
              </Link>
            )}
            <Link
              href="/"
              className="flex-1 text-center py-3 px-5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-white transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </section>

      <FooterOne />
    </main>
  );
}
