import { iconFor, type IconName } from './icons';

export interface ChipBadgeProps {
  /** Short label, e.g. "Independent Agency" or "Since 2005". */
  label: string;
  icon?: IconName;
  /** `soft` (default) neutral chip, `gold`, `teal`, or `solid` navy. */
  tone?: 'soft' | 'gold' | 'teal' | 'solid';
}

/**
 * A small pill of metadata — trust signals ("Independent Agency", "Elkin, NC",
 * "Since 2005"), coverage tags, or feature chips. Group 2–3 in a row; more than
 * that reads as clutter.
 */
export function ChipBadge({ label, icon = 'none', tone = 'soft' }: ChipBadgeProps) {
  const Icon = iconFor(icon);
  return (
    <span className={`bis-chip bis-chip--${tone}`}>
      {Icon && (
        <span className="bis-chip__icon">
          <Icon />
        </span>
      )}
      <span className="bis-chip__label">{label}</span>
    </span>
  );
}
