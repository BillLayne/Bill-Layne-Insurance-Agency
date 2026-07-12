import type { ReactNode } from 'react';
import { CTAPill } from './CTAPill';
import { Headline } from './Headline';
import { Kicker } from './Kicker';
import { LogoStrap } from './LogoStrap';

export interface PhotoPostProps {
  kicker?: string;
  headline: ReactNode;
  headlineSize?: 'xl' | 'lg' | 'md';
  sub?: ReactNode;
  ctaLabel?: string;
  /** `bottom` (default) anchors text over the photo’s lower third; `center` for statement posts. */
  position?: 'bottom' | 'center';
  showStrap?: boolean;
  finePrint?: string;
}

/**
 * Text over a REAL photo — pair with `SocialCanvas background="photo"
 * photoSrc={…}`. In 2026, genuine photos of real people and real places
 * out-perform stock and AI imagery on trust and reach; use Bill’s actual
 * photos, the office, and Elkin scenery. The canvas scrim keeps type legible.
 */
export function PhotoPost({
  kicker,
  headline,
  headlineSize = 'lg',
  sub,
  ctaLabel,
  position = 'bottom',
  showStrap = true,
  finePrint,
}: PhotoPostProps) {
  return (
    <div
      className={`bss-t bss-photopost${position === 'center' ? ' bss-photopost--center' : ''}`}
    >
      <div className="bss-photopost__content">
        {kicker && (
          <div className="bss-hero__kicker">
            <Kicker>{kicker}</Kicker>
          </div>
        )}
        <Headline size={headlineSize} align={position === 'center' ? 'center' : 'left'}>
          {headline}
        </Headline>
        {sub && <div className="bss-photopost__sub">{sub}</div>}
        {ctaLabel && (
          <div className="bss-photopost__cta">
            <CTAPill label={ctaLabel} />
          </div>
        )}
      </div>
      {showStrap && <LogoStrap finePrint={finePrint} />}
    </div>
  );
}
