import type { ReactNode } from 'react';

export interface HighlightProps {
  /** The words to emphasize inside a Headline. */
  children: ReactNode;
  /**
   * `marker` = hand-drawn highlighter sweep (default), `underline` = brush
   * underline, `text` = accent-colored text only (cleanest for print flyers).
   */
  style?: 'marker' | 'underline' | 'text';
  /** `gold` (default) or `teal`. */
  accent?: 'gold' | 'teal';
}

/**
 * The hand-marked emphasis for the one phrase that matters in a headline.
 * Use it on a single key phrase — highlighting everything highlights nothing.
 */
export function Highlight({ children, style = 'marker', accent = 'gold' }: HighlightProps) {
  return (
    <span className={`bis-hl bis-hl--${style} bis-hl--${accent}`}>
      <span className="bis-hl__text">{children}</span>
    </span>
  );
}
