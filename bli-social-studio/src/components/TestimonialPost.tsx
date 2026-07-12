import { ChipBadge } from './ChipBadge';
import { LogoStrap } from './LogoStrap';
import { StarRating } from './StarRating';

export interface TestimonialPostProps {
  /** The review, verbatim and genuine (FTC: never edit the substance). */
  quote: string;
  /** Reviewer’s first name + last initial, e.g. “Sarah W.”. */
  name: string;
  /** Their town — local proof matters: “Dobson, NC”. */
  location?: string;
  /** Where the review lives. Renders as a badge. */
  source?: 'google' | 'facebook' | 'client';
  /** Star count 0–5. Default 5. */
  stars?: number;
  showStrap?: boolean;
  finePrint?: string;
}

/**
 * A real-review social-proof post: five gold stars, the quote in warm serif
 * type, and who said it. Use genuine reviews only — testimonials are
 * regulated marketing for insurance, and authenticity is the whole point.
 */
export function TestimonialPost({
  quote,
  name,
  location,
  source = 'google',
  stars = 5,
  showStrap = true,
  finePrint,
}: TestimonialPostProps) {
  const long = quote.length > 140;
  const sourceLabel =
    source === 'google' ? 'Google review' : source === 'facebook' ? 'Facebook review' : 'Client review';
  return (
    <div className="bss-t bss-quote">
      <div className="bss-t__main">
        <div className="bss-quote__stars">
          <StarRating count={stars} size="md" />
        </div>
        <div className="bss-quote__mark">“</div>
        <div className={`bss-quote__text${long ? ' bss-quote__text--long' : ''}`}>
          {quote}
        </div>
        <div className="bss-quote__attr">
          <span className="bss-quote__who">— {name}</span>
          {location && <span className="bss-quote__where">{location}</span>}
          <ChipBadge variant="gold" icon="star">
            {sourceLabel}
          </ChipBadge>
        </div>
      </div>
      {showStrap && <LogoStrap finePrint={finePrint} />}
    </div>
  );
}
