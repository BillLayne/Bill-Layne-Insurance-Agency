import type { ReactNode } from 'react';
import { Kicker } from './Kicker';
import { StatNumber } from './StatNumber';
import { LogoStrap } from './LogoStrap';

export interface StatSpotlightProps {
  kicker?: string;
  /** The figure, e.g. "20+", "3 of 4". Use only real, defensible numbers. */
  value: ReactNode;
  /** Caption directly under the number. */
  caption?: ReactNode;
  /** Supporting sentence / context below the stat. */
  body?: ReactNode;
  /** Source attribution for third-party stats, e.g. "Source: III, 2025". Builds trust + covers compliance. */
  source?: ReactNode;
  align?: 'left' | 'center';
  showStrap?: boolean;
  finePrint?: string;
}

/**
 * EDUCATION / PROMO mode — one oversized statistic as the whole point of the
 * piece: a big number, a caption, a line of context, and (for third-party
 * figures) a source line. Great for awareness posts and "did you know" content.
 * Use only real, non-misleading numbers.
 */
export function StatSpotlight({
  kicker,
  value,
  caption,
  body,
  source,
  align = 'center',
  showStrap = true,
  finePrint,
}: StatSpotlightProps) {
  return (
    <div className={`bis-t bis-spotlight${align === 'center' ? ' bis-spotlight--center' : ''}`}>
      <div className="bis-t__main bis-spotlight__main">
        {kicker && <Kicker>{kicker}</Kicker>}
        <StatNumber value={value} caption={caption} size="xl" align={align} />
        {body && <div className="bis-spotlight__body">{body}</div>}
        {source && <div className="bis-spotlight__source">{source}</div>}
      </div>
      {showStrap && <LogoStrap finePrint={finePrint} />}
    </div>
  );
}
