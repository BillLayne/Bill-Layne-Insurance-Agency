import type { ReactNode } from 'react';
import { CTAPill } from './CTAPill';
import { Headline } from './Headline';
import { LogoStrap } from './LogoStrap';
import { PhoneCTA } from './PhoneCTA';
import { StarRating } from './StarRating';

export interface CarouselCTASlideProps {
  headline?: ReactNode;
  /** One reassuring line, e.g. “No robots. A real local agent reads every message.” */
  sub?: ReactNode;
  ctaLabel?: string;
  /** Show the 5-star trust row above the headline. Default true. */
  showStars?: boolean;
  starsLabel?: string;
  /** Show the big phone lockup. Default true. */
  showPhone?: boolean;
  phone?: string;
  showStrap?: boolean;
  finePrint?: string;
}

/**
 * The closing slide of a carousel: recap the value, then one clear, low-
 * pressure ask. Keep the CTA opt-in (“Message us”, “Ask us anything”) —
 * that’s both better manners and insurance-compliant.
 */
export function CarouselCTASlide({
  headline = 'Want a second set of eyes on your policy?',
  sub,
  ctaLabel = 'Message us — it’s free',
  showStars = true,
  starsLabel = 'Local & independent · Since 2005',
  showPhone = true,
  phone = '336-835-1993',
  showStrap = true,
  finePrint,
}: CarouselCTASlideProps) {
  return (
    <div className="bss-t bss-carcta">
      <div className="bss-t__main">
        {showStars && <StarRating size="md" label={starsLabel} />}
        <Headline size="lg" align="center">
          {headline}
        </Headline>
        {sub && <div className="bss-carcta__sub">{sub}</div>}
        {ctaLabel && <CTAPill label={ctaLabel} size="lg" icon="message" />}
        {showPhone && <PhoneCTA phone={phone} />}
      </div>
      {showStrap && <LogoStrap finePrint={finePrint} />}
    </div>
  );
}
