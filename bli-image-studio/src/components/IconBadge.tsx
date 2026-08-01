import { iconFor, type IconName } from './icons';

export interface IconBadgeProps {
  /** Which glyph, e.g. "shield", "home", "car", "umbrella". */
  icon: IconName;
  /** `tile` rounded square (default), `circle`, or `plain` (no background). */
  shape?: 'tile' | 'circle' | 'plain';
  /** `gold` (default), `teal`, `navy`, or `soft`. */
  tone?: 'gold' | 'teal' | 'navy' | 'soft';
  size?: 'lg' | 'md' | 'sm';
}

/**
 * An icon in a branded container — the visual anchor for an infographic point,
 * a coverage type, or a step. Pairs with a short label in the templates.
 */
export function IconBadge({ icon, shape = 'tile', tone = 'gold', size = 'md' }: IconBadgeProps) {
  const Icon = iconFor(icon);
  return (
    <span className={`bis-iconbadge bis-iconbadge--${shape} bis-iconbadge--${tone} bis-iconbadge--${size}`}>
      {Icon && <Icon />}
    </span>
  );
}
