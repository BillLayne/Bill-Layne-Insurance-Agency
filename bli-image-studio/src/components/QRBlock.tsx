import { BLI_QR } from './assets';

export interface QRBlockProps {
  /**
   * QR-code image URL. Defaults to the REAL Bill Layne Insurance agency QR
   * (embedded — it scans to cards.billlayneinsurance.com/agency-contact).
   * Pass a different real QR to override. Real QR codes are never drawn or
   * invented — a fake QR scans to nothing.
   */
  src?: string;
  /** Force the "PLACE QR HERE" placeholder instead of the real code. */
  placeholder?: boolean;
  /** Caption under the code, e.g. "Scan to request a quote". */
  caption?: string;
  size?: 'lg' | 'md' | 'sm';
}

/**
 * The QR-code slot for flyers and print pieces. Renders the real agency QR by
 * default (override with `src`, or force a placeholder with `placeholder`).
 */
export function QRBlock({ src = BLI_QR, placeholder = false, caption = 'Scan to request a quote', size = 'md' }: QRBlockProps) {
  return (
    <div className={`bis-qr bis-qr--${size}`}>
      {src && !placeholder ? (
        <img className="bis-qr__img" src={src} alt="Bill Layne Insurance QR code" />
      ) : (
        <div className="bis-qr__ph" role="img" aria-label="QR code placeholder">
          <span className="bis-qr__ph-grid" aria-hidden="true" />
          <span className="bis-qr__ph-text">PLACE QR HERE</span>
        </div>
      )}
      {caption && <span className="bis-qr__caption">{caption}</span>}
    </div>
  );
}
