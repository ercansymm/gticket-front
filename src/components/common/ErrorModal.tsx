interface ErrorModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onRetry?: () => void;
}

const ErrorModal = ({ isOpen, title, message, onClose, onRetry }: ErrorModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="bb-error-modal-overlay" onClick={onClose}>
      <div className="bb-error-modal" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-labelledby="error-title" aria-describedby="error-message">
        <div className="bb-error-modal__header">
          <h3 id="error-title">{title}</h3>
          <button className="bb-error-modal__close" onClick={onClose} aria-label="Kapat">&times;</button>
        </div>
        <div className="bb-error-modal__body">
          <p id="error-message">{message}</p>
        </div>
        <div className="bb-error-modal__footer">
          {onRetry && (
            <button className="bb-error-modal__btn bb-error-modal__btn--retry" onClick={onRetry}>
              Tekrar Dene
            </button>
          )}
          <button className="bb-error-modal__btn bb-error-modal__btn--close" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
