import { IconArrowRight, IconMessage, IconPhone } from './icons';

export interface CTAPillProps {
  /** Button text, e.g. “Call or text 336-835-1993” or “Get a free quote”. */
  label: string;
  /**
   * `gold` (default) is the primary brand CTA; `navy` for light/gold
   * backgrounds; `outline` as a secondary action; `white` on photos.
   */
  variant?: 'gold' | 'navy' | 'outline' | 'white';
  /** `md` default · `lg` for hero CTAs. */
  size?: 'md' | 'lg';
  /** Optional leading icon. */
  icon?: 'phone' | 'arrow' | 'message' | 'none';
}

/**
 * The call-to-action pill. Social posts aren’t clickable, so the pill is a
 * visual cue — keep the label an action a viewer can take (“Call or text…”,
 * “Message us”, “Ask us anything”). One gold pill per post; pair with an
 * outline pill only when offering two actions.
 */
export function CTAPill({
  label,
  variant = 'gold',
  size = 'md',
  icon = 'none',
}: CTAPillProps) {
  return (
    <span className={`bss-pill bss-pill--${variant} bss-pill--${size}`}>
      {icon !== 'none' && (
        <span className="bss-pill__icon">
          {icon === 'phone' ? <IconPhone /> : icon === 'arrow' ? <IconArrowRight /> : <IconMessage />}
        </span>
      )}
      {label}
    </span>
  );
}
