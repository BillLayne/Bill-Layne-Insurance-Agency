import type { ReactNode } from 'react';

export interface KickerProps {
  /** Short all-caps topic label, e.g. “NC AUTO TIP” or “AROUND ELKIN”. */
  children: ReactNode;
  /** Leading accent: gold `bar` (default), `dot`, or `none`. */
  accent?: 'bar' | 'dot' | 'none';
}

/**
 * The small letterspaced eyebrow line above a headline. Use it to tag the
 * post’s topic (“STORM SEASON”, “MYTH VS. FACT”, “YOU ASKED”) so a scroller
 * knows the subject in half a second.
 */
export function Kicker({ children, accent = 'bar' }: KickerProps) {
  return (
    <span className="bss-kicker">
      {accent === 'bar' && <span className="bss-kicker__bar" />}
      {accent === 'dot' && <span className="bss-kicker__dot" />}
      {children}
    </span>
  );
}
