import type { ReactNode } from 'react';
import { CTAPill } from './CTAPill';
import { Headline } from './Headline';
import { Kicker } from './Kicker';
import { LogoStrap } from './LogoStrap';

export interface TipsListPostProps {
  kicker?: string;
  /** List title, e.g. “Before the first frost”. */
  title: ReactNode;
  /** 3–5 short tips. Use `<strong>` inside a tip for the key phrase. */
  tips: ReactNode[];
  /** Small note under the list (source, caveat). */
  footnote?: string;
  ctaLabel?: string;
  showStrap?: boolean;
  finePrint?: string;
}

/**
 * Numbered quick-tips post — the classic saveable format (saves and shares
 * are the 2026 currency). Keep each tip under ~12 words; 3–5 tips max so the
 * type stays big.
 */
export function TipsListPost({
  kicker = 'Quick tips',
  title,
  tips,
  footnote,
  ctaLabel,
  showStrap = true,
  finePrint,
}: TipsListPostProps) {
  return (
    <div className="bss-t bss-tips">
      <div className="bss-t__main">
        {kicker && <Kicker>{kicker}</Kicker>}
        <div className="bss-tips__title">
          <Headline size="md">{title}</Headline>
        </div>
        <div className="bss-tips__list">
          {tips.map((tip, i) => (
            <div className="bss-tips__row" key={i}>
              <span className="bss-tips__num">{i + 1}</span>
              <span className="bss-tips__text">{tip}</span>
            </div>
          ))}
        </div>
        {footnote && <div className="bss-tips__footnote">{footnote}</div>}
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
