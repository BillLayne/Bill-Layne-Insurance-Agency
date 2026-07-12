import type { ReactNode } from 'react';
import { ChipBadge } from './ChipBadge';
import { Headline } from './Headline';
import { IconArrowRight } from './icons';

export interface CarouselTipSlideProps {
  /** This slide’s number (1-based). */
  index: number;
  /** Total slides in the carousel. */
  total: number;
  /** Series label chip, e.g. “STORM SEASON PREP”. */
  kicker?: string;
  /** The slide’s one idea, as a short title. */
  title: ReactNode;
  /**
   * Supporting copy — 15–20 words MAX (micro-learning rule). Use `<strong>`
   * for the key phrase.
   */
  body?: ReactNode;
}

/**
 * An interior carousel slide: one idea per slide, a big outlined slide number,
 * progress dots, and a swipe cue until the last slide. Keep body copy to
 * 15–20 words — that’s the 2026 micro-learning rule that keeps completion
 * rates high.
 */
export function CarouselTipSlide({
  index,
  total,
  kicker,
  title,
  body,
}: CarouselTipSlideProps) {
  const dots = Math.min(Math.max(total, 3), 10);
  const active = Math.min(Math.max(index - 1, 0), dots - 1);
  const idx = String(index).padStart(2, '0');
  return (
    <div className="bss-t bss-carslide">
      <div className="bss-carrow bss-carrow--top">
        {kicker ? <ChipBadge variant="outline">{kicker}</ChipBadge> : <span />}
        <span className="bss-carslide__idx">{idx}</span>
      </div>
      <div className="bss-t__main">
        <Headline size="md">{title}</Headline>
        {body && <div className="bss-carslide__body">{body}</div>}
      </div>
      <div className="bss-carrow bss-carrow--foot">
        <span className="bss-cardots">
          {Array.from({ length: dots }, (_, i) => (
            <span
              key={i}
              className={`bss-cardots__dot${i === active ? ' bss-cardots__dot--on' : ''}`}
            />
          ))}
        </span>
        {index < total ? (
          <span className="bss-swipe">
            Keep going
            <IconArrowRight />
          </span>
        ) : (
          <span className="bss-swipe">{index}/{total}</span>
        )}
      </div>
    </div>
  );
}
