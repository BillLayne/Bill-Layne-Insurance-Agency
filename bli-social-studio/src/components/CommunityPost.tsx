import type { ReactNode } from 'react';
import { CTAPill } from './CTAPill';
import { Headline } from './Headline';
import { IconClock, IconPin } from './icons';
import { Kicker } from './Kicker';
import { LogoStrap } from './LogoStrap';

export interface CommunityPostProps {
  /** Eyebrow line. Default “AROUND ELKIN”. */
  kicker?: string;
  /** Event or spotlight name. */
  title: ReactNode;
  /** Month abbreviation for the date card, e.g. “JUL”. */
  month: string;
  /** Day number for the date card, e.g. “18”. */
  day: string;
  /** Venue / place line, e.g. “Downtown Elkin”. */
  place?: string;
  /** Time line, e.g. “5–9 PM”. */
  time?: string;
  /** A warm sentence about why it matters locally. */
  details?: ReactNode;
  ctaLabel?: string;
  showStrap?: boolean;
}

/**
 * Local community spotlight — hometown events, sponsorships, school nights.
 * Local pride content out-reaches generic content for small-town pages, and
 * it’s the most human thing an agency can post. Calendar card + event info.
 */
export function CommunityPost({
  kicker = 'Around Elkin',
  title,
  month,
  day,
  place,
  time,
  details,
  ctaLabel,
  showStrap = true,
}: CommunityPostProps) {
  return (
    <div className="bss-t bss-comm">
      <div className="bss-t__main">
        {kicker && <Kicker>{kicker}</Kicker>}
        <div className="bss-comm__row">
          <div className="bss-comm__datecard">
            <div className="bss-comm__datecard-month">{month}</div>
            <div className="bss-comm__datecard-day">{day}</div>
          </div>
          <div className="bss-comm__info">
            <Headline size="sm">{title}</Headline>
            {place && (
              <div className="bss-comm__meta">
                <IconPin /> {place}
              </div>
            )}
            {time && (
              <div className="bss-comm__meta">
                <IconClock /> {time}
              </div>
            )}
          </div>
        </div>
        {details && <div className="bss-comm__details">{details}</div>}
        {ctaLabel && (
          <div className="bss-t__cta">
            <CTAPill label={ctaLabel} variant="outline" />
          </div>
        )}
      </div>
      {showStrap && <LogoStrap />}
    </div>
  );
}
