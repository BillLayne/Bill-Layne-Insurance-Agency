import { IconPhone } from './icons';

export interface PhoneCTAProps {
  phone?: string;
  /** Small caps line above the number. Default “Call or text”. */
  label?: string;
  size?: 'md' | 'lg';
  /** Show the gold phone-icon circle. Default true. */
  showIcon?: boolean;
}

/**
 * The phone-number lockup: gold icon circle + “CALL OR TEXT” + the number in
 * heavy type. The strongest conversion element for a local agency — use it on
 * CTA slides and quote-offer posts.
 */
export function PhoneCTA({
  phone = '336-835-1993',
  label = 'Call or text',
  size = 'md',
  showIcon = true,
}: PhoneCTAProps) {
  return (
    <span className={`bss-phonecta bss-phonecta--${size}`}>
      {showIcon && (
        <span className="bss-phonecta__circle">
          <IconPhone />
        </span>
      )}
      <span className="bss-phonecta__stack">
        <span className="bss-phonecta__label">{label}</span>
        <span className="bss-phonecta__phone">{phone}</span>
      </span>
    </span>
  );
}
