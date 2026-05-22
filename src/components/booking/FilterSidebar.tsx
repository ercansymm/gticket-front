import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Range, getTrackBackground } from 'react-range';
import type {
  FlightFilters,
  FilterFacets,
  StopBucket,
  BaggageBucket,
  DirectionFacet,
} from '@/types';
import { INITIAL_FILTERS, TIME_BUCKETS } from '@/utils/flightFilters';

interface FilterSidebarProps {
  facets: FilterFacets | null;
  filters: FlightFilters;
  onChange: (filters: FlightFilters) => void;
  resultCount: number;
  totalCount: number;
  isRoundTrip?: boolean;
  footerSlot?: ReactNode;
}

// ────────────────────────────────────────────────────────
// İkonlar (inline SVG — tek kaynak)
// ────────────────────────────────────────────────────────
const Icon = {
  flag: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
  bag: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 7h12l-1 13H7L6 7z" /><path d="M9 7V4a3 3 0 0 1 6 0v3" />
    </svg>
  ),
  ticket: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /><line x1="13" y1="5" x2="13" y2="19" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  plane: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </svg>
  ),
  airport: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V10l7-4 7 4v11M9 21v-6h6v6" />
    </svg>
  ),
  chevron: (open: boolean) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

// ────────────────────────────────────────────────────────
// Section — accordion wrapper
// ────────────────────────────────────────────────────────
interface SectionProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}
const Section = ({ icon, title, children, defaultOpen = false }: SectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bb-fs__section${open ? ' is-open' : ''}`}>
      <button type="button" className="bb-fs__section-head" onClick={() => setOpen(o => !o)}>
        <span className="bb-fs__section-ic">{icon}</span>
        <span className="bb-fs__section-title">{title}</span>
        <span className="bb-fs__section-chev">{Icon.chevron(open)}</span>
      </button>
      {open && <div className="bb-fs__section-body">{children}</div>}
    </div>
  );
};

// ────────────────────────────────────────────────────────
// DualRange — react-range tabanlı çift thumb slider
// ────────────────────────────────────────────────────────
interface DualRangeProps {
  min: number;
  max: number;
  step?: number;
  values: [number, number];
  onChange: (v: [number, number]) => void;
}
const DualRange = ({ min, max, step = 1, values, onChange }: DualRangeProps) => {
  const safeMin = min;
  const safeMax = max > min ? max : min + 1;
  const v0 = Math.max(safeMin, Math.min(values[0], safeMax));
  const v1 = Math.max(v0, Math.min(values[1], safeMax));
  return (
    <Range
      step={step}
      min={safeMin}
      max={safeMax}
      values={[v0, v1]}
      onChange={(vals) => onChange([vals[0], vals[1]] as [number, number])}
      renderTrack={({ props, children }) => (
        <div
          onMouseDown={props.onMouseDown}
          onTouchStart={props.onTouchStart}
          style={{ ...props.style, height: 28, display: 'flex', width: '100%' }}
        >
          <div
            ref={props.ref}
            className="bb-fs__range-track"
            style={{
              background: getTrackBackground({
                values: [v0, v1],
                colors: ['#d1fae5', '#047857', '#d1fae5'],
                min: safeMin,
                max: safeMax,
              }),
            }}
          >
            {children}
          </div>
        </div>
      )}
      renderThumb={({ props, isDragged }) => {
        const { key, ...rest } = props as typeof props & { key?: React.Key };
        return (
          <div
            key={key}
            {...rest}
            className={`bb-fs__range-thumb${isDragged ? ' is-dragged' : ''}`}
            style={rest.style}
          />
        );
      }}
    />
  );
};

// SingleRange — tek thumb (süre / maks fiyat tek başına)
interface SingleRangeProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
}
const SingleRange = ({ min, max, step = 1, value, onChange }: SingleRangeProps) => {
  const safeMin = min;
  const safeMax = max > min ? max : min + 1;
  const v = Math.max(safeMin, Math.min(value, safeMax));
  return (
    <Range
      step={step}
      min={safeMin}
      max={safeMax}
      values={[v]}
      onChange={(vals) => onChange(vals[0])}
      renderTrack={({ props, children }) => (
        <div
          onMouseDown={props.onMouseDown}
          onTouchStart={props.onTouchStart}
          style={{ ...props.style, height: 28, display: 'flex', width: '100%' }}
        >
          <div
            ref={props.ref}
            className="bb-fs__range-track"
            style={{
              background: getTrackBackground({
                values: [v],
                colors: ['#047857', '#d1fae5'],
                min: safeMin,
                max: safeMax,
              }),
            }}
          >
            {children}
          </div>
        </div>
      )}
      renderThumb={({ props, isDragged }) => {
        const { key, ...rest } = props as typeof props & { key?: React.Key };
        return (
          <div
            key={key}
            {...rest}
            className={`bb-fs__range-thumb${isDragged ? ' is-dragged' : ''}`}
            style={rest.style}
          />
        );
      }}
    />
  );
};

// ────────────────────────────────────────────────────────
// Helper'lar
// ────────────────────────────────────────────────────────
const fmtMoney = (n: number) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

const fmtDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}s ${m}dk`;
  if (h) return `${h}s`;
  return `${m}dk`;
};

