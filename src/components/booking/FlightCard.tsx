import type { FlightResult } from '@/types';

interface FlightCardProps {
  flight: FlightResult;
  onSelect: () => void;
}

const FlightCard = ({ flight, onSelect }: FlightCardProps) => {
  return (
    <div className="bb-flight-card">
      <div className="bb-flight-card__airline">
        {flight.airlineName}
        <div style={{ fontSize: 12, color: '#9ca3af' }}>
          {flight.flightNumber}
        </div>
      </div>

      <div className="bb-flight-card__times">
        <div className="bb-flight-card__time">{flight.departureTime}</div>
        <div className="bb-flight-card__duration">
          {flight.durationFormatted}
          <span></span>
          {flight.originCode} → {flight.destinationCode}
        </div>
        <div className="bb-flight-card__time">{flight.arrivalTime}</div>
      </div>

      <div className="bb-flight-card__info">
        <div className="bb-flight-card__badges">
          <span className="bb-flight-card__badge bb-flight-card__badge--refundable">
            {flight.refundableText}
          </span>
          <span className="bb-flight-card__badge">
            {flight.stopText}
          </span>
          <span className="bb-flight-card__badge">
            {flight.bookingClassName}
          </span>
          {flight.availableSeats <= 9 && (
            <span className="bb-flight-card__badge bb-flight-card__badge--seats">
              {flight.availableSeatsText}
            </span>
          )}
        </div>
      </div>

      <div className="bb-flight-card__price">
        <div className="bb-flight-card__amount">
          {flight.totalFareFormatted}
        </div>
        <div className="bb-flight-card__currency">{flight.currency}</div>
      </div>

      <button className="bb-flight-card__select" onClick={onSelect}>
        Seç
      </button>
    </div>
  );
};

export default FlightCard;
