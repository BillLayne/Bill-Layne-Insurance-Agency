import { BLI_LOGO } from './assets';

export interface BrandLockupProps {
  /**
   * Agency-logo image URL. Defaults to the REAL Bill Layne Insurance badge
   * (embedded — a self-contained badge that reads on any background). Pass a
   * different real logo to override, or `null` to force the typographic lockup.
   * A logo mark is never drawn or invented.
   */
  logoSrc?: string | null;
  /** Tagline under the name/logo. Choose from the approved set. Default agency line. */
  tagline?: string;
  align?: 'left' | 'center';
  /** `auto` adapts ink to the canvas (default); `light`/`dark` force it. */
  tone?: 'auto' | 'light' | 'dark';
}

/**
 * The agency identity block. Renders the real agency badge by default; pass
 * `logoSrc={null}` for the typographic lockup ("BILL LAYNE / INSURANCE AGENCY").
 * It never draws or approximates a logo mark — only the real logo file is used.
 */
export function BrandLockup({
  logoSrc = BLI_LOGO,
  tagline = 'Independent Agency · Elkin, NC',
  align = 'left',
  tone = 'auto',
}: BrandLockupProps) {
  const cls = [
    'bis-lockup',
    align === 'center' ? 'bis-lockup--center' : '',
    tone !== 'auto' ? `bis-lockup--${tone}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (logoSrc) {
    return (
      <div className={cls}>
        <img className="bis-lockup__img" src={logoSrc} alt="Bill Layne Insurance Agency" />
        {tagline && <span className="bis-lockup__tagline">{tagline}</span>}
      </div>
    );
  }

  return (
    <div className={cls}>
      <span className="bis-lockup__name">Bill Layne</span>
      <span className="bis-lockup__sub">Insurance Agency</span>
      {tagline && <span className="bis-lockup__tagline">{tagline}</span>}
    </div>
  );
}
