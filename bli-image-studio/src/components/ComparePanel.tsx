import type { ReactNode } from 'react';
import { Kicker } from './Kicker';
import { Headline } from './Headline';
import { LogoStrap } from './LogoStrap';
import { IconCheck, IconX } from './icons';

export interface ComparePanelProps {
  kicker?: string;
  /** Title, e.g. "<Highlight>Myth vs. fact</Highlight>: full coverage". */
  headline: ReactNode;
  /** Left column heading. Default "Myth". */
  leftLabel?: string;
  /** Right column heading. Default "Fact". */
  rightLabel?: string;
  /** Left column items (the "no" / myth side). */
  leftItems: ReactNode[];
  /** Right column items (the "yes" / fact side). */
  rightItems: ReactNode[];
  /** Column intent controls the check/x marks + colors. Default `mythFact`. */
  intent?: 'mythFact' | 'doDont' | 'neutral';
  showStrap?: boolean;
  finePrint?: string;
}

/**
 * EDUCATION mode — a two-column comparison: myth vs. fact, do vs. don't, or a
 * neutral A/B. Each side lists short lines with a check or × marker. Never
 * names or implies a competitor — compare ideas and coverage, not other
 * agencies.
 */
export function ComparePanel({
  kicker,
  headline,
  leftLabel = 'Myth',
  rightLabel = 'Fact',
  leftItems,
  rightItems,
  intent = 'mythFact',
  showStrap = true,
  finePrint,
}: ComparePanelProps) {
  const leftNeg = intent !== 'neutral';
  return (
    <div className="bis-t bis-compare">
      <div className="bis-compare__head">
        {kicker && <Kicker>{kicker}</Kicker>}
        <Headline size="md">{headline}</Headline>
      </div>
      <div className="bis-compare__cols">
        <div className={`bis-compare__col ${leftNeg ? 'bis-compare__col--neg' : ''}`}>
          <span className="bis-compare__col-label">{leftLabel}</span>
          <ul className="bis-compare__items">
            {leftItems.map((it, i) => (
              <li className="bis-compare__row" key={i}>
                <span className="bis-compare__mark" aria-hidden="true">
                  {leftNeg ? <IconX /> : <IconCheck />}
                </span>
                <span className="bis-compare__text">{it}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bis-compare__col bis-compare__col--pos">
          <span className="bis-compare__col-label">{rightLabel}</span>
          <ul className="bis-compare__items">
            {rightItems.map((it, i) => (
              <li className="bis-compare__row" key={i}>
                <span className="bis-compare__mark" aria-hidden="true">
                  <IconCheck />
                </span>
                <span className="bis-compare__text">{it}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {showStrap && <LogoStrap finePrint={finePrint} />}
    </div>
  );
}
