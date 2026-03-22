"use client";

import { useState, useCallback, useMemo } from 'react';
import type { PassengerItem, ContactInfo } from '@/types/booking';
import type { AllocatePassenger } from '@/types/flight';

/* ───────── helpers ───────── */

const PAX_LABELS: Record<string, { tr: string; icon: string }> = {
  ADT: { tr: 'Yetişkin', icon: '👤' },
  CHD: { tr: 'Çocuk', icon: '🧒' },
  INF: { tr: 'Bebek', icon: '👶' },
};

/** Convert pax type from allocate ("ADT"/"CHD"/"INF") */
function normalizePaxType(type: string | null): 'ADT' | 'CHD' | 'INF' {
  const t = (type ?? 'ADT').toUpperCase();
  if (t === 'CHD' || t === 'CHILD') return 'CHD';
  if (t === 'INF' || t === 'INFANT') return 'INF';
  return 'ADT';
}

/** Generate age limits for date pickers based on pax type */
function getDateLimits(paxType: 'ADT' | 'CHD' | 'INF'): { min: string; max: string } {
  const today = new Date();
  const yyyy = (d: Date) => d.toISOString().slice(0, 10);
  if (paxType === 'INF') {
    const min = new Date(today);
    min.setFullYear(min.getFullYear() - 2);
    return { min: yyyy(min), max: yyyy(today) };
  }
  if (paxType === 'CHD') {
    const min = new Date(today);
    min.setFullYear(min.getFullYear() - 12);
    const max = new Date(today);
    max.setFullYear(max.getFullYear() - 2);
    return { min: yyyy(min), max: yyyy(max) };
  }
  // ADT — at least 12 years old
  const max = new Date(today);
  max.setFullYear(max.getFullYear() - 12);
  const min = new Date(today);
  min.setFullYear(min.getFullYear() - 120);
  return { min: yyyy(min), max: yyyy(max) };
}

function turkishToUpper(s: string): string {
  return s
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .replace(/ğ/g, 'Ğ')
    .replace(/ü/g, 'Ü')
    .replace(/ş/g, 'Ş')
    .replace(/ö/g, 'Ö')
    .replace(/ç/g, 'Ç')
    .toUpperCase();
}

/** TC Kimlik No algoritma kontrolü */
function isValidTCKimlik(tc: string): boolean {
  if (!/^\d{11}$/.test(tc)) return false;
  if (tc[0] === '0') return false;

  const digits = tc.split('').map(Number);

  // 10. hane kontrolü: ((d1+d3+d5+d7+d9)*7 - (d2+d4+d6+d8)) % 10 === d10
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  if ((oddSum * 7 - evenSum) % 10 !== digits[9]) return false;

  // 11. hane kontrolü: (d1+d2+d3+...+d10) % 10 === d11
  const total = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  if (total % 10 !== digits[10]) return false;

  return true;
}

/* ───────── types ───────── */

interface PassengerFormData {
  firstName: string;
  lastName: string;
  gender: 'M' | 'F' | '';
  birthDate: string;
  citizenNo: string;
  isTurkishCitizen: boolean;
  passportNo: string;
  passportCountry: string;
  nationality: string;
}

interface FormErrors {
  [key: string]: string;
}

export interface PassengerFormProps {
  passengers: AllocatePassenger[];
  onSubmit: (passengers: PassengerItem[], contact: ContactInfo) => void;
  loading?: boolean;
  disabled?: boolean;
}

/* ───────── component ───────── */

