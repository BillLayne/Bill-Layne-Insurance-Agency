export interface LogoPlaceholderProps {
  /** What goes here, shown in the box. Default "LOGO". */
  label?: string;
  /** Aspect ratio hint: `wide` (default, ~3:1), `square`, or `tall`. */
  ratio?: 'wide' | 'square' | 'tall';
}

/**
 * A clean, labeled placeholder box for any logo or mark that must be the REAL
 * file — the agency logo or a carrier logo. Per brand rule, logos are never
 * drawn, recolored, or invented; when the real file isn't attached, this leaves
 * a tidy "PLACE LOGO HERE (add original in Canva)" slot to drop it into.
 */
export function LogoPlaceholder({ label = 'LOGO', ratio = 'wide' }: LogoPlaceholderProps) {
  return (
    <div className={`bis-logoph bis-logoph--${ratio}`} role="img" aria-label={`${label} placeholder`}>
      <span className="bis-logoph__label">PLACE {label} HERE</span>
      <span className="bis-logoph__hint">add original in Canva</span>
    </div>
  );
}
