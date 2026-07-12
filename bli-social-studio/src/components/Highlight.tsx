import type { ReactNode } from 'react';

export interface HighlightProps {
  /** The word or phrase to accent (keep it to 1–3 words). */
  children: ReactNode;
  /**
   * `marker` = highlighter swipe behind the text (default);
   * `underline` = hand-drawn squiggle underneath;
   * `circle` = hand-drawn ring around the phrase.
   */
  look?: 'marker' | 'underline' | 'circle';
  color?: 'gold' | 'teal';
}

/**
 * Hand-annotated emphasis inside a Headline — the human, “marked by a person”
 * accent that defines 2026 social type. Use on the ONE phrase that matters:
 * `<Headline>Your teen driver <Highlight>isn’t automatic</Highlight></Headline>`.
 */
export function Highlight({ children, look = 'marker', color = 'gold' }: HighlightProps) {
  return (
    <span className={`bss-hl bss-hl--${look} bss-hl--${color}`}>{children}</span>
  );
}
