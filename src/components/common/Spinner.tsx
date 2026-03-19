interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullPage?: boolean;
}

const Spinner = ({ size = 'medium', text, fullPage = false }: SpinnerProps) => {
  const spinner = (
    <div className={`bb-spinner-wrapper${fullPage ? ' bb-spinner-overlay' : ''}`}>
      <div className={`bb-spinner bb-spinner--${size}`} role="status" aria-label={text || 'Yükleniyor'}>
        <span className="sr-only">{text || 'Yükleniyor...'}</span>
      </div>
      {text && <p className="bb-spinner-text">{text}</p>}
    </div>
  );

  return spinner;
};

export default Spinner;
