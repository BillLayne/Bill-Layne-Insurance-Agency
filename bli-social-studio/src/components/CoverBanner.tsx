import { BrandLockup } from './BrandLockup';
import { ChipBadge } from './ChipBadge';

export interface CoverBannerProps {
  /** Letterspaced line under the lockup. Keep it under ~30 characters — longer taglines get ellipsized to protect the mobile-safe zone. */
  tagline?: string;
  phone?: string;
  website?: string;
  /** Optional gold badge above the phone, e.g. “SINCE 2005”. */
  badge?: string;
}

/**
 * The Facebook cover photo layout (use with `SocialCanvas format="cover"
 * padding="none"`). Everything lives inside the central mobile-safe zone —
 * phones crop ~180px off each side of the 1640×624 upload. Turn on the
 * canvas `safeGuides` while adjusting, off before export.
 */
export function CoverBanner({
  tagline = 'Auto · Home · Life — Elkin, NC',
  phone = '336-835-1993',
  website = 'BillLayneInsurance.com',
  badge = 'Independent since 2005',
}: CoverBannerProps) {
  return (
    <div className="bss-cover">
      <div className="bss-cover__left">
        <BrandLockup size="lg" />
        <span className="bss-cover__tagline">{tagline}</span>
      </div>
      <div className="bss-cover__right">
        {badge && (
          <ChipBadge variant="gold" icon="star">
            {badge}
          </ChipBadge>
        )}
        <span className="bss-cover__phone">{phone}</span>
        <span className="bss-cover__site">{website}</span>
      </div>
    </div>
  );
}
