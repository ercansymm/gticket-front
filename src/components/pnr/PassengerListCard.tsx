"use client";

import { User } from "lucide-react";
import type { ReadShoppingPassenger, TicketInfo } from "@/types/flight";

interface PassengerListCardProps {
  passengers: ReadShoppingPassenger[];
  tickets: TicketInfo[];
}

const PAX_TYPE_MAP: Record<string, { label: string; cls: string }> = {
  ADT: { label: "Yetişkin", cls: "pnr-pax-type--adt" },
  CHD: { label: "Çocuk", cls: "pnr-pax-type--chd" },
  INF: { label: "Bebek", cls: "pnr-pax-type--inf" },
};

export default function PassengerListCard({
  passengers,
  tickets,
}: PassengerListCardProps) {
  if (!passengers || passengers.length === 0) return null;

  const ticketMap = new Map<string, TicketInfo>();
  tickets?.forEach((t) => {
    const key = `${t.firstName ?? ""}|${t.lastName ?? ""}`.toLowerCase();
    ticketMap.set(key, t);
  });

  return (
    <div className="pnr-card">
      <h3 className="pnr-passengers__title">Yolcu Bilgileri</h3>
      <div className="pnr-passengers__list">
        {passengers.map((pax, idx) => {
          const paxInfo = PAX_TYPE_MAP[pax.paxType ?? ""] ?? PAX_TYPE_MAP.ADT;
          const key = `${pax.firstName ?? ""}|${pax.lastName ?? ""}`.toLowerCase();
          const ticket = ticketMap.get(key);
          const ticketNo = pax.ticketNumber ?? ticket?.ticketNumber ?? null;

          return (
            <div key={idx} className="pnr-passenger-row">
              <div className="pnr-passenger-row__avatar">
                <User size={16} />
              </div>
              <div className="pnr-passenger-row__info">
                <div className="pnr-passenger-row__name-line">
                  <span className="pnr-passenger-row__name">
                    {pax.firstName ?? ""} {pax.lastName ?? ""}
                  </span>
                  <span className={`pnr-pax-type ${paxInfo.cls}`}>
                    {paxInfo.label}
                  </span>
                </div>
                <div className="pnr-passenger-row__details">
                  {ticketNo && (
                    <span>
                      Bilet No: <code>{ticketNo}</code>
                    </span>
                  )}
                  <span>Sıra: {pax.sequenceNo}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
