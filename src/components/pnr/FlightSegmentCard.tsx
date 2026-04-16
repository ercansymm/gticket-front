"use client";

import { Plane, Luggage, Clock } from "lucide-react";
import type { AllocateSegment } from "@/types/flight";
import AirlineLogo from "@/components/common/AirlineLogo";

interface FlightSegmentCardProps {
  segment: AllocateSegment;
  index: number;
  label?: string;
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
}: FlightSegmentCardProps) {
  const airlineCode = segment.marketingAirline ?? "";
  const airlineName = AIRLINE_NAMES[airlineCode] ?? airlineCode;
  const flightNo = `${airlineCode} ${segment.flightNumber ?? ""}`;
  const cabinClass = segment.bookingClass ?? "";

  return (
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
      </div>
    </div>
  );
}
