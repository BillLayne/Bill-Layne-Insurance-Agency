import type { ReactNode } from 'react';

export interface KickerProps {
  /** Short eyebrow text, e.g. "LOCAL & INDEPENDENT". Kept to a few words. */
  children: ReactNode;
  /** `gold` (default) or `teal` accent bar. */
  accent?: 'gold' | 'teal';
}

/**
 * The eyebrow line above a headline: a short accent bar + uppercase label.
 * Sets topic and adds brand color without competing with the headline.
 */
export function Kicker({ children, accent = 'gold' }: KickerProps) {
  return (
    <div className={`bis-kicker bis-kicker--${accent}`}>
      <span className="bis-kicker__bar" />
      <span className="bis-kicker__text">{children}</span>
    </div>
  );
}
