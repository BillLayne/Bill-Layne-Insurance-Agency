import type { ReactNode } from 'react';
import { CTAPill } from './CTAPill';
import { Headline } from './Headline';
import { IconCheck, IconX } from './icons';
import { Kicker } from './Kicker';
import { LogoStrap } from './LogoStrap';

export interface MythFactPostProps {
  kicker?: string;
  /** Post title. Default “Myth vs. Fact”. */
  title?: ReactNode;
  /** The misconception, stated the way people actually say it. */
  myth: ReactNode;
  /** The correction, in plain English. Lead with the useful truth. */
  fact: ReactNode;
  ctaLabel?: string;
  showStrap?: boolean;
  finePrint?: string;
}

/**
 * The myth-vs-fact debunk post — one of the highest-save educational formats.
 * The myth renders struck-through; the fact gets the gold card. One myth per
 * post; save the rest for a carousel.
 */
export function MythFactPost({
  kicker = 'Let’s clear it up',
  title = 'Myth vs. Fact',
  myth,
  fact,
  ctaLabel,
  showStrap = true,
  finePrint,
}: MythFactPostProps) {
  return (
    <div className="bss-t bss-mf">
      <div className="bss-t__main">
        {kicker && <Kicker>{kicker}</Kicker>}
        <div className="bss-tips__title">
          <Headline size="md">{title}</Headline>
        </div>
        <div className="bss-mf__cards">
          <div className="bss-mf__card">
            <div className="bss-mf__tag">
              <IconX /> Myth
            </div>
            <div className="bss-mf__myth">{myth}</div>
          </div>
          <div className="bss-mf__card bss-mf__card--fact">
            <div className="bss-mf__tag">
              <IconCheck /> The fact
            </div>
            <div className="bss-mf__fact">{fact}</div>
          </div>
        </div>
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
