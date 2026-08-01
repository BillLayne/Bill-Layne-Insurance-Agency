import type { ReactNode } from 'react';
import { Kicker } from './Kicker';
import { Headline } from './Headline';
import { LogoStrap } from './LogoStrap';
import { IconCheck } from './icons';

export interface ChecklistSheetProps {
  kicker?: string;
  /** Title, e.g. "Before storm season: <Highlight>home checklist</Highlight>". */
  headline: ReactNode;
  headlineSize?: 'lg' | 'md';
  /** 4–7 checklist items in plain English. */
  items: ReactNode[];
  /** Optional closing line / CTA under the list. */
  footnote?: ReactNode;
  showStrap?: boolean;
  finePrint?: string;
}

/**
 * EDUCATION mode — a branded checklist sheet: a title over 4–7 checkable items.
 * The save-and-share workhorse ("moving checklist", "storm-prep checklist",
 * "what to photograph after a claim"). Reads well on feed, story, and print.
 */
export function ChecklistSheet({
  kicker,
  headline,
  headlineSize = 'md',
  items,
  footnote,
  showStrap = true,
  finePrint,
}: ChecklistSheetProps) {
  return (
    <div className="bis-t bis-checklist">
      <div className="bis-checklist__head">
        {kicker && <Kicker>{kicker}</Kicker>}
        <Headline size={headlineSize}>{headline}</Headline>
      </div>
      <ul className="bis-checklist__list">
        {items.map((it, i) => (
          <li className="bis-checklist__item" key={i}>
            <span className="bis-checklist__box" aria-hidden="true">
              <IconCheck />
            </span>
            <span className="bis-checklist__text">{it}</span>
          </li>
        ))}
      </ul>
      {footnote && <div className="bis-checklist__foot">{footnote}</div>}
      {showStrap && <LogoStrap finePrint={finePrint} />}
    </div>
  );
}
