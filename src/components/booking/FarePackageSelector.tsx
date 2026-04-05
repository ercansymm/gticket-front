import type { FarePackage } from '@/types';
import FarePackageCard from '../flight/FarePackageCard';

interface FarePackageSelectorProps {
  packages: FarePackage[];
  selectedId: string | null;
  onSelect: (pkg: FarePackage) => void;
  onContinue: () => void;
  loading?: boolean;
}

const FarePackageSelector = ({ packages, selectedId, onSelect, onContinue, loading }: FarePackageSelectorProps) => {
  return (
    <div className="bb-flight-card__packages-area">
      <p className="bb-packages-hint">Tarifenizi seçin</p>
      <div className="bb-flight-card__packages">
        {packages.map((pkg) => (
          <FarePackageCard
            key={pkg.brandedFareItemId}
            pkg={pkg}
            isActive={selectedId === pkg.brandedFareItemId}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Devam butonu */}
      <div className="bb-packages-footer">
        <button
          className="bb-packages-footer__btn"
          onClick={onContinue}
          disabled={loading}
        >
          {loading ? 'Tahsis ediliyor...' : 'Seç ve İlerle'}
          {!loading && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default FarePackageSelector;
