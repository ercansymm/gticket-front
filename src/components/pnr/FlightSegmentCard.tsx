"use client";

import { useState } from "react";
import { Plane, Luggage, Clock, ExternalLink } from "lucide-react";
import type { AllocateSegment } from "@/types/flight";
import AirlineLogo from "@/components/common/AirlineLogo";
import CheckInModal from "@/components/pnr/CheckInModal";

interface FlightSegmentCardProps {
  segment: AllocateSegment;
  index: number;
  label?: string;
  pnr?: string | null;
  passengerLastName?: string | null;
}

const AIRLINE_NAMES: Record<string, string> = {
  TK: "Türk Hava Yolları",
  PC: "Pegasus",
  XQ: "SunExpress",
  AJ: "AnadoluJet",
  VF: "AJet",
  "6Y": "SmartJet",
  KK: "AtlasGlobal",
};

const CHECKIN_BASE_URLS: Record<string, string> = {
  TK: "https://www.turkishairlines.com/tr-int/ucak-bileti/rezervasyonu-yonet",
  PC: "https://www.flypgs.com/check-in",
  VF: "https://ajet.com/tr/checkin",
  XQ: "https://www.sunexpress.com/tr-tr/check-in/login/",
};

function buildCheckInUrl(airlineCode: string): string {
  return CHECKIN_BASE_URLS[airlineCode] ?? "";
}

const TR_MONTHS = [
  "", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function formatCheckInOpenDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = TR_MONTHS[date.getMonth() + 1];
  const year = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} ${hh}:${mm}`;
}

interface CheckInState {
  url: string;
  isAvailable: boolean;
  opensAt: Date;
}

function parseDepartureDateTime(day: string, time: string): Date | null {
  let iso = day;
  // DD.MM.YYYY → YYYY-MM-DD
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(day)) {
    const [d, m, y] = day.split(".");
    iso = `${y}-${m}-${d}`;
  }
  // Normalize time: strip seconds if present ("15:00:00" → "15:00")
  const t = time.length > 5 ? time.slice(0, 5) : time;
  const dt = new Date(`${iso}T${t}:00`);
  return isNaN(dt.getTime()) ? null : dt;
}

function getCheckInState(
  airlineCode: string,
  departureDay: string | null,
  departureTime: string | null
): CheckInState | null {
  if (!CHECKIN_BASE_URLS[airlineCode] || !departureDay || !departureTime) return null;

  const departureDateTime = parseDepartureDateTime(departureDay, departureTime);
  if (!departureDateTime) return null;

  const now = new Date();
  const msUntilDeparture = departureDateTime.getTime() - now.getTime();
  // Don't show button for past flights
  if (msUntilDeparture < 0) return null;

  const hoursUntilDeparture = msUntilDeparture / (1000 * 60 * 60);
  const opensAt = new Date(departureDateTime.getTime() - 24 * 60 * 60 * 1000);

  return {
    url: buildCheckInUrl(airlineCode),
    isAvailable: hoursUntilDeparture <= 24,
    opensAt,
  };
}

function formatDuration(duration: string | null): string {
  if (!duration) return "";
  const match = duration.match(/(\d+):(\d+)/);
  if (match) {
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    return `${h}s ${m}dk`;
  }
  return duration;
}

export default function FlightSegmentCard({
  segment,
  label,
  pnr,
  passengerLastName,
}: FlightSegmentCardProps) {
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const airlineCode = segment.marketingAirline ?? "";
  const airlineName = AIRLINE_NAMES[airlineCode] ?? airlineCode;
  const flightNo = `${airlineCode} ${segment.flightNumber ?? ""}`;
  const cabinClass = segment.bookingClass ?? "";
  const checkIn = getCheckInState(airlineCode, segment.departureDay, segment.departureTime);

  return (
    <>
    <div className="pnr-card pnr-flight">
      {/* Bar */}
      <div className="pnr-flight__bar">
        <div className="pnr-flight__bar-left">
          {label && (
            <span className="pnr-flight__direction-tag">{label}</span>
          )}
          <AirlineLogo
            code={airlineCode}
            size={28}
            alt={airlineName}
            className="pnr-flight__airline-logo"
          />
        </div>
        <div className="pnr-flight__bar-right">
          <code>{flightNo}</code>
          {cabinClass && (
            <>
              <span className="pnr-flight__bar-sep">|</span>
              <span>Sınıf: {cabinClass}</span>
            </>
          )}
        </div>
      </div>

      {/* Body — flight visual */}
      <div className="pnr-flight__body">
        {/* Departure */}
        <div className="pnr-flight__point pnr-flight__point--dep">
          <span className="pnr-flight__time">
            {segment.departureTime ?? "--:--"}
          </span>
          <span className="pnr-flight__code">{segment.originCode}</span>
          <span className="pnr-flight__date">
            {segment.departureDay ?? ""}
          </span>
        </div>

        {/* Connector */}
        <div className="pnr-flight__connector">
          {segment.duration && (
            <div className="pnr-flight__duration">
              <Clock size={12} />
              <span>{formatDuration(segment.duration)}</span>
            </div>
          )}
          <div className="pnr-flight__line">
            <div className="pnr-flight__line-segment" />
            <Plane size={16} />
            <div className="pnr-flight__line-segment" />
          </div>
          <span className="pnr-flight__direct">Direkt Uçuş</span>
        </div>

        {/* Arrival */}
        <div className="pnr-flight__point pnr-flight__point--arr">
          <span className="pnr-flight__time">
            {segment.arrivalTime ?? "--:--"}
          </span>
          <span className="pnr-flight__code">{segment.destinationCode}</span>
          <span className="pnr-flight__date">{segment.arrivalDay ?? ""}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pnr-flight__footer">
        <Luggage size={14} />
        <span>Bagaj bilgisi bilet detayında</span>
        {segment.fareBasis && (
          <>
            <span className="pnr-flight__footer-sep">|</span>
            <span>Tarife: {segment.fareBasis}</span>
          </>
        )}

        {checkIn && (
          <div className="pnr-checkin">
            {checkIn.isAvailable ? (
              <button
                type="button"
                onClick={() => setShowCheckInModal(true)}
                className="pnr-checkin__btn pnr-checkin__btn--active"
              >
                <ExternalLink size={13} />
                Online Check-in
              </button>
            ) : (
              <div className="pnr-checkin__tooltip-wrap">
                <span
                  className="pnr-checkin__btn pnr-checkin__btn--disabled"
                  aria-disabled="true"
                  role="button"
                  tabIndex={-1}
                >
                  <ExternalLink size={13} />
                  Online Check-in
                </span>
                <div className="pnr-checkin__tooltip" role="tooltip">
                  Check-in {formatCheckInOpenDate(checkIn.opensAt)} tarihinde açılacak
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {showCheckInModal && checkIn && (
      <CheckInModal
        pnr={pnr ?? ""}
        passengerLastName={passengerLastName ?? ""}
        airlineCode={airlineCode}
        airlineName={airlineName}
        checkInUrl={checkIn.url}
        onClose={() => setShowCheckInModal(false)}
      />
    )}
    </>
  );
}
