import type { ReactNode } from 'react';
import { Kicker } from './Kicker';
import { Headline } from './Headline';
import { BrandLockup } from './BrandLockup';
import { LogoStrap } from './LogoStrap';

export interface CorporateCardProps {
  kicker?: string;
  /** Understated editorial headline. */
  headline: ReactNode;
  /** One or two calm, plain-English paragraphs. */
  body?: ReactNode;
  /** Optional portrait/photo (e.g. Bill). Missing src renders a soft panel. */
  photoSrc?: string;
  /** Optional attribution line, e.g. "Bill Layne · Agency Owner". */
  attribution?: ReactNode;
  /** Real agency-logo image URL, if attached. Otherwise the text lockup shows. */
  logoSrc?: string;
  showStrap?: boolean;
}

/**
 * CORPORATE mode — an editorial, understated, trust-building layout for "about
 * the agency", welcome/thank-you notes, B2B, and community sponsorship pieces.
 * Calmer than the promo templates: more whitespace, quieter type, no hard CTA.
 * Best on cream or white canvases.
 */
export function CorporateCard({
  kicker = 'Independent Agency · Since 2005',
  headline,
  body,
  photoSrc,
  attribution,
  logoSrc,
  showStrap = true,
}: CorporateCardProps) {
  return (
    <div className={`bis-t bis-corp${photoSrc ? ' bis-corp--photo' : ''}`}>
      <div className="bis-corp__main">
        <div className="bis-corp__copy">
          {kicker && <Kicker accent="teal">{kicker}</Kicker>}
          <Headline size="md" font="display">
            {headline}
          </Headline>
          {body && <div className="bis-corp__body">{body}</div>}
          {attribution && <div className="bis-corp__attr">{attribution}</div>}
          <div className="bis-corp__lockup">
            <BrandLockup logoSrc={logoSrc} />
          </div>
        </div>
        {photoSrc && (
          <div className="bis-corp__media">
            <div className="bis-corp__photo" style={{ backgroundImage: `url(${photoSrc})` }} />
          </div>
        )}
      </div>
      {showStrap && <LogoStrap />}
    </div>
  );
}