// "HH:MM" formatına dakika ↔ string dönüşüm
const minutesToHHMM = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};
const hhmmToMinutes = (s: string): number => {
  const [h, m] = s.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// ────────────────────────────────────────────────────────
// FilterSidebar
// ────────────────────────────────────────────────────────
const FilterSidebar = ({
  facets,
  filters,
  onChange,
  resultCount,
  totalCount,
  isRoundTrip = false,
  footerSlot,
}: FilterSidebarProps) => {
  // Fiyat (lokal state — slider sürüklemesinde gereksiz re-filter önlemek için)
  const priceMin = facets?.priceMin ?? 0;
  const priceMax = facets?.priceMax ?? 0;
  const [priceLocal, setPriceLocal] = useState<[number, number]>([priceMin, priceMax]);

  useEffect(() => {
    setPriceLocal([
      filters.minPrice ?? priceMin,
      filters.maxPrice ?? priceMax,
    ]);
  }, [filters.minPrice, filters.maxPrice, priceMin, priceMax]);

  // ── handlerlar ──
  const toggleStop = useCallback((b: StopBucket) => {
    const arr = filters.stopBuckets;
    const next = arr.includes(b) ? arr.filter(x => x !== b) : [...arr, b];
    onChange({ ...filters, stopBuckets: next });
  }, [filters, onChange]);

  const toggleBaggage = useCallback((b: BaggageBucket) => {
    const arr = filters.baggageBuckets;
    const next = arr.includes(b) ? arr.filter(x => x !== b) : [...arr, b];
    onChange({ ...filters, baggageBuckets: next });
  }, [filters, onChange]);

  const toggleAirline = useCallback((code: string) => {
    const arr = filters.airlineCodes;
    const next = arr.includes(code) ? arr.filter(x => x !== code) : [...arr, code];
    onChange({ ...filters, airlineCodes: next });
  }, [filters, onChange]);

  const toggleAirport = useCallback((code: string) => {
    const arr = filters.airportCodes;
    const next = arr.includes(code) ? arr.filter(x => x !== code) : [...arr, code];
    onChange({ ...filters, airportCodes: next });
  }, [filters, onChange]);

  const handlePriceFinal = useCallback((v: [number, number]) => {
    onChange({
      ...filters,
      minPrice: v[0] > priceMin ? v[0] : null,
      maxPrice: v[1] < priceMax ? v[1] : null,
    });
  }, [filters, onChange, priceMin, priceMax]);

  const handleReset = useCallback(() => {
    onChange(INITIAL_FILTERS);
    setPriceLocal([priceMin, priceMax]);
  }, [onChange, priceMin, priceMax]);

  // Toplu seç/temizle (havayolu)
  const selectAllAirlines = useCallback(() => onChange({ ...filters, airlineCodes: [] }), [filters, onChange]);
  const clearAllAirlines = useCallback(() => {
    if (!facets) return;
    onChange({ ...filters, airlineCodes: facets.airlines.map(a => a.code) });
  }, [filters, facets, onChange]);

  const selectAllAirports = useCallback(() => onChange({ ...filters, airportCodes: [] }), [filters, onChange]);
  const clearAllAirports = useCallback(() => {
    if (!facets) return;
    onChange({ ...filters, airportCodes: facets.airports.map(a => a.code) });
  }, [filters, facets, onChange]);

  const totalLabel = useMemo(
    () => resultCount === totalCount ? `${totalCount} uçuş bulundu` : `${resultCount} / ${totalCount} uçuş`,
    [resultCount, totalCount],
  );

  if (!facets) return null;

  return (
    <aside className="bb-fs">
      <div className="bb-fs__header">
        <h3 className="bb-fs__title">Filtrele</h3>
        <button type="button" className="bb-fs__reset" onClick={handleReset}>Temizle</button>
      </div>
      <div className="bb-fs__count">{totalLabel}</div>

      {/* ── Aktarma ── */}
      <Section icon={Icon.flag} title="Aktarma">
        <StopRow label="Direkt uçuşlar" count={facets.stops.direct} checked={filters.stopBuckets.includes('direct')} onToggle={() => toggleStop('direct')} />
        <StopRow label="1 aktarma" count={facets.stops.one} checked={filters.stopBuckets.includes('one')} onToggle={() => toggleStop('one')} />
        <StopRow label="2+ aktarma" count={facets.stops.twoPlus} checked={filters.stopBuckets.includes('twoPlus')} onToggle={() => toggleStop('twoPlus')} />
      </Section>

      {/* ── Bagaj ── */}
      {(facets.baggage.personal + facets.baggage.cabin + facets.baggage.checked23 + facets.baggage.checked30) > 0 && (
        <Section icon={Icon.bag} title="Bagaj">
          {facets.baggage.personal > 0 && (
            <StopRow label="El çantası" count={facets.baggage.personal} checked={filters.baggageBuckets.includes('personal')} onToggle={() => toggleBaggage('personal')} />
          )}
          {facets.baggage.cabin > 0 && (
            <StopRow label="Kabin bagajı" count={facets.baggage.cabin} checked={filters.baggageBuckets.includes('cabin')} onToggle={() => toggleBaggage('cabin')} />
          )}
          {facets.baggage.checked23 > 0 && (
            <StopRow label="23 kg ve üstü check-in bagajı" count={facets.baggage.checked23} checked={filters.baggageBuckets.includes('checked23')} onToggle={() => toggleBaggage('checked23')} />
          )}
          {facets.baggage.checked30 > 0 && (
            <StopRow label="30 kg ve üstü check-in bagajı" count={facets.baggage.checked30} checked={filters.baggageBuckets.includes('checked30')} onToggle={() => toggleBaggage('checked30')} />
          )}
        </Section>
      )}

      {/* ── Bilet fiyatı ── */}
      {priceMax > priceMin && (
        <Section icon={Icon.ticket} title="Bilet fiyatı">
          <div className="bb-fs__row-info">
            <span>Fiyat aralığı</span>
            <strong>{fmtMoney(priceLocal[0])} – {fmtMoney(priceLocal[1])} TL</strong>
          </div>
          <DualRange
            min={priceMin}
            max={priceMax}
            step={1}
            values={priceLocal}
            onChange={(v) => { setPriceLocal(v); handlePriceFinal(v); }}
          />
        </Section>
      )}

      {/* ── Gidiş saatleri + süre ── */}
      {facets.outbound && (
        <DirectionTimingSection
          facet={facets.outbound}
          label={isRoundTrip ? 'Gidiş kalkış / varış saatleri' : 'Kalkış / varış saatleri'}
          departureFrom={filters.outboundDepartureFrom}
          departureTo={filters.outboundDepartureTo}
          arrivalFrom={filters.outboundArrivalFrom}
          arrivalTo={filters.outboundArrivalTo}
          onTimes={(patch) => onChange({ ...filters, ...patch })}
          fieldFromKey="outboundDepartureFrom"
          fieldToKey="outboundDepartureTo"
          fieldArrFromKey="outboundArrivalFrom"
          fieldArrToKey="outboundArrivalTo"
        />
      )}
      {facets.outbound && facets.outbound.maxDurationMinutes > 0 && (
        <Section icon={Icon.clock} title={isRoundTrip ? 'Gidiş uçuşu süresi' : 'Uçuş süresi'}>
          <DurationSlider
            max={facets.outbound.maxDurationMinutes}
            value={filters.outboundMaxDurationMinutes ?? facets.outbound.maxDurationMinutes}
            onChange={(v) => onChange({ ...filters, outboundMaxDurationMinutes: v >= facets.outbound!.maxDurationMinutes ? null : v })}
          />
        </Section>
      )}

      {/* ── Dönüş saatleri + süre (RT) ── */}
      {isRoundTrip && facets.returnLeg && (
        <DirectionTimingSection
          facet={facets.returnLeg}
          label="Dönüş kalkış / varış saatleri"
          departureFrom={filters.returnDepartureFrom}
          departureTo={filters.returnDepartureTo}
          arrivalFrom={filters.returnArrivalFrom}
          arrivalTo={filters.returnArrivalTo}
          onTimes={(patch) => onChange({ ...filters, ...patch })}
          fieldFromKey="returnDepartureFrom"
          fieldToKey="returnDepartureTo"
          fieldArrFromKey="returnArrivalFrom"
          fieldArrToKey="returnArrivalTo"
        />
      )}
      {isRoundTrip && facets.returnLeg && facets.returnLeg.maxDurationMinutes > 0 && (
        <Section icon={Icon.clock} title="Dönüş uçuşu süresi">
          <DurationSlider
            max={facets.returnLeg.maxDurationMinutes}
            value={filters.returnMaxDurationMinutes ?? facets.returnLeg.maxDurationMinutes}
            onChange={(v) => onChange({ ...filters, returnMaxDurationMinutes: v >= facets.returnLeg!.maxDurationMinutes ? null : v })}
          />
        </Section>
      )}

      {/* ── Havayolları ── */}
      {facets.airlines.length > 0 && (
        <Section icon={Icon.plane} title="Havayolları">
          <div className="bb-fs__bulk">
            <button type="button" className="bb-fs__link" onClick={selectAllAirlines}>Tümünü seç</button>
            <button type="button" className="bb-fs__link bb-fs__link--muted" onClick={clearAllAirlines}>Hiçbirini seçme</button>
          </div>
          {facets.airlines.map(a => (
            <StopRow
              key={a.code}
              label={a.name}
              count={a.count}
              checked={filters.airlineCodes.length === 0 ? true : filters.airlineCodes.includes(a.code)}
              onToggle={() => toggleAirline(a.code)}
            />
          ))}
        </Section>
      )}

      {/* ── Havalimanları ── */}
      {facets.airports.length > 1 && (
        <Section icon={Icon.airport} title="Havalimanları">
          <div className="bb-fs__bulk">
            <button type="button" className="bb-fs__link" onClick={selectAllAirports}>Tümünü seç</button>
            <button type="button" className="bb-fs__link bb-fs__link--muted" onClick={clearAllAirports}>Hiçbirini seçme</button>
          </div>
          {facets.airports.map(a => (
            <StopRow
              key={a.code}
              label={a.name}
              count={a.count}
              checked={filters.airportCodes.length === 0 ? true : filters.airportCodes.includes(a.code)}
              onToggle={() => toggleAirport(a.code)}
            />
          ))}
        </Section>
      )}

      {footerSlot && <div className="bb-fs__footer">{footerSlot}</div>}
    </aside>
  );
};

export default FilterSidebar;

// ────────────────────────────────────────────────────────
// Alt bileşenler
// ────────────────────────────────────────────────────────

interface StopRowProps {
  label: string;
  count?: number;
  checked: boolean;
  onToggle: () => void;
}
const StopRow = ({ label, count, checked, onToggle }: StopRowProps) => (
  <label className="bb-fs__row">
    <input type="checkbox" checked={checked} onChange={onToggle} />
    <span className="bb-fs__row-label">{label}</span>
    {typeof count === 'number' && <span className="bb-fs__row-count">({count})</span>}
  </label>
);

interface DurationSliderProps {
  max: number;
  value: number;
  onChange: (v: number) => void;
}
const DurationSlider = ({ max, value, onChange }: DurationSliderProps) => {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <>
      <div className="bb-fs__row-info">
        <span>Maksimum süre</span>
        <strong>{fmtDuration(local)}</strong>
      </div>
      <SingleRange
        min={30}
        max={max}
        step={5}
        value={local}
        onChange={(v) => { setLocal(v); onChange(v); }}
      />
    </>
  );
};

