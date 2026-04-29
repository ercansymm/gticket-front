"use client";

import { useState, useCallback, useMemo } from 'react';
import type { PassengerItem, ContactInfo } from '@/types/booking';
import type { AllocatePassenger } from '@/types/flight';

/* ───────── helpers ───────── */
const PAX_LABELS: Record<string, string> = { ADT: 'Yetişkin', CHD: 'Çocuk', INF: 'Bebek' };

function normalizePaxType(type: string | null): 'ADT' | 'CHD' | 'INF' {
  const t = (type ?? 'ADT').toUpperCase();
  if (t === 'CHD' || t === 'CHILD') return 'CHD';
  if (t === 'INF' || t === 'INFANT') return 'INF';
  return 'ADT';
}

function getDateLimits(paxType: 'ADT' | 'CHD' | 'INF') {
  const today = new Date();
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  if (paxType === 'INF') { const mn = new Date(today); mn.setFullYear(mn.getFullYear()-2); return { min: fmt(mn), max: fmt(today) }; }
  if (paxType === 'CHD') { const mn = new Date(today); mn.setFullYear(mn.getFullYear()-12); const mx = new Date(today); mx.setFullYear(mx.getFullYear()-2); return { min: fmt(mn), max: fmt(mx) }; }
  const mx = new Date(today); mx.setFullYear(mx.getFullYear()-12);
  const mn = new Date(today); mn.setFullYear(mn.getFullYear()-120);
  return { min: fmt(mn), max: fmt(mx) };
}

