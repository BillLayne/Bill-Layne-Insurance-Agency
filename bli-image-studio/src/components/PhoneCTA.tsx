import { IconPhone } from './icons';

export interface PhoneCTAProps {
  /** Phone number. Defaults to the agency line. */
  phone?: string;
  /** Small label above the number, e.g. "Call or text". */
  label?: string;
  align?: 'left' | 'center';
}

/**
 * The phone-first call block for sales/quote pieces: a small "Call or text"
 * label over the number set large in the display face. The number is the hero.
 */
export function PhoneCTA({
  phone = '336-835-1993',
  label = 'Call or text',
  align = 'left',
}: PhoneCTAProps) {
  return (
    <div className={`bis-phonecta${align === 'center' ? ' bis-phonecta--center' : ''}`}>
      <span className="bis-phonecta__label">{label}</span>
      <span className="bis-phonecta__row">
        <span className="bis-phonecta__icon">
          <IconPhone />
        </span>
        <span className="bis-phonecta__num">{phone}</span>
      </span>
    </div>
  );
}
