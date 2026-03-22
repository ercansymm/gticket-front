import type { FlightSortBy } from '@/types';

interface SortBarProps {
  sortBy: FlightSortBy;
  onChange: (sortBy: FlightSortBy) => void;
}

const SORT_OPTIONS: { value: FlightSortBy; label: string }[] = [
  { value: 'cheapest', label: 'En Ucuz' },
  { value: 'expensive', label: 'En Pahalı' },
  { value: 'earliest', label: 'En Erken' },
  { value: 'latest', label: 'En Geç' },
  { value: 'shortest', label: 'En Kısa' },
  { value: 'stops', label: 'En Az Aktarma' },
  { value: 'airline', label: 'Havayolu' },
];

const SortBar = ({ sortBy, onChange }: SortBarProps) => {
  return (
    <div className="bb-sort-bar">
      {SORT_OPTIONS.map(opt => (
        <button
          key={opt.value}
          className={`bb-sort-bar__btn ${sortBy === opt.value ? 'bb-sort-bar__btn--active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default SortBar;