function turkishToUpper(s: string) {
  return s.replace(/i/g,'İ').replace(/ı/g,'I').replace(/ğ/g,'Ğ').replace(/ü/g,'Ü').replace(/ş/g,'Ş').replace(/ö/g,'Ö').replace(/ç/g,'Ç').toUpperCase();
}
function isValidTCKimlik(tc: string) { return /^\d{11}$/.test(tc); }
function turkishToLatin(s: string) {
  return s.replace(/ç/g,'c').replace(/Ç/g,'C').replace(/ğ/g,'g').replace(/Ğ/g,'G')
    .replace(/ı/g,'i').replace(/İ/g,'I').replace(/ö/g,'o').replace(/Ö/g,'O')
    .replace(/ş/g,'s').replace(/Ş/g,'S').replace(/ü/g,'u').replace(/Ü/g,'U');
}
function formatDateMasked(input: string) {
  const d = input.replace(/\D/g,'').slice(0,8);
  if (d.length<=2) return d;
  if (d.length<=4) return `${d.slice(0,2)}/${d.slice(2)}`;
  return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4,8)}`;
}
function maskedDateToISO(m: string) {
  const p = m.split('/');
  return (p.length===3 && p[0].length===2 && p[1].length===2 && p[2].length===4) ? `${p[2]}-${p[1]}-${p[0]}` : '';
}

/* Phone format per country dial code */
interface PhoneFormat { groups: number[]; max: number; placeholder: string; isValid: (d: string) => boolean; }
const PHONE_FORMATS: Record<string, PhoneFormat> = {
  '+90': { groups: [3,3,2,2],   max: 10, placeholder: '5XX XXX XX XX',   isValid: d => d.length === 10 && d.startsWith('5') },
  '+1':  { groups: [3,3,4],     max: 10, placeholder: 'XXX XXX XXXX',    isValid: d => d.length === 10 },
  '+44': { groups: [4,3,4],     max: 11, placeholder: 'XXXX XXX XXXX',   isValid: d => d.length >= 10 && d.length <= 11 },
  '+49': { groups: [3,4,4],     max: 11, placeholder: 'XXX XXXX XXXX',   isValid: d => d.length >= 10 && d.length <= 11 },
  '+33': { groups: [1,2,2,2,2], max: 9,  placeholder: 'X XX XX XX XX',   isValid: d => d.length === 9 },
};
function getPhoneFormat(code: string): PhoneFormat {
  return PHONE_FORMATS[code] ?? { groups: [15], max: 15, placeholder: 'Telefon numarası', isValid: d => d.length >= 7 };
}
function formatPhone(digits: string, code: string): string {
  const fmt = getPhoneFormat(code);
  const limited = digits.slice(0, fmt.max);
  const parts: string[] = [];
  let pos = 0;
  for (const g of fmt.groups) {
    if (pos >= limited.length) break;
    parts.push(limited.slice(pos, pos + g));
    pos += g;
  }
  return parts.join(' ');
}

/* ───────── types ───────── */
interface PassengerFormData {
  firstName: string; lastName: string; gender: 'M'|'F'|'';
  birthDate: string;          // ISO yyyy-mm-dd
  birthDateMasked: string;    // GG/AA/YYYY
  citizenNo: string; isTurkishCitizen: boolean;
  passportNo: string; passportCountry: string; passportExpiry: string; nationality: string;
}
interface FormErrors { [k: string]: string; }

export interface PassengerFormProps {
  passengers: AllocatePassenger[];
  onSubmit: (passengers: PassengerItem[], contact: ContactInfo) => void;
  loading?: boolean; disabled?: boolean; isInternational?: boolean;
}

/* ───────── Field wrapper with status icons ───────── */
function Field({
  label, error, required, valid, children,
}: {
  label: string; error?: string; required?: boolean; valid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`pf-field ${error ? 'pf-field--error' : ''} ${valid ? 'pf-field--valid' : ''}`}>
      <label className="pf-field__label">
        {label}{required && <span className="pf-field__req"> *</span>}
      </label>
      <div className="pf-field__control">
        {children}
        {valid && !error && (
          <span className="pf-field__status pf-field__status--ok" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
        {error && (
          <span className="pf-field__status pf-field__status--err" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </span>
        )}
      </div>
      {error && <span className="pf-field__error">{error}</span>}
    </div>
  );
}

/* ───────── main ───────── */
export default function PassengerForm({ passengers, onSubmit, isInternational = false }: PassengerFormProps) {
  const sorted = useMemo(() =>
    [...passengers].sort((a,b) => {
      const o = {ADT:0,CHD:1,INF:2};
      const at = normalizePaxType(a.type); const bt = normalizePaxType(b.type);
      return (o[at]-o[bt])||(a.sequenceNo-b.sequenceNo);
    }), [passengers]);

  const [forms, setForms] = useState<PassengerFormData[]>(() =>
    sorted.map(() => ({
      firstName:'', lastName:'', gender:'',
      birthDate:'', birthDateMasked:'',
      citizenNo:'', isTurkishCitizen:true,
      passportNo:'', passportCountry:'', passportExpiry:'', nationality:'TR',
    })));

  const [contact, setContact] = useState({ email:'', phone:'', phoneCode:'+90' });
  const [errors, setErrors] = useState<FormErrors[]>(() => sorted.map(() => ({})));
  const [contactErrors, setContactErrors] = useState<{email?:string;phone?:string}>({});
  const [showSummary, setShowSummary] = useState(false);

  /* Duplicate passenger name detection (firstName + lastName, case-insensitive) */
  const duplicateIndices = useMemo(() => {
    const seen = new Map<string, number[]>();
    forms.forEach((f, i) => {
      const fn = f.firstName.trim().toLocaleLowerCase('tr-TR');
      const ln = f.lastName.trim().toLocaleLowerCase('tr-TR');
      if (fn.length >= 2 && ln.length >= 2) {
        const k = fn + '|' + ln;
        if (!seen.has(k)) seen.set(k, []);
        seen.get(k)!.push(i);
      }
    });
    const dup = new Set<number>();
    seen.forEach(arr => { if (arr.length > 1) arr.forEach(i => dup.add(i)); });
    return dup;
  }, [forms]);

  const update = useCallback((i: number, f: keyof PassengerFormData, v: string|boolean) => {
    setForms(p => { const n=[...p]; n[i]={...n[i],[f]:v}; return n; });
    setErrors(p => { const n=[...p]; n[i]={...n[i],[f]:''}; return n; });
  }, []);

  const updateBirthDate = useCallback((i: number, raw: string) => {
    const masked = formatDateMasked(raw);
    const iso = maskedDateToISO(masked);
    setForms(p => {
      const n = [...p];
      n[i] = { ...n[i], birthDateMasked: masked, birthDate: iso };
      return n;
    });
    setErrors(p => { const n=[...p]; n[i]={...n[i], birthDate:''}; return n; });
  }, []);

  const validatePax = useCallback((form: PassengerFormData, paxType: 'ADT'|'CHD'|'INF'): FormErrors => {
    const e: FormErrors = {};
    const nr = /^[A-ZÇĞİÖŞÜa-zçğıöşü\s'-]+$/;
    if (!form.gender) e.gender='Cinsiyet seçiniz';
    if (!form.firstName.trim()||form.firstName.trim().length<2) e.firstName='Boş bırakılamaz';
    else if (!nr.test(form.firstName.trim())) e.firstName='Yalnızca harf';
    if (!form.lastName.trim()||form.lastName.trim().length<2) e.lastName='Boş bırakılamaz';
    else if (!nr.test(form.lastName.trim())) e.lastName='Yalnızca harf';
    if (!form.birthDate) {
      e.birthDate = (form.birthDateMasked && form.birthDateMasked.length > 0) ? 'GG/AA/YYYY formatı' : 'Boş bırakılamaz';
    } else {
      const lim = getDateLimits(paxType);
      if (form.birthDate<lim.min||form.birthDate>lim.max)
        e.birthDate = paxType==='ADT'?'12 yaş ve üzeri':paxType==='CHD'?'2–12 yaş arası':'0–2 yaş arası';
    }
    if (isInternational) {
      if (!form.passportNo||form.passportNo.trim().length<5) e.passportNo='Boş bırakılamaz';
      if (!form.passportCountry||form.passportCountry.length!==2) e.passportCountry='Ülke kodu zorunlu';
      if (!form.passportExpiry) e.passportExpiry='Boş bırakılamaz';
      else { const iso=maskedDateToISO(form.passportExpiry); if (!iso) e.passportExpiry='GG/AA/YYYY formatı'; else if (iso<=new Date().toISOString().split('T')[0]) e.passportExpiry='Geçerli bir tarih giriniz'; }
      if (form.isTurkishCitizen&&(!form.citizenNo||!isValidTCKimlik(form.citizenNo))) e.citizenNo='TC kimlik 11 haneli olmalı';
    } else {
      if (form.isTurkishCitizen) {
        if (!form.citizenNo||!isValidTCKimlik(form.citizenNo)) e.citizenNo='TC kimlik 11 haneli olmalı';
      } else {
        if (!form.passportNo||form.passportNo.trim().length<5) e.passportNo='Boş bırakılamaz';
        if (!form.passportCountry||form.passportCountry.length!==2) e.passportCountry='Ülke kodu gerekli';
        if (!form.passportExpiry) e.passportExpiry='Boş bırakılamaz';
        else { const iso=maskedDateToISO(form.passportExpiry); if (!iso) e.passportExpiry='GG/AA/YYYY formatı'; else if (iso<=new Date().toISOString().split('T')[0]) e.passportExpiry='Geçerli bir tarih giriniz'; }
      }
    }
    return e;
  }, [isInternational]);

  const validateContact = useCallback(() => {
    const e: {email?:string;phone?:string} = {};
    if (!contact.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) e.email='Geçerli bir e-posta giriniz';
    const phoneFmt = getPhoneFormat(contact.phoneCode);
    const digits = contact.phone.replace(/\D/g, '');
    if (!digits) e.phone = 'Telefon numarası giriniz';
    else if (!phoneFmt.isValid(digits)) e.phone = 'Geçerli bir telefon giriniz';
    return e;
  }, [contact]);

  const handleSubmit = useCallback(() => {
    console.log('[PassengerForm] handleSubmit called', { paxCount: sorted.length });
    let hasErr = false;
    const newErr = sorted.map((pax,i) => {
      const e = validatePax(forms[i], normalizePaxType(pax.type));
      if (duplicateIndices.has(i)) {
        e.firstName = e.firstName || 'Aynı ad-soyad başka bir yolcuda kullanılıyor';
        e.lastName  = e.lastName  || 'Aynı ad-soyad başka bir yolcuda kullanılıyor';
      }
      if (Object.keys(e).length>0) hasErr=true;
      return e;
    });
    setErrors(newErr);
    const cErr = validateContact();
    setContactErrors(cErr);
    if (Object.keys(cErr).length>0) hasErr=true;
    if (hasErr) {
      console.warn('[PassengerForm] Validation failed', { passengerErrors: newErr, contactErrors: cErr });
      setShowSummary(true);
      setTimeout(() => {
        const banner = document.querySelector('.pf-summary');
        if (banner) banner.scrollIntoView({behavior:'smooth',block:'center'});
        else { const el=document.querySelector('.pf-field--error'); if(el) el.scrollIntoView({behavior:'smooth',block:'center'}); }
      }, 100);
      return;
    }
    setShowSummary(false);
    console.log('[PassengerForm] Validation passed → calling onSubmit');
    const items: PassengerItem[] = sorted.map((pax,i) => {
      const form=forms[i]; const paxType=normalizePaxType(pax.type);
      const isTurkishDom = form.isTurkishCitizen && !isInternational;
      return {
        paxType, sequenceNo:pax.sequenceNo,
        firstName:turkishToUpper(form.firstName.trim()),
        lastName:turkishToUpper(form.lastName.trim()),
        gender:form.gender as 'M'|'F', birthDate:form.birthDate,
        citizenNo:(form.isTurkishCitizen&&form.citizenNo)?form.citizenNo:null,
        passportNo:!isTurkishDom&&form.passportNo?form.passportNo.toUpperCase():null,
        passportCountry:!isTurkishDom&&form.passportCountry?form.passportCountry.toUpperCase():null,
        passportExpiry:!isTurkishDom&&form.passportExpiry?maskedDateToISO(form.passportExpiry):null,
        nationality:form.nationality.toUpperCase()||'TR',
        tempTag:pax.tempTag??null, paxReferenceId:pax.paxReferenceId??null,
      };
    });
    onSubmit(items, {
      email:contact.email.trim().toLowerCase(),
      phone:(contact.phoneCode+contact.phone.replace(/\D/g,'')).trim(),
    });
  }, [sorted, forms, contact, onSubmit, validatePax, validateContact, isInternational, duplicateIndices]);

  // Validity (for green ✓ icon) — must satisfy form-level rules only
  const v = (i: number, key: keyof PassengerFormData) => {
    const f = forms[i]; const err = errors[i] || {};
    if (err[key as string]) return false;
    switch (key) {
      case 'firstName': return f.firstName.trim().length >= 2;
      case 'lastName':  return f.lastName.trim().length >= 2;
      case 'birthDate': return !!f.birthDate;
      case 'citizenNo': return isValidTCKimlik(f.citizenNo);
      case 'passportNo': return f.passportNo.trim().length >= 5;
      case 'passportCountry': return f.passportCountry.length === 2;
      case 'passportExpiry': return !!maskedDateToISO(f.passportExpiry);
      default: return false;
    }
  };

  return (
    <form className="bb-passenger-form" onSubmit={e=>{e.preventDefault();handleSubmit();}} noValidate>

      {showSummary && (() => {
        const issues: string[] = [];
        errors.forEach((eObj, i) => {
          Object.entries(eObj).forEach(([field, msg]) => {
            if (!msg) return;
            const labels: Record<string,string> = {
              firstName:'Ad', lastName:'Soyad', gender:'Cinsiyet', birthDate:'Doğum tarihi',
              citizenNo:'TC Kimlik No', passportNo:'Pasaport No', passportCountry:'Pasaport ülkesi',
              passportExpiry:'Pasaport geçerlilik',
            };
            issues.push(`${i+1}. yolcu — ${labels[field] ?? field}: ${msg}`);
          });
        });
        if (contactErrors.email) issues.push(`İletişim — Email: ${contactErrors.email}`);
        if (contactErrors.phone) issues.push(`İletişim — Telefon: ${contactErrors.phone}`);
        if (issues.length === 0) return null;
        return (
          <div className="pf-summary" role="alert" style={{
            background:'#fef2f2', border:'1px solid #fecaca', color:'#991b1b',
            padding:'12px 16px', borderRadius:8, marginBottom:16, fontSize:14,
          }}>
            <div style={{fontWeight:600, marginBottom:6}}>Lütfen aşağıdaki alanları düzeltin:</div>
            <ul style={{margin:0, paddingLeft:20}}>
              {issues.map((msg, idx) => <li key={idx}>{msg}</li>)}
            </ul>
          </div>
        );
      })()}

      {/* ── İLETİŞİM BİLGİLERİ ── */}
      <div className="chk-section">
        <div className="chk-section__head">
          <div className="chk-section__title">İletişim Bilgileri</div>
          <div className="chk-section__subtitle">Bilet ve uçuş bilgileri bu adrese gönderilecektir.</div>
        </div>
        <div className="chk-section__body">
          <div className="pf-row pf-row--contact">
            <Field label="Email"
              error={contactErrors.email}
              valid={!contactErrors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)}>
              <input type="email" className="pf-input" placeholder="ornek@email.com"
                value={contact.email}
                onChange={e=>{setContact(p=>({...p,email:e.target.value}));setContactErrors(p=>({...p,email:undefined}));}}
                autoComplete="email" />
            </Field>
            <Field label="Cep Telefonu"
              error={contactErrors.phone}
              valid={!contactErrors.phone && getPhoneFormat(contact.phoneCode).isValid(contact.phone.replace(/\D/g,''))}>
              <div className="pf-phone">
                <select className="pf-select pf-phone__code"
                  value={contact.phoneCode}
                  onChange={e=>{
                    const newCode = e.target.value;
                    const newMax = getPhoneFormat(newCode).max;
                    const digits = contact.phone.replace(/\D/g,'').slice(0, newMax);
                    setContact(p=>({...p, phoneCode: newCode, phone: formatPhone(digits, newCode)}));
                    setContactErrors(p=>({...p, phone: undefined}));
                  }}>
                  <option value="+90">TR (+90)</option>
                  <option value="+1">US (+1)</option>
                  <option value="+44">GB (+44)</option>
                  <option value="+49">DE (+49)</option>
                  <option value="+33">FR (+33)</option>
                </select>
                <input type="tel" className="pf-input" placeholder={getPhoneFormat(contact.phoneCode).placeholder}
                  value={contact.phone}
                  onChange={e=>{
                    const digits = e.target.value.replace(/\D/g,'').slice(0, getPhoneFormat(contact.phoneCode).max);
                    setContact(p=>({...p, phone: formatPhone(digits, p.phoneCode)}));
                    setContactErrors(p=>({...p, phone: undefined}));
                  }}
                  autoComplete="tel-national" />
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* ── YOLCU BİLGİLERİ ── */}
      <div className="chk-section">
        <div className="chk-section__head">
          <div className="chk-section__title">Yolcu Bilgileri</div>
          <div className="chk-section__subtitle">Ad ve soyadınızı kimliğinizde göründüğü gibi eksiksiz yazınız.</div>
        </div>
        <div className="chk-section__body">

      {sorted.map((pax, index) => {
        const paxType = normalizePaxType(pax.type);
        const form = forms[index];
        const err = errors[index] || {};
        const paxOfType = sorted.filter(p=>normalizePaxType(p.type)===paxType);
        const paxIdx = paxOfType.findIndex(p=>p.sequenceNo===pax.sequenceNo)+1;
        const showFB = isInternational || !form.isTurkishCitizen;

        return (
          <div key={pax.sequenceNo} className={`pf-card ${duplicateIndices.has(index) ? 'pf-card--error' : ''}`}>
            {sorted.length > 1 && (
              <div className="pf-card__head">
                <span className="pf-card__num">{index+1}</span>
                <span className="pf-card__name">{paxIdx}. Yolcu</span>
                <span className="pf-card__type-badge">{PAX_LABELS[paxType]}</span>
              </div>
            )}

            {duplicateIndices.has(index) && (
              <div className="pf-dup-warn" role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                </svg>
                <span>Bu ad-soyad başka bir yolcuyla aynı. Her yolcu için kimlikteki tam ad-soyad farklı olmalıdır.</span>
              </div>
            )}

            <div className="pf-card__body">
              {/* Tek satır: Ad / Soyad / Doğum Tarihi / TC Kimlik (veya Pasaport No) */}
              <div className="pf-row pf-row--4col">
                <Field label={`Ad (${PAX_LABELS[paxType]})`} error={err.firstName} valid={v(index,'firstName')}>
                  <input type="text" className="pf-input"
                    value={form.firstName}
                    onChange={e=>update(index,'firstName',turkishToLatin(e.target.value).toUpperCase())}
                    maxLength={50} autoComplete="given-name" />
                </Field>
                <Field label="Soyad" error={err.lastName} valid={v(index,'lastName')}>
                  <input type="text" className="pf-input"
                    value={form.lastName}
                    onChange={e=>update(index,'lastName',turkishToLatin(e.target.value).toUpperCase())}
                    maxLength={50} autoComplete="family-name" />
                </Field>
                <Field label="Doğum Tarihi" error={err.birthDate} valid={v(index,'birthDate')}>
                  <input type="text" inputMode="numeric" className="pf-input"
                    placeholder="GG / AA / YYYY"
                    value={form.birthDateMasked}
                    onChange={e=>updateBirthDate(index, e.target.value)}
                    maxLength={10} autoComplete="bday" />
                </Field>
                {!isInternational && form.isTurkishCitizen ? (
                  <Field label="TC Kimlik No" error={err.citizenNo} valid={v(index,'citizenNo')}>
                    <input type="text" inputMode="numeric" className="pf-input"
                      value={form.citizenNo}
                      onChange={e=>update(index,'citizenNo',e.target.value.replace(/\D/g,'').slice(0,11))}
                      maxLength={11} autoComplete="off" />
                  </Field>
                ) : (
                  <Field label="Pasaport No" error={err.passportNo} valid={v(index,'passportNo')}>
                    <input type="text" className="pf-input" placeholder="A12345678"
                      value={form.passportNo}
                      onChange={e=>update(index,'passportNo',e.target.value.toUpperCase())}
                      maxLength={20} autoComplete="off" />
                  </Field>
                )}
              </div>

              {/* Cinsiyet (sol) + TC vatandaşı değilim checkbox (sağ) */}
              <div className="pf-row pf-row--inline">
                <div className={`pf-gender ${err.gender ? 'pf-gender--error' : ''}`} role="radiogroup" aria-label="Cinsiyet">
                  <label className="pf-gender__opt">
                    <input type="radio" name={`gender-${index}`} value="M"
                      checked={form.gender==='M'} onChange={()=>update(index,'gender','M')} />
                    <span>Erkek</span>
                  </label>
                  <label className="pf-gender__opt">
                    <input type="radio" name={`gender-${index}`} value="F"
                      checked={form.gender==='F'} onChange={()=>update(index,'gender','F')} />
                    <span>Kadın</span>
                  </label>
                </div>

                {!isInternational && (
                  <label className="pf-citizen">
                    <input type="checkbox"
                      checked={!form.isTurkishCitizen}
                      onChange={e=>{
                        const isFor = e.target.checked;
                        const isTR = !isFor;
                        setForms(prev=>{
                          const n=[...prev];
                          n[index]={
                            ...n[index],
                            isTurkishCitizen:isTR,
                            nationality:isTR?'TR':n[index].nationality,
                            passportNo:isTR?'':n[index].passportNo,
                            passportCountry:isTR?'':n[index].passportCountry,
                            passportExpiry:isTR?'':n[index].passportExpiry,
                            citizenNo:isFor?'':n[index].citizenNo,
                          };
                          return n;
                        });
                        setErrors(prev=>{
                          const n=[...prev];
                          n[index]={...n[index],citizenNo:'',passportNo:'',passportCountry:'',passportExpiry:''};
                          return n;
                        });
                      }} />
                    <span>TC vatandaşı değilim</span>
                  </label>
                )}
              </div>

              {/* International ya da yabancı uyruklu için ek pasaport satırı */}
              {showFB && (
                <div className="pf-row pf-row--3col">
                  {isInternational && form.isTurkishCitizen && (
                    <Field label="TC Kimlik No" error={err.citizenNo} valid={v(index,'citizenNo')}>
                      <input type="text" inputMode="numeric" className="pf-input"
                        value={form.citizenNo}
                        onChange={e=>update(index,'citizenNo',e.target.value.replace(/\D/g,'').slice(0,11))}
                        maxLength={11} autoComplete="off" />
                    </Field>
                  )}
                  <Field label="Pasaport Ülkesi" error={err.passportCountry} valid={v(index,'passportCountry')}>
                    <input type="text" className="pf-input" placeholder="TR, DE, US"
                      value={form.passportCountry}
                      onChange={e=>{const v2=e.target.value.replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase();update(index,'passportCountry',v2);if(!form.isTurkishCitizen)update(index,'nationality',v2);}}
                      maxLength={2} autoComplete="off" />
                  </Field>
                  <Field label="Pasaport Geçerlilik" error={err.passportExpiry} valid={v(index,'passportExpiry')}>
                    <input type="text" inputMode="numeric" className="pf-input" placeholder="GG/AA/YYYY"
                      value={form.passportExpiry}
                      onChange={e=>update(index,'passportExpiry',formatDateMasked(e.target.value))}
                      maxLength={10} autoComplete="off" />
                  </Field>
                </div>
              )}
            </div>
          </div>
        );
      })}
        </div>
      </div>
    </form>
  );
}
