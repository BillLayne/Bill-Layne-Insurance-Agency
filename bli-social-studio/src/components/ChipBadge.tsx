import type { ReactNode } from 'react';
import { IconCheck, IconClock, IconPin, IconStar } from './icons';

export interface ChipBadgeProps {
  /** Short all-caps text, e.g. “ELKIN, NC”, “SINCE 2005”, “FREE TO ASK”. */
  children: ReactNode;
  variant?: 'outline' | 'gold' | 'teal' | 'white' | 'navy';
  icon?: 'pin' | 'star' | 'check' | 'clock' | 'none';
}

/**
 * A small pill badge for context tags — location (“ELKIN, NC”), trust
 * (“SINCE 2005”), or topic (“STORM SEASON”). One or two per post, never a
 * cloud of them.
 */
export function ChipBadge({ children, variant = 'outline', icon = 'none' }: ChipBadgeProps) {
  return (
    <span className={`bss-chip bss-chip--${variant}`}>
      {icon !== 'none' && (
        <span className="bss-chip__icon">
          {icon === 'pin' ? (
            <IconPin />
          ) : icon === 'star' ? (
            <IconStar />
          ) : icon === 'check' ? (
            <IconCheck />
          ) : (
            <IconClock />
          )}
        </span>
      )}
      {children}
    </span>
  );
}
