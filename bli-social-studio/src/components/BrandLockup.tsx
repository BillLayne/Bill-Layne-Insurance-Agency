export interface BrandLockupProps {
  /** Lockup size. `sm` for corner branding, `md` default, `lg` for covers/heroes. */
  size?: 'sm' | 'md' | 'lg';
  /** Center-align the stack (for centered layouts like GBP posts). */
  center?: boolean;
  /** Adds “ELKIN, NC · SINCE 2005” under the name. */
  showLocation?: boolean;
}

/**
 * The Bill Layne Insurance text logo: “BILL LAYNE” in the display serif over
 * a gold rule and the letterspaced “INSURANCE AGENCY” line. This is the
 * canonical brand mark for social graphics — use it (or LogoStrap) on every
 * post so the feed reads as one brand.
 */
export function BrandLockup({
  size = 'md',
  center = false,
  showLocation = false,
}: BrandLockupProps) {
  return (
    <div
      className={`bss-lockup bss-lockup--${size}${center ? ' bss-lockup--center' : ''}`}
    >
      <span className="bss-lockup__name">Bill Layne</span>
      <span className="bss-lockup__rule" />
      <span className="bss-lockup__sub">Insurance Agency</span>
      {showLocation && <span className="bss-lockup__loc">Elkin, NC · Since 2005</span>}
    </div>
  );
}
