import type { ReactNode } from 'react';
import { CTAPill } from './CTAPill';
import { Kicker } from './Kicker';
import { LogoStrap } from './LogoStrap';

export interface StatPostProps {
  kicker?: string;
  /** The number itself, kept short: “$64K”, “1 in 8”, “-23%”. */
  stat: string;
  /** Small unit/suffix rendered after the stat, e.g. “avg”. */
  suffix?: string;
  /** The plain-English takeaway under the number. */
  label: ReactNode;
  /** Source line — cite real sources, it builds trust. */
  source?: string;
  ctaLabel?: string;
  showStrap?: boolean;
  finePrint?: string;
}

/**
 * The big-number hook post: one oversized gold statistic + one-line takeaway.
 * A single surprising number stops the scroll better than a paragraph ever
 * will. Keep the stat string short (“$64K”, not “$64,000.00”). Strongest on
 * dark canvases (gradient/navy/teal); on light canvases the number
 * automatically remaps to a navy→teal fill for contrast.
 */
export function StatPost({
  kicker,
  stat,
  suffix,
  label,
  source,
  ctaLabel,
  showStrap = true,
  finePrint,
}: StatPostProps) {
  const len = stat.length;
  const sizeClass = len <= 4 ? '' : len <= 7 ? ' bss-stat__big--long' : ' bss-stat__big--xlong';
  return (
    <div className="bss-t bss-stat">
      <div className="bss-t__main">
        {kicker && <Kicker>{kicker}</Kicker>}
        <div className={`bss-stat__big${sizeClass}`}>
          {stat}
          {suffix && <span className="bss-stat__suffix"> {suffix}</span>}
        </div>
        <div className="bss-stat__label">{label}</div>
        {source && <div className="bss-stat__source">{source}</div>}
        {ctaLabel && (
          <div className="bss-t__cta">
            <CTAPill label={ctaLabel} />
          </div>
        )}
      </div>
      {showStrap && <LogoStrap finePrint={finePrint} />}
    </div>
  );
}
