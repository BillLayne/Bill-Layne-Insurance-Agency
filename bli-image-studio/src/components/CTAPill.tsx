import { iconFor, type IconName } from './icons';

export interface CTAPillProps {
  /** Button text, e.g. "Call or text 336-835-1993" or "Request a quote". */
  label: string;
  /** Leading icon. Default `none`. */
  icon?: IconName;
  /** `gold` (default), `navy`, `teal`, `white`, or `outline`. Use `navy` on a gold canvas. */
  variant?: 'gold' | 'navy' | 'teal' | 'white' | 'outline';
  size?: 'lg' | 'md' | 'sm';
}

/**
 * The call-to-action pill. Keep the label to a compliant action —
 * "Request a quote", "Call or text 336-835-1993", "Let's review your options".
 * Never a savings/price promise.
 */
export function CTAPill({ label, icon = 'none', variant = 'gold', size = 'md' }: CTAPillProps) {
  const Icon = iconFor(icon);
  return (
    <span className={`bis-cta bis-cta--${variant} bis-cta--${size}`}>
      {Icon && (
        <span className="bis-cta__icon">
          <Icon />
        </span>
      )}
      <span className="bis-cta__label">{label}</span>
    </span>
  );
}
