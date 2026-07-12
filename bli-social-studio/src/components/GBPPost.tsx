import type { ReactNode } from 'react';
import { BrandLockup } from './BrandLockup';
import { ChipBadge } from './ChipBadge';
import { CTAPill } from './CTAPill';
import { Headline } from './Headline';

export interface GBPPostProps {
  /** Optional chip above the brand, e.g. “ELKIN, NC”. */
  badge?: string;
  headline: ReactNode;
  sub?: ReactNode;
  ctaLabel?: string;
  /** Contact line at the bottom of the safe zone. */
  phone?: string;
  website?: string;
  /** Show the brand lockup. Default true. */
  showBrand?: boolean;
}

/**
 * A Google Business Profile post graphic (use with `SocialCanvas
 * format="gbp" padding="none"`). GBP crops post images unpredictably —
 * often to a square — so this layout keeps every element inside the central
 * 900×900 zone. Pair with a 58-character post title and put the key info in
 * the first 250 characters of the GBP description.
 */
export function GBPPost({
  badge = 'Elkin, NC',
  headline,
  sub,
  ctaLabel = 'Get a free quote review',
  phone = '336-835-1993',
  website = 'BillLayneInsurance.com',
  showBrand = true,
}: GBPPostProps) {
  return (
    <div className="bss-gbp">
      {badge && (
        <ChipBadge variant="outline" icon="pin">
          {badge}
        </ChipBadge>
      )}
      {showBrand && <BrandLockup size="sm" center />}
      <Headline size="md" align="center">
        {headline}
      </Headline>
      {sub && <div className="bss-gbp__sub">{sub}</div>}
      {ctaLabel && <CTAPill label={ctaLabel} size="lg" />}
      <div className="bss-gbp__contact">
        {phone} · {website}
      </div>
    </div>
  );
}
