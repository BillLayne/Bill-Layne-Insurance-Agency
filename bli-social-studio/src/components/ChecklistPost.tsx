import type { ReactNode } from 'react';
import { CTAPill } from './CTAPill';
import { Headline } from './Headline';
import { IconCheck } from './icons';
import { Kicker } from './Kicker';
import { LogoStrap } from './LogoStrap';

export interface ChecklistItem {
  text: ReactNode;
  /** Unchecked boxes render as an empty outline. Default true (checked). */
  checked?: boolean;
}

export interface ChecklistPostProps {
  kicker?: string;
  /** Checklist title, e.g. “Hurricane season, handled”. */
  title: ReactNode;
  /** 3–6 items. Strings are treated as checked items. */
  items: Array<string | ChecklistItem>;
  footnote?: string;
  ctaLabel?: string;
  showStrap?: boolean;
  finePrint?: string;
}

/**
 * The saveable checklist post — checklists are the single most-saved local
 * content format, and saves are algorithm gold in 2026. Season it to NC:
 * hurricane prep, first frost, spring hail.
 */
export function ChecklistPost({
  kicker = 'Save this',
  title,
  items,
  footnote,
  ctaLabel,
  showStrap = true,
  finePrint,
}: ChecklistPostProps) {
  const normalized: ChecklistItem[] = items.map((it) =>
    typeof it === 'string' ? { text: it, checked: true } : { checked: true, ...it },
  );
  return (
    <div className="bss-t bss-check">
      <div className="bss-t__main">
        {kicker && <Kicker>{kicker}</Kicker>}
        <div className="bss-tips__title">
          <Headline size="md">{title}</Headline>
        </div>
        <div className="bss-check__list">
          {normalized.map((item, i) => (
            <div className="bss-check__row" key={i}>
              <span className={`bss-check__box${item.checked ? '' : ' bss-check__box--empty'}`}>
                {item.checked && <IconCheck />}
              </span>
              <span className="bss-check__text">{item.text}</span>
            </div>
          ))}
        </div>
        {footnote && <div className="bss-check__footnote">{footnote}</div>}
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
