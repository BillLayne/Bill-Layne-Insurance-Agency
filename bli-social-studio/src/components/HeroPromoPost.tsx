import type { ReactNode } from 'react';
import { CTAPill } from './CTAPill';
import { Headline } from './Headline';
import { Kicker } from './Kicker';
import { LogoStrap } from './LogoStrap';

export interface HeroPromoPostProps {
  /** Eyebrow topic line, e.g. “LOCAL & INDEPENDENT”. */
  kicker?: string;
  /** The big statement. Wrap the key phrase in `Highlight`. */
  headline: ReactNode;
  headlineSize?: 'xl' | 'lg' | 'md';
  /** One supporting sentence in plain English. */
  subline?: ReactNode;
  /** Primary CTA text, e.g. “Call or text 336-835-1993”. */
  ctaLabel?: string;
  ctaIcon?: 'phone' | 'arrow' | 'message' | 'none';
  /** Primary CTA style — use `navy` on the gold canvas. Default `gold`. */
  ctaVariant?: 'gold' | 'navy' | 'outline' | 'white';
  /** Optional second, outline CTA. */
  secondaryCtaLabel?: string;
  align?: 'left' | 'center';
  /** Brand footer bar. Default true. */
  showStrap?: boolean;
  /** Compliance line above the strap, e.g. “Coverage subject to policy terms. NC License #6571216”. */
  finePrint?: string;
}

/**
 * The flagship statement post: kicker, one oversized headline, a plain-English
 * subline, and a CTA over any canvas background. Use it for brand moments,
 * offers (“Free policy review”), and big announcements.
 */
export function HeroPromoPost({
  kicker,
  headline,
  headlineSize = 'lg',
  subline,
  ctaLabel,
  ctaIcon = 'none',
  ctaVariant = 'gold',
  secondaryCtaLabel,
  align = 'left',
  showStrap = true,
  finePrint,
}: HeroPromoPostProps) {
  return (
    <div className={`bss-t bss-hero${align === 'center' ? ' bss-hero--center' : ''}`}>
      <div className="bss-t__main">
        {kicker && (
          <div className="bss-hero__kicker">
            <Kicker>{kicker}</Kicker>
          </div>
        )}
        <Headline size={headlineSize} align={align}>
          {headline}
        </Headline>
        {subline && <div className="bss-hero__sub">{subline}</div>}
        {(ctaLabel || secondaryCtaLabel) && (
          <div className="bss-hero__cta">
            {ctaLabel && (
              <CTAPill label={ctaLabel} icon={ctaIcon} variant={ctaVariant} size="lg" />
            )}
            {secondaryCtaLabel && (
              <CTAPill label={secondaryCtaLabel} variant="outline" size="lg" />
            )}
          </div>
        )}
      </div>
      {showStrap && <LogoStrap finePrint={finePrint} />}
    </div>
  );
}
