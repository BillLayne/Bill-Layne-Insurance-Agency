import type { ReactNode } from 'react';
import { Kicker } from './Kicker';
import { Headline } from './Headline';
import { LogoStrap } from './LogoStrap';

export interface CollagePanel {
  /** Photo URL for the panel. Missing src renders a soft branded placeholder. */
  photoSrc?: string;
  /** Short caption overlaid on the panel. */
  caption?: ReactNode;
  /** Optional corner tag, e.g. "Before" / "After". */
  tag?: string;
}

export interface CollageBoardProps {
  kicker?: string;
  /** Optional title bar above the grid. */
  headline?: ReactNode;
  /** 2–6 panels. Layout is chosen from the count + `layout`. */
  panels: CollagePanel[];
  /** `grid` (default), `feature` (one big + supporting), or `strip` (row). */
  layout?: 'grid' | 'feature' | 'strip';
  showStrap?: boolean;
  finePrint?: string;
}

/**
 * COLLAGE mode — intentional multi-panel storytelling (before/after, a day in
 * the agency, community moments, a coverage story in 3 beats). Not a random
 * grid: each panel carries a caption and the set reads as one narrative.
 */
export function CollageBoard({
  kicker,
  headline,
  panels,
  layout = 'grid',
  showStrap = true,
  finePrint,
}: CollageBoardProps) {
  return (
    <div className="bis-t bis-collage">
      {(kicker || headline) && (
        <div className="bis-collage__head">
          {kicker && <Kicker>{kicker}</Kicker>}
          {headline && <Headline size="sm">{headline}</Headline>}
        </div>
      )}
      <div className={`bis-collage__grid bis-collage__grid--${layout} bis-collage__grid--n${panels.length}`}>
        {panels.map((p, i) => (
          <figure className="bis-collage__panel" key={i}>
            {p.photoSrc ? (
              <div
                className="bis-collage__photo"
                style={{ backgroundImage: `url(${p.photoSrc})` }}
              />
            ) : (
              <div className="bis-collage__photo bis-collage__photo--ph" />
            )}
            {p.tag && <span className="bis-collage__tag">{p.tag}</span>}
            {p.caption && <figcaption className="bis-collage__caption">{p.caption}</figcaption>}
          </figure>
        ))}
      </div>
      {showStrap && <LogoStrap finePrint={finePrint} />}
    </div>
  );
}
