import { useCallback, useState, useEffect } from 'react';
import type { FilterOptions, FlightFilters } from '@/types';
import { INITIAL_FILTERS } from '@/utils/flightFilters';

interface FilterSidebarProps {
  options: FilterOptions | null;
  filters: FlightFilters;
  onChange: (filters: FlightFilters) => void;
  resultCount: number;
  totalCount: number;
}

const FilterSidebar = ({ options, filters, onChange, resultCount, totalCount }: FilterSidebarProps) => {
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
        <h4 className="bb-filter-section__title">Fiyat Aralığı</h4>
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
          <h4 className="bb-filter-section__title">Havayolu</h4>
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

      {/* Kabin sınıfı — tek sınıf varsa gizle */}
      {options.cabinClasses && options.cabinClasses.length > 1 && (
        <div className="bb-filter-section">
          <h4 className="bb-filter-section__title">Kabin Sınıfı</h4>
          {options.cabinClasses.map(cls => (
            <label key={cls} className="bb-filter-checkbox">
              <input
                type="checkbox"
                checked={filters.cabinClasses.includes(cls)}
                onChange={() => toggleArrayItem('cabinClasses', cls)}
              />
              <span>{cls}</span>
            </label>
          ))}
        </div>
      )}

      {/* Paket tipi */}
      {options.farePackages && options.farePackages.length > 0 && (
        <div className="bb-filter-section">
          <h4 className="bb-filter-section__title">Paket Tipi</h4>
          {options.farePackages.map(pkg => (
            <label key={pkg} className="bb-filter-checkbox">
              <input
                type="checkbox"
                checked={filters.farePackages.includes(pkg)}
                onChange={() => toggleArrayItem('farePackages', pkg)}
              />
              <span>{pkg}</span>
            </label>
          ))}
        </div>
      )}

      {/* Kalkış saati */}
      {options.earliestDeparture && options.latestDeparture && (
        <div className="bb-filter-section">
          <h4 className="bb-filter-section__title">Kalkış Saati</h4>
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

export default FilterSidebar;
