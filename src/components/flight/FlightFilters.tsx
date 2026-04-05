'use client';

import { useCallback, useState, useEffect } from 'react';
import type { FilterOptions, FlightFilters } from '@/types';
import { INITIAL_FILTERS } from '@/utils/flightFilters';

interface FlightFiltersProps {
  options: FilterOptions | null;
  filters: FlightFilters;
  onChange: (filters: FlightFilters) => void;
  resultCount: number;
  totalCount: number;
}

const CABIN_CLASS_LABELS: Record<string, string> = {
  Economy: 'Ekonomi',
  PremiumEconomy: 'Premium Ekonomi',
  Business: 'Business',
  First: 'First Class',
  Ekonomi: 'Ekonomi',
};

const FlightFiltersPanel = ({ options, filters, onChange, resultCount, totalCount }: FlightFiltersProps) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    options?.minPrice ?? 0,
    options?.maxPrice ?? 10000,
  ]);

  useEffect(() => {
    if (options) {
      setPriceRange([options.minPrice, options.maxPrice]);
    }
  }, [options]);

  const toggle = useCallback((key: 'directOnly' | 'refundableOnly') => {
    onChange({ ...filters, [key]: !filters[key] });
  }, [filters, onChange]);

  const toggleArrayItem = useCallback((key: 'airlineCodes' | 'cabinClasses' | 'farePackages', value: string) => {
    const arr = filters[key];
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    onChange({ ...filters, [key]: next });
  }, [filters, onChange]);

  const handlePriceChange = useCallback((min: number, max: number) => {
    setPriceRange([min, max]);
    onChange({ ...filters, minPrice: min, maxPrice: max });
  }, [filters, onChange]);

  const handleTimeChange = useCallback((from: string, to: string) => {
    onChange({
      ...filters,
      departureTimeFrom: from || null,
      departureTimeTo: to || null,
    });
  }, [filters, onChange]);

  const handleReset = useCallback(() => {
    onChange(INITIAL_FILTERS);
    if (options) {
      setPriceRange([options.minPrice, options.maxPrice]);
    }
  }, [onChange, options]);

  if (!options) return null;

  return (
    <aside className="bb-filter-sidebar">
      <div className="bb-filter-sidebar__header">
        <h3 className="bb-filter-sidebar__title">Filtreler</h3>
        <button className="bb-filter-sidebar__reset" onClick={handleReset}>Temizle</button>
      </div>

      <div className="bb-filter-sidebar__count">
        {resultCount === totalCount
          ? `${totalCount} uçuş bulundu`
          : `${resultCount} / ${totalCount} uçuş`}
      </div>

      {/* Fiyat aralığı */}
      <div className="bb-filter-section">
        <h4 className="bb-filter-section__title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bb-filter-section__icon">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Fiyat Aralığı
        </h4>
        <div className="bb-filter-section__price-inputs">
          <input
            type="number"
            className="bb-filter-section__input"
            value={priceRange[0]}
            min={options.minPrice}
            max={priceRange[1]}
            onChange={e => handlePriceChange(Number(e.target.value), priceRange[1])}
          />
          <span className="bb-filter-section__separator">—</span>
          <input
            type="number"
            className="bb-filter-section__input"
            value={priceRange[1]}
            min={priceRange[0]}
            max={options.maxPrice}
            onChange={e => handlePriceChange(priceRange[0], Number(e.target.value))}
          />
        </div>
        <input
          type="range"
          className="bb-filter-section__range"
          min={options.minPrice}
          max={options.maxPrice}
          value={priceRange[1]}
          onChange={e => handlePriceChange(priceRange[0], Number(e.target.value))}
        />
      </div>

      {/* Aktarma */}
      {options.hasDirectFlights && (
        <div className="bb-filter-section">
          <label className="bb-filter-checkbox">
            <input
              type="checkbox"
              checked={filters.directOnly}
              onChange={() => toggle('directOnly')}
            />
            <span>Sadece Aktarmasız</span>
          </label>
        </div>
      )}

      {/* İade */}
      {options.hasRefundableFlights && (
        <div className="bb-filter-section">
          <label className="bb-filter-checkbox">
            <input
              type="checkbox"
              checked={filters.refundableOnly}
              onChange={() => toggle('refundableOnly')}
            />
            <span>Sadece İade Edilebilir</span>
          </label>
        </div>
      )}

      {/* Havayolları */}
      {options.airlines.length > 0 && (
        <div className="bb-filter-section">
          <h4 className="bb-filter-section__title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bb-filter-section__icon">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
            Havayolu
          </h4>
          {options.airlines.map(airline => (
            <label key={airline.code} className="bb-filter-checkbox">
              <input
                type="checkbox"
                checked={filters.airlineCodes.includes(airline.code ?? '')}
                onChange={() => toggleArrayItem('airlineCodes', airline.code ?? '')}
              />
              <span>{airline.name}</span>
            </label>
          ))}
        </div>
      )}

      {/* Kabin sınıfı */}
      {options.cabinClasses && options.cabinClasses.length > 1 && (
        <div className="bb-filter-section">
          <h4 className="bb-filter-section__title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bb-filter-section__icon">
              <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
              <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
              <path d="M5 18v2" />
              <path d="M19 18v2" />
            </svg>
            Kabin Sınıfı
          </h4>
          {options.cabinClasses.map(cls => (
            <label key={cls} className="bb-filter-checkbox">
              <input
                type="checkbox"
                checked={filters.cabinClasses.includes(cls)}
                onChange={() => toggleArrayItem('cabinClasses', cls)}
              />
              <span>{CABIN_CLASS_LABELS[cls] ?? cls}</span>
            </label>
          ))}
        </div>
      )}

      {/* Tarife paketleri */}
      {options.farePackages && options.farePackages.length > 1 && (
        <div className="bb-filter-section">
          <h4 className="bb-filter-section__title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bb-filter-section__icon">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            Tarife Paketi
          </h4>
          {options.farePackages.map(pkgName => (
            <label key={pkgName} className="bb-filter-checkbox">
              <input
                type="checkbox"
                checked={filters.farePackages.includes(pkgName)}
                onChange={() => toggleArrayItem('farePackages', pkgName)}
              />
              <span>{pkgName}</span>
            </label>
          ))}
        </div>
      )}

      {/* Kalkış saati */}
      {options.earliestDeparture && options.latestDeparture && (
        <div className="bb-filter-section">
          <h4 className="bb-filter-section__title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bb-filter-section__icon">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Kalkış Saati
          </h4>
          <div className="bb-filter-section__time-inputs">
            <input
              type="time"
              className="bb-filter-section__input"
              value={filters.departureTimeFrom ?? options.earliestDeparture}
              onChange={e => handleTimeChange(e.target.value, filters.departureTimeTo ?? options.latestDeparture!)}
            />
            <span className="bb-filter-section__separator">—</span>
            <input
              type="time"
              className="bb-filter-section__input"
              value={filters.departureTimeTo ?? options.latestDeparture}
              onChange={e => handleTimeChange(filters.departureTimeFrom ?? options.earliestDeparture!, e.target.value)}
            />
          </div>
        </div>
      )}
    </aside>
  );
};

export default FlightFiltersPanel;
