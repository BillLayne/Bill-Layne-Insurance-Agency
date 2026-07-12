import type { ReactNode } from 'react';
import { Headline } from './Headline';
import { Kicker } from './Kicker';
import { LogoStrap } from './LogoStrap';

export interface HoursRow {
  /** e.g. “Thu, July 4”. */
  label: string;
  /** e.g. “Closed” or “9 AM – 1 PM”. */
  value: string;
}

export interface HoursUpdatePostProps {
  kicker?: string;
  /** e.g. “Holiday hours” or “We’re moving!”. */
  title?: ReactNode;
  rows: HoursRow[];
  /** Reassurance line, e.g. “Claims? Your carrier’s 24/7 line is on our site.” */
  note?: ReactNode;
  showStrap?: boolean;
}

/**
 * Office hours / closure notice — clean and informational. Post it to
 * Facebook, Instagram, AND Google Business Profile (GBP is where people
 * actually check hours).
 */
export function HoursUpdatePost({
  kicker = 'A quick heads-up',
  title = 'Holiday hours',
  rows,
  note,
  showStrap = true,
}: HoursUpdatePostProps) {
  return (
    <div className="bss-t bss-hours">
      <div className="bss-t__main">
        {kicker && <Kicker>{kicker}</Kicker>}
        <div className="bss-tips__title">
          <Headline size="md">{title}</Headline>
        </div>
        <div className="bss-hours__list">
          {rows.map((row, i) => (
            <div className="bss-hours__row" key={i}>
              <span className="bss-hours__label">{row.label}</span>
              <span className="bss-hours__value">{row.value}</span>
            </div>
          ))}
        </div>
        {note && <div className="bss-hours__note">{note}</div>}
      </div>
      {showStrap && <LogoStrap />}
    </div>
  );
}
