import type { ReactNode } from 'react';
import { BrandLockup } from './BrandLockup';
import { ChipBadge } from './ChipBadge';
import { Headline } from './Headline';
import { IconArrowRight } from './icons';

export interface CarouselCoverSlideProps {
  /** Topic chip top-right, e.g. “AUTO · NC”. */
  topic?: string;
  /**
   * The hook — open a curiosity gap, don’t label the topic.
   * “The one gap in your home policy nobody mentions” beats “Home insurance tips”.
   */
  hook: ReactNode;
  /** Optional one-line teaser under the hook. */
  sub?: ReactNode;
  /** Total slides in the carousel (drives the progress dots). Default 8. */
  totalSlides?: number;
  /** Show the brand lockup top-left. Default true. */
  showBrand?: boolean;
}

/**
 * Slide 1 of an educational carousel — carousels out-engage every other
 * format in 2026. Huge hook headline, progress dots, and a SWIPE cue. Use
 * the same 4:5 portrait canvas for every slide in the set.
 */
export function CarouselCoverSlide({
  topic,
  hook,
  sub,
  totalSlides = 8,
  showBrand = true,
}: CarouselCoverSlideProps) {
  const dots = Math.min(Math.max(totalSlides, 3), 10);
  return (
    <div className="bss-t bss-carcover">
      <div className="bss-carrow bss-carrow--top">
        {showBrand ? <BrandLockup size="sm" /> : <span />}
        {topic && <ChipBadge variant="outline">{topic}</ChipBadge>}
      </div>
      <div className="bss-carcover__hook">
        <Headline size="xl">{hook}</Headline>
        {sub && <div className="bss-carcover__sub">{sub}</div>}
      </div>
      <div className="bss-carrow bss-carrow--foot">
        <span className="bss-cardots">
          {Array.from({ length: dots }, (_, i) => (
            <span
              key={i}
              className={`bss-cardots__dot${i === 0 ? ' bss-cardots__dot--on' : ''}`}
            />
          ))}
        </span>
        <span className="bss-swipe">
          Swipe
          <IconArrowRight />
        </span>
      </div>
    </div>
  );
}