interface DirectionTimingSectionProps {
  facet: DirectionFacet;
  label: string;
  departureFrom: string | null;
  departureTo: string | null;
  arrivalFrom: string | null;
  arrivalTo: string | null;
  onTimes: (patch: Partial<FlightFilters>) => void;
  fieldFromKey: keyof FlightFilters;
  fieldToKey: keyof FlightFilters;
  fieldArrFromKey: keyof FlightFilters;
  fieldArrToKey: keyof FlightFilters;
}

const DirectionTimingSection = ({
  facet, label,
  departureFrom, departureTo, arrivalFrom, arrivalTo,
  onTimes, fieldFromKey, fieldToKey, fieldArrFromKey, fieldArrToKey,
}: DirectionTimingSectionProps) => {
  // Dakika cinsinden lokal state (slider dragging için)
  const depFromMin = 0;
  const depToMax = 24 * 60 - 1;
  const [depRange, setDepRange] = useState<[number, number]>([
    departureFrom ? hhmmToMinutes(departureFrom) : depFromMin,
    departureTo ? hhmmToMinutes(departureTo) : depToMax,
  ]);
  const [arrRange, setArrRange] = useState<[number, number]>([
    arrivalFrom ? hhmmToMinutes(arrivalFrom) : depFromMin,
    arrivalTo ? hhmmToMinutes(arrivalTo) : depToMax,
  ]);

  useEffect(() => {
    setDepRange([
      departureFrom ? hhmmToMinutes(departureFrom) : depFromMin,
      departureTo ? hhmmToMinutes(departureTo) : depToMax,
    ]);
  }, [departureFrom, departureTo]);
  useEffect(() => {
    setArrRange([
      arrivalFrom ? hhmmToMinutes(arrivalFrom) : depFromMin,
      arrivalTo ? hhmmToMinutes(arrivalTo) : depToMax,
    ]);
  }, [arrivalFrom, arrivalTo]);

  const commitDep = useCallback((v: [number, number]) => {
    const fromHHMM = minutesToHHMM(v[0]);
    const toHHMM = minutesToHHMM(v[1]);
    onTimes({
      [fieldFromKey]: v[0] > depFromMin ? fromHHMM : null,
      [fieldToKey]: v[1] < depToMax ? toHHMM : null,
    } as Partial<FlightFilters>);
  }, [onTimes, fieldFromKey, fieldToKey, depToMax]);

  const commitArr = useCallback((v: [number, number]) => {
    const fromHHMM = minutesToHHMM(v[0]);
    const toHHMM = minutesToHHMM(v[1]);
    onTimes({
      [fieldArrFromKey]: v[0] > depFromMin ? fromHHMM : null,
      [fieldArrToKey]: v[1] < depToMax ? toHHMM : null,
    } as Partial<FlightFilters>);
  }, [onTimes, fieldArrFromKey, fieldArrToKey, depToMax]);

  // Bucket chip — bir bucket seçilince mevcut aralığı O bucket'a sıkıştırır
  const applyDepBucket = useCallback((from: string, to: string) => {
    onTimes({
      [fieldFromKey]: from,
      [fieldToKey]: to,
    } as Partial<FlightFilters>);
  }, [onTimes, fieldFromKey, fieldToKey]);

  const applyArrBucket = useCallback((from: string, to: string) => {
    onTimes({
      [fieldArrFromKey]: from,
      [fieldArrToKey]: to,
    } as Partial<FlightFilters>);
  }, [onTimes, fieldArrFromKey, fieldArrToKey]);

  return (
    <Section icon={Icon.clock} title={label}>
      <div className="bb-fs__row-info">
        <span className="bb-fs__direction-row">
          Kalkış{facet.originName ? `, ${facet.originName}` : ''}{facet.originCode ? ` | ${facet.originCode}` : ''}
        </span>
        <strong>{minutesToHHMM(depRange[0])} – {minutesToHHMM(depRange[1])}</strong>
      </div>
      <DualRange
        min={depFromMin}
        max={depToMax}
        step={5}
        values={depRange}
        onChange={(v) => { setDepRange(v); commitDep(v); }}
      />
      <div className="bb-fs__chips">
        {TIME_BUCKETS.map(b => {
          const active = departureFrom === b.from && departureTo === b.to;
          return (
            <button
              type="button"
              key={b.key}
              className={`bb-fs__chip${active ? ' is-active' : ''}`}
              onClick={() => applyDepBucket(b.from, b.to)}
            >{b.label}</button>
          );
        })}
      </div>

      <div className="bb-fs__row-info bb-fs__row-info--mt">
        <span className="bb-fs__direction-row">
          Varış{facet.destinationName ? `, ${facet.destinationName}` : ''}{facet.destinationCode ? ` | ${facet.destinationCode}` : ''}
        </span>
        <strong>{minutesToHHMM(arrRange[0])} – {minutesToHHMM(arrRange[1])}</strong>
      </div>
      <DualRange
        min={depFromMin}
        max={depToMax}
        step={5}
        values={arrRange}
        onChange={(v) => { setArrRange(v); commitArr(v); }}
      />
      <div className="bb-fs__chips">
        {TIME_BUCKETS.map(b => {
          const active = arrivalFrom === b.from && arrivalTo === b.to;
          return (
            <button
              type="button"
              key={b.key}
              className={`bb-fs__chip${active ? ' is-active' : ''}`}
              onClick={() => applyArrBucket(b.from, b.to)}
            >{b.label}</button>
          );
        })}
      </div>
    </Section>
  );
};

