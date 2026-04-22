"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterOne from '@/layouts/footers/FooterOne';

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

export default function FailedClient() {
  const searchParams = useSearchParams();
  const [errorInfo, setErrorInfo] = useState<{ title: string; detail: string }>({
    title: 'Ödeme tamamlanamadı',
    detail: '',
  });
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const rawError = searchParams.get('error');
    setErrorInfo(humanizeError(rawError));
    setBookingId(searchParams.get('bookingId'));

    // Olasi 3DS oturum izlerini temizle
    try {
      sessionStorage.removeItem('payment_3ds_session');
    } catch {
      // sessionStorage erisilemiyorsa sessizce gec
    }
  }, [searchParams]);

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
              <p className="text-sm text-slate-500 mt-0.5">Biletiniz oluşturulmadı, kartınızdan ücret tahsil edilmedi.</p>
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
              </div>
            )}

            <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">Ne yapabilirsiniz?</h3>
              <ul className="text-sm text-amber-900/90 list-disc list-inside space-y-1">
                <li>Kart bilgilerinizi kontrol edip tekrar deneyebilirsiniz.</li>
                <li>Farklı bir banka kartı ile ödeme yapabilirsiniz.</li>
                <li>Sorun devam ederse bankanızla iletişime geçiniz.</li>
              </ul>
            </div>
          </div>

          {/* Aksiyonlar */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <Link
              href="/checkout/payment"
              className="flex-1 text-center py-3 px-5 rounded-lg bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition-colors"
            >
              Ödemeyi Tekrar Dene
            </Link>
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
