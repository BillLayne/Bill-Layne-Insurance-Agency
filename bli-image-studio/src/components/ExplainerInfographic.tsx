import type { ReactNode } from 'react';
import { Kicker } from './Kicker';
import { Headline } from './Headline';
import { IconBadge } from './IconBadge';
import { LogoStrap } from './LogoStrap';
import { type IconName } from './icons';

export interface ExplainerPoint {
  /** Icon for the point (education pieces read best with a clear glyph). */
  icon?: IconName;
  /** Short bold label. */
  title: ReactNode;
  /** One plain-English sentence explaining it. */
  body?: ReactNode;
}

export interface ExplainerInfographicProps {
  kicker?: string;
  /** The explainer title, e.g. "What does <Highlight>liability</Highlight> actually cover?" */
  headline: ReactNode;
  headlineSize?: 'lg' | 'md';
  /** 3–5 points. Each = icon + title + one sentence. */
  points: ExplainerPoint[];
  /** `numbered` shows 1·2·3 step chips instead of icons. Default `icon`. */
  markers?: 'icon' | 'numbered';
  /** Optional closing line under the points. */
  footnote?: ReactNode;
  showStrap?: boolean;
  finePrint?: string;
}

/**
 * EDUCATION mode — a clean explainer infographic: a title over 3–5 icon-led
 * points, each a short plain-English sentence. The workhorse for "what does X
 * cover", "how a claim works", coverage 101, and myth-busting. Minimal text,
 * strong hierarchy, one idea per point.
 */
export function ExplainerInfographic({
  kicker,
  headline,
  headlineSize = 'md',
  points,
  markers = 'icon',
  footnote,
  showStrap = true,
  finePrint,
}: ExplainerInfographicProps) {
  return (
    <div className="bis-t bis-explain">
      <div className="bis-explain__head">
        {kicker && <Kicker>{kicker}</Kicker>}
        <Headline size={headlineSize}>{headline}</Headline>
      </div>
      <ul className="bis-explain__list">
        {points.map((p, i) => (
          <li className="bis-explain__item" key={i}>
            {markers === 'numbered' ? (
              <span className="bis-explain__num">{i + 1}</span>
            ) : (
              <IconBadge icon={p.icon ?? 'shield'} shape="tile" tone="gold" size="md" />
            )}
            <div className="bis-explain__copy">
              <span className="bis-explain__title">{p.title}</span>
              {p.body && <span className="bis-explain__body">{p.body}</span>}
            </div>
          </li>
        ))}
      </ul>
      {footnote && <div className="bis-explain__foot">{footnote}</div>}
      {showStrap && <LogoStrap finePrint={finePrint} />}
    </div>
  );
}
