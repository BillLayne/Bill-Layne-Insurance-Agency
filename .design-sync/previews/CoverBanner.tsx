import { CoverBanner, SocialCanvas } from 'bli-social-studio';

/** The stock Facebook cover — rich defaults on the premium gradient. */
export const DefaultCoverOnGradient = () => (
  <SocialCanvas format="cover" padding="none" scale={0.28}>
    <CoverBanner />
  </SocialCanvas>
);

/**
 * Custom tagline on navy — leading with the towns we serve. Tagline kept
 * short on purpose: the letterspaced nowrap tagline is the width driver, and
 * long ones push the right column past the mobile-safe zone.
 */
export const SurryCountyCoverOnNavy = () => (
  <SocialCanvas format="cover" padding="none" background="navy" scale={0.28}>
    <CoverBanner
      tagline="Elkin · Dobson · Mount Airy"
      badge="Independent since 2005"
    />
  </SocialCanvas>
);