export default function PassengerForm({ passengers, onSubmit, loading, disabled }: PassengerFormProps) {
  const sortedPassengers = useMemo(() =>
    [...passengers].sort((a, b) => {
      const order = { ADT: 0, CHD: 1, INF: 2 };
      const aType = normalizePaxType(a.type);
      const bType = normalizePaxType(b.type);
      return (order[aType] - order[bType]) || (a.sequenceNo - b.sequenceNo);
    }),
    [passengers]
  );

  // Initialize form data per passenger
  const [forms, setForms] = useState<PassengerFormData[]>(() =>
    sortedPassengers.map(() => ({
      firstName: '',
      lastName: '',
      gender: '',
      birthDate: '',
      citizenNo: '',
      isTurkishCitizen: true,
      passportNo: '',
      passportCountry: '',
      nationality: 'TR',
    }))
  );

  const [contact, setContact] = useState<{ email: string; phone: string }>({
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState<FormErrors[]>(() =>
    sortedPassengers.map(() => ({}))
  );
  const [contactErrors, setContactErrors] = useState<{ email?: string; phone?: string }>({});
  const [expandedPax, setExpandedPax] = useState<number>(0);

  /* ── field update ── */
  const updateField = useCallback((index: number, field: keyof PassengerFormData, value: string | boolean) => {
    setForms(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    // Clear field error on change
    setErrors(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: '' };
      return next;
    });
  }, []);

  /* ── validation ── */
  const validatePassenger = useCallback((form: PassengerFormData, paxType: 'ADT' | 'CHD' | 'INF'): FormErrors => {
    const e: FormErrors = {};
    if (!form.gender) e.gender = 'Cinsiyet seçiniz';
    if (!form.firstName.trim() || form.firstName.trim().length < 2) e.firstName = 'Ad gereklidir (en az 2 harf)';
    if (!form.lastName.trim() || form.lastName.trim().length < 2) e.lastName = 'Soyad gereklidir (en az 2 harf)';
    if (!form.birthDate) {
      e.birthDate = 'Doğum tarihi gereklidir';
    } else {
      const limits = getDateLimits(paxType);
      if (form.birthDate < limits.min || form.birthDate > limits.max) {
        e.birthDate = paxType === 'ADT' ? '12 yaş ve üzeri olmalıdır'
          : paxType === 'CHD' ? '2–12 yaş arası olmalıdır'
          : '0–2 yaş arası olmalıdır';
      }
    }
    if (form.isTurkishCitizen) {
      if (paxType !== 'INF' && (!form.citizenNo || !isValidTCKimlik(form.citizenNo))) {
        e.citizenNo = 'Geçerli TC kimlik no giriniz (11 hane, algoritma kontrolü)';
      }
    } else {
      if (!form.passportNo || form.passportNo.trim().length < 5) {
        e.passportNo = 'Pasaport numarası gereklidir';
      }
      if (!form.passportCountry || form.passportCountry.length !== 2) {
        e.passportCountry = 'Pasaport ülkesi seçiniz';
      }
    }
    return e;
  }, []);

  const validateContact = useCallback((): { email?: string; phone?: string } => {
    const e: { email?: string; phone?: string } = {};
    if (!contact.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      e.email = 'Geçerli bir e-posta adresi giriniz';
    }
    if (!contact.phone || !/^\+?[\d\s()-]{10,20}$/.test(contact.phone)) {
      e.phone = 'Geçerli bir telefon numarası giriniz';
    }
    return e;
  }, [contact]);

  /* ── submit ── */
  const handleSubmit = useCallback(() => {
    // Validate all passengers
    let hasError = false;
    const newErrors = sortedPassengers.map((pax, i) => {
      const paxType = normalizePaxType(pax.type);
      const e = validatePassenger(forms[i], paxType);
      if (Object.keys(e).length > 0) hasError = true;
      return e;
    });
    setErrors(newErrors);

    // Validate contact
    const cErrors = validateContact();
    setContactErrors(cErrors);
    if (Object.keys(cErrors).length > 0) hasError = true;

    if (hasError) {
      // focus first error section
      const firstErrorIdx = newErrors.findIndex(e => Object.keys(e).length > 0);
      if (firstErrorIdx >= 0) setExpandedPax(firstErrorIdx);
      return;
    }

    // Build passenger items
    const passengerItems: PassengerItem[] = sortedPassengers.map((pax, i) => {
      const form = forms[i];
      const paxType = normalizePaxType(pax.type);
      return {
        paxType,
        sequenceNo: pax.sequenceNo,
        firstName: turkishToUpper(form.firstName.trim()),
        lastName: turkishToUpper(form.lastName.trim()),
        gender: form.gender as 'M' | 'F',
        birthDate: form.birthDate,
        citizenNo: form.isTurkishCitizen ? form.citizenNo : null,
        passportNo: !form.isTurkishCitizen ? form.passportNo.toUpperCase() : null,
        passportCountry: !form.isTurkishCitizen ? form.passportCountry.toUpperCase() : null,
        nationality: form.nationality.toUpperCase() || 'TR',
        tempTag: pax.tempTag ?? null,
        paxReferenceId: pax.paxReferenceId ?? null,
      };
    });

    const contactInfo: ContactInfo = {
      email: contact.email.trim().toLowerCase(),
      phone: contact.phone.trim(),
    };

    onSubmit(passengerItems, contactInfo);
  }, [sortedPassengers, forms, contact, onSubmit, validatePassenger, validateContact]);

  /* ── render helpers ── */
  const renderPassengerPanel = (pax: AllocatePassenger, index: number) => {
    const paxType = normalizePaxType(pax.type);
    const label = PAX_LABELS[paxType];
    const form = forms[index];
    const err = errors[index] || {};
    const dateLimits = getDateLimits(paxType);
    const isOpen = expandedPax === index;
    const paxCountOfType = sortedPassengers.filter(p => normalizePaxType(p.type) === paxType);
    const paxIndex = paxCountOfType.findIndex(p => p.sequenceNo === pax.sequenceNo) + 1;
    const hasErrors = Object.keys(err).some(k => err[k]);

    return (
      <div key={pax.sequenceNo} className={`bb-pax-panel ${isOpen ? 'bb-pax-panel--open' : ''} ${hasErrors ? 'bb-pax-panel--error' : ''}`}>
        {/* Panel header */}
        <button
          type="button"
          className="bb-pax-panel__header"
          onClick={() => setExpandedPax(isOpen ? -1 : index)}
          aria-expanded={isOpen}
        >
          <div className="bb-pax-panel__header-left">
            <span className="bb-pax-panel__number">{index + 1}</span>
            <span className="bb-pax-panel__title">
              {paxIndex}. Yolcu Bilgisi
            </span>
            <span className={`bb-pax-panel__badge bb-pax-panel__badge--${paxType.toLowerCase()}`}>
              {label.tr}
            </span>
          </div>
          <div className="bb-pax-panel__header-right">
            {form.firstName && form.lastName && (
              <span className="bb-pax-panel__preview">
                {turkishToUpper(form.firstName)} {turkishToUpper(form.lastName)}
              </span>
            )}
            <span className={`bb-pax-panel__chevron ${isOpen ? 'bb-pax-panel__chevron--open' : ''}`}>
              ▾
            </span>
          </div>
        </button>

        {/* Panel body */}
        {isOpen && (
          <div className="bb-pax-panel__body">
            <p className="bb-pax-panel__notice">
              Lütfen adınızı ve soyadınızı pasaport veya nüfus cüzdanınızda göründüğü gibi eksiksiz yazınız.
            </p>

            {/* Gender */}
            <div className="bb-pax-panel__row">
              <div className="bb-pax-panel__field bb-pax-panel__field--gender">
                <div className="bb-pax-panel__gender-group">
                  {paxType === 'INF' ? (
                    <>
                      <label className={`bb-pax-panel__gender-btn ${form.gender === 'M' ? 'bb-pax-panel__gender-btn--active' : ''}`}>
                        <input type="radio" name={`gender-${index}`} value="M" checked={form.gender === 'M'}
                          onChange={() => updateField(index, 'gender', 'M')} />
                        Erkek bebek
                      </label>
                      <label className={`bb-pax-panel__gender-btn ${form.gender === 'F' ? 'bb-pax-panel__gender-btn--active' : ''}`}>
                        <input type="radio" name={`gender-${index}`} value="F" checked={form.gender === 'F'}
                          onChange={() => updateField(index, 'gender', 'F')} />
                        Kız bebek
                      </label>
                    </>
                  ) : paxType === 'CHD' ? (
                    <>
                      <label className={`bb-pax-panel__gender-btn ${form.gender === 'M' ? 'bb-pax-panel__gender-btn--active' : ''}`}>
                        <input type="radio" name={`gender-${index}`} value="M" checked={form.gender === 'M'}
                          onChange={() => updateField(index, 'gender', 'M')} />
                        Erkek çocuk
                      </label>
                      <label className={`bb-pax-panel__gender-btn ${form.gender === 'F' ? 'bb-pax-panel__gender-btn--active' : ''}`}>
                        <input type="radio" name={`gender-${index}`} value="F" checked={form.gender === 'F'}
                          onChange={() => updateField(index, 'gender', 'F')} />
                        Kız çocuk
                      </label>
                    </>
                  ) : (
                    <>
                      <label className={`bb-pax-panel__gender-btn ${form.gender === 'M' ? 'bb-pax-panel__gender-btn--active' : ''}`}>
                        <input type="radio" name={`gender-${index}`} value="M" checked={form.gender === 'M'}
                          onChange={() => updateField(index, 'gender', 'M')} />
                        Bay
                      </label>
                      <label className={`bb-pax-panel__gender-btn ${form.gender === 'F' ? 'bb-pax-panel__gender-btn--active' : ''}`}>
                        <input type="radio" name={`gender-${index}`} value="F" checked={form.gender === 'F'}
                          onChange={() => updateField(index, 'gender', 'F')} />
                        Bayan
                      </label>
                    </>
                  )}
                </div>
                {err.gender && <span className="bb-pax-panel__error">{err.gender}</span>}
              </div>
            </div>

            {/* Name fields */}
            <div className="bb-pax-panel__row">
              <div className={`bb-pax-panel__field ${err.firstName ? 'bb-pax-panel__field--error' : ''}`}>
                <label className="bb-pax-panel__label">Ad (Kimlikte yazıldığı gibi)</label>
                <input
                  type="text"
                  className="bb-pax-panel__input"
                  placeholder="Ad / İkinci ad (kimlikte yazıldığı gibi)"
                  value={form.firstName}
                  onChange={e => updateField(index, 'firstName', e.target.value)}
                  maxLength={50}
                  autoComplete="given-name"
                />
                {err.firstName && <span className="bb-pax-panel__error">{err.firstName}</span>}
              </div>
              <div className={`bb-pax-panel__field ${err.lastName ? 'bb-pax-panel__field--error' : ''}`}>
                <label className="bb-pax-panel__label">Soyadı (Kimlikte yazıldığı gibi)</label>
                <input
                  type="text"
                  className="bb-pax-panel__input"
                  placeholder="Soyadı (kimlikte yazıldığı gibi)"
                  value={form.lastName}
                  onChange={e => updateField(index, 'lastName', e.target.value)}
                  maxLength={50}
                  autoComplete="family-name"
                />
                {err.lastName && <span className="bb-pax-panel__error">{err.lastName}</span>}
              </div>
            </div>

            {/* Birth date + Citizenship */}
            <div className="bb-pax-panel__row">
              <div className={`bb-pax-panel__field ${err.birthDate ? 'bb-pax-panel__field--error' : ''}`}>
                <label className="bb-pax-panel__label">Doğum Tarihi</label>
                <input
                  type="date"
                  className="bb-pax-panel__input"
                  value={form.birthDate}
                  onChange={e => updateField(index, 'birthDate', e.target.value)}
                  min={dateLimits.min}
                  max={dateLimits.max}
                  autoComplete="bday"
                />
                {err.birthDate && <span className="bb-pax-panel__error">{err.birthDate}</span>}
              </div>
              <div className="bb-pax-panel__field bb-pax-panel__field--checkbox">
                <label className="bb-pax-panel__checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.isTurkishCitizen}
                    onChange={e => {
                      updateField(index, 'isTurkishCitizen', e.target.checked);
                      if (e.target.checked) {
                        updateField(index, 'nationality', 'TR');
                      }
                    }}
                  />
                  Türk vatandaşı
                </label>
              </div>
            </div>

            {/* TC Kimlik or Passport */}
            {form.isTurkishCitizen ? (
              paxType !== 'INF' && (
                <div className="bb-pax-panel__row">
                  <div className={`bb-pax-panel__field ${err.citizenNo ? 'bb-pax-panel__field--error' : ''}`}>
                    <label className="bb-pax-panel__label">TC Kimlik No</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="bb-pax-panel__input"
                      placeholder="11 haneli TC kimlik numarası"
                      value={form.citizenNo}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                        updateField(index, 'citizenNo', val);
                      }}
                      maxLength={11}
                      autoComplete="off"
                    />
                    {err.citizenNo && <span className="bb-pax-panel__error">{err.citizenNo}</span>}
                  </div>
                </div>
              )
            ) : (
              <div className="bb-pax-panel__row">
                <div className={`bb-pax-panel__field ${err.passportNo ? 'bb-pax-panel__field--error' : ''}`}>
                  <label className="bb-pax-panel__label">Pasaport No</label>
                  <input
                    type="text"
                    className="bb-pax-panel__input"
                    placeholder="Pasaport numarası"
                    value={form.passportNo}
                    onChange={e => updateField(index, 'passportNo', e.target.value)}
                    maxLength={20}
                    autoComplete="off"
                  />
                  {err.passportNo && <span className="bb-pax-panel__error">{err.passportNo}</span>}
                </div>
                <div className={`bb-pax-panel__field ${err.passportCountry ? 'bb-pax-panel__field--error' : ''}`}>
                  <label className="bb-pax-panel__label">Pasaport Ülkesi</label>
                  <input
                    type="text"
                    className="bb-pax-panel__input"
                    placeholder="Ülke kodu (ör: DE, US)"
                    value={form.passportCountry}
                    onChange={e => {
                      const val = e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
                      updateField(index, 'passportCountry', val);
                      updateField(index, 'nationality', val);
                    }}
                    maxLength={2}
                    autoComplete="off"
                  />
                  {err.passportCountry && <span className="bb-pax-panel__error">{err.passportCountry}</span>}
                </div>
              </div>
            )}

            {/* Miles&Smiles hint (visual only) */}
            <div className="bb-pax-panel__miles-hint">
              <span className="bb-pax-panel__miles-icon">✈</span>
              <span>ATA&amp;Bilet numaranızı girerek Mil kazanın.</span>
              <span className="bb-pax-panel__chevron">▾</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <form
      className="bb-passenger-form"
      onSubmit={e => { e.preventDefault(); handleSubmit(); }}
      noValidate
    >
      {/* Stepper bar */}
      <div className="bb-stepper">
        <div className="bb-stepper__step bb-stepper__step--done">
          <span className="bb-stepper__icon">✓</span>
          <span className="bb-stepper__text">Uçuş seçimi</span>
        </div>
        <div className="bb-stepper__connector bb-stepper__connector--done" />
        <div className="bb-stepper__step bb-stepper__step--active">
          <span className="bb-stepper__icon">2</span>
          <span className="bb-stepper__text">Yolcu bilgileri</span>
        </div>
        <div className="bb-stepper__connector" />
        <div className="bb-stepper__step">
          <span className="bb-stepper__icon">3</span>
          <span className="bb-stepper__text">Ek hizmetler</span>
        </div>
        <div className="bb-stepper__connector" />
        <div className="bb-stepper__step">
          <span className="bb-stepper__icon">4</span>
          <span className="bb-stepper__text">Ödeme</span>
        </div>
      </div>

      {/* Section title */}
      <div className="bb-passenger-form__header">
        <h2 className="bb-passenger-form__title">Yolcu Bilgileri</h2>
        <p className="bb-passenger-form__subtitle">
          Lütfen adınızı ve soyadınızı pasaport veya nüfus cüzdanınızda göründüğü gibi eksiksiz yazınız.
          <span className="bb-passenger-form__subtitle-link"> Ad ve soyad giriş kuralları</span>
        </p>
      </div>

      {/* Passenger panels */}
      {sortedPassengers.map((pax, i) => renderPassengerPanel(pax, i))}

      {/* Contact info */}
      <div className="bb-pax-panel bb-pax-panel--open">
        <div className="bb-pax-panel__header bb-pax-panel__header--contact">
          <div className="bb-pax-panel__header-left">
            <span className="bb-pax-panel__number">{sortedPassengers.length + 1}</span>
            <span className="bb-pax-panel__title">İletişim Bilgileri</span>
          </div>
        </div>
        <div className="bb-pax-panel__body">
          <div className="bb-pax-panel__row">
            <div className={`bb-pax-panel__field ${contactErrors.email ? 'bb-pax-panel__field--error' : ''}`}>
              <label className="bb-pax-panel__label">E-posta Adresi</label>
              <input
                type="email"
                className="bb-pax-panel__input"
                placeholder="E-posta adresi"
                value={contact.email}
                onChange={e => {
                  setContact(prev => ({ ...prev, email: e.target.value }));
                  setContactErrors(prev => ({ ...prev, email: undefined }));
                }}
                autoComplete="email"
              />
              {contactErrors.email && <span className="bb-pax-panel__error">{contactErrors.email}</span>}
            </div>
          </div>
          <div className="bb-pax-panel__row">
            <div className={`bb-pax-panel__field ${contactErrors.phone ? 'bb-pax-panel__field--error' : ''}`}>
              <label className="bb-pax-panel__label">Telefon Numarası</label>
              <div className="bb-pax-panel__phone-group">
                <select
                  className="bb-pax-panel__input bb-pax-panel__input--phone-code"
                  defaultValue="+90"
                >
                  <option value="+90">+90</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+49">+49</option>
                </select>
                <input
                  type="tel"
                  className="bb-pax-panel__input bb-pax-panel__input--phone"
                  placeholder="5XX XXX XX XX"
                  value={contact.phone}
                  onChange={e => {
                    const val = e.target.value.replace(/[^\d\s()-+]/g, '');
                    setContact(prev => ({ ...prev, phone: val }));
                    setContactErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  maxLength={20}
                  autoComplete="tel"
                />
              </div>
              {contactErrors.phone && <span className="bb-pax-panel__error">{contactErrors.phone}</span>}
            </div>
          </div>

          {/* KVKK / Bilgilendirme */}
          <div className="bb-pax-panel__kvkk">
            <p className="bb-pax-panel__kvkk-title">Bildirimlerden haberdar olun</p>
            <p className="bb-pax-panel__kvkk-text">
              Kişisel verilerinizin işlenmesine ilişkin detaylı bilgi almak için
              <span className="bb-pax-panel__kvkk-link"> Aydınlatma Metni</span>&#39;ni okuyabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Submit button is rendered by parent (checkout page) */}
    </form>
  );
}
