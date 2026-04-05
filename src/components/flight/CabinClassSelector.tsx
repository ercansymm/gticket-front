'use client';

import { useState, useRef, useEffect } from 'react';
import type { CabinClass } from '@/types';

interface CabinClassOption {
  value: CabinClass;
  label: string;
  description: string;
}

const CABIN_OPTIONS: CabinClassOption[] = [
  { value: 'Economy', label: 'Ekonomi', description: 'Uygun fiyatlı seyahat' },
  { value: 'PremiumEconomy', label: 'Premium Ekonomi', description: 'Daha geniş koltuk' },
  { value: 'Business', label: 'Business', description: 'Konforlu iş seyahati' },
  { value: 'First', label: 'First Class', description: 'En üst düzey konfor' },
];

interface CabinClassSelectorProps {
  value: CabinClass;
  onChange: (value: CabinClass) => void;
}

const CabinClassSelector = ({ value, onChange }: CabinClassSelectorProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = CABIN_OPTIONS.find(o => o.value === value) ?? CABIN_OPTIONS[0];

  return (
    <div ref={ref} className="bb-cabin-selector">
      <button
        type="button"
        className="bb-cabin-selector__trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <svg className="bb-cabin-selector__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
        <span className="bb-cabin-selector__label">{selected.label}</span>
        <svg className={`bb-cabin-selector__chevron ${open ? 'bb-cabin-selector__chevron--open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="bb-cabin-selector__dropdown" role="listbox">
          {CABIN_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`bb-cabin-selector__option ${option.value === value ? 'bb-cabin-selector__option--active' : ''}`}
              onClick={() => { onChange(option.value); setOpen(false); }}
            >
              <div className="bb-cabin-selector__option-content">
                <span className="bb-cabin-selector__option-label">{option.label}</span>
                <span className="bb-cabin-selector__option-desc">{option.description}</span>
              </div>
              {option.value === value && (
                <svg className="bb-cabin-selector__check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CabinClassSelector;
