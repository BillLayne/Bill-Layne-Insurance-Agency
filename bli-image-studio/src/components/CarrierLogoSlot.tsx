import { carrierLogo } from './assets';

export interface CarrierLogoSlotProps {
  /**
   * Carrier name — resolves to the REAL embedded carrier logo when known
   * (Nationwide, Progressive, Travelers, National General, Alamance, Foremost).
   * Any casing/spacing works. Also used as the placeholder label / alt text.
   */
  carrier?: string;
  /**
   * Explicit carrier-logo image URL — overrides `carrier` lookup. For carriers
   * not in the built-in set, pass the real logo here (never draw or invent one).
   */
  src?: string;
  /** Deprecated alias for `carrier` (kept for back-compat). */
  name?: string;
  /**
   * Show the "Independent Agency" clarifier line under the logo. Default true —
   * required whenever a carrier logo appears, so the piece never looks like a
   * carrier's own corporate ad.
   */
  showIndependentLine?: boolean;
}

/**
 * A single carrier-logo slot. Give it a `carrier` name and it renders that
 * carrier's real logo automatically (or pass `src` for one not built in);
 * unknown carriers fall back to a labeled placeholder. Always carries the small
 * "Independent Agency" line by default — the compliance clarifier that keeps a
 * carrier logo from reading as a carrier corporate ad.
 */
export function CarrierLogoSlot({
  carrier,
  src,
  name,
  showIndependentLine = true,
}: CarrierLogoSlotProps) {
  const label = carrier ?? name ?? 'CARRIER';
  const resolved = src ?? carrierLogo(carrier ?? name);
  return (
    <div className="bis-carrier">
      {resolved ? (
        <img className="bis-carrier__img" src={resolved} alt={`${label} logo`} />
      ) : (
        <div className="bis-carrier__ph" role="img" aria-label={`${label} logo placeholder`}>
          <span className="bis-carrier__ph-name">{label}</span>
          <span className="bis-carrier__ph-hint">place logo</span>
        </div>
      )}
      {showIndependentLine && <span className="bis-carrier__note">Independent Agency</span>}
    </div>
  );
}
