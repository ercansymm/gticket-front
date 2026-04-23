"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import TicketRequestForm, { TicketRequestPayload } from "./TicketRequestForm";

interface ActionPanelProps {
  isCancelled: boolean;
  onSubmitRequest?: (data: TicketRequestPayload) => Promise<void> | void;
}

export default function ActionPanel({
  isCancelled,
  onSubmitRequest,
}: ActionPanelProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Giriş yapılmamışsa panel hiç render edilmesin
  if (!isAuthenticated) return null;

  const openRequest = () => setShowRequestModal(true);
  const closeRequest = () => {
    if (!submitting) setShowRequestModal(false);
  };

  const handleSubmitRequest = async (data: TicketRequestPayload) => {
    try {
      setSubmitting(true);
      if (onSubmitRequest) {
        await onSubmitRequest(data);
      }
      setShowRequestModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pnr-card pnr-actions">
      <h3 className="pnr-actions__title">İşlemler</h3>
      {isCancelled && (
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 12,
            color: "var(--bb-gray-600, #6b7280)",
          }}
        >
          Bu bilet iptal edilmiştir. İade veya bilgi talebinizi aşağıdaki form üzerinden iletebilirsiniz.
        </p>
      )}
      <div className="pnr-actions__list">
        <button
          type="button"
          onClick={openRequest}
          className="pnr-actions__btn pnr-actions__btn--cancel"
        >
          Talep Oluştur
        </button>
      </div>
      {showRequestModal && (
        <TicketRequestForm
          onSubmit={handleSubmitRequest}
          onClose={closeRequest}
          submitting={submitting}
        />
      )}
    </div>
  );
}
