import { BrandLockup, SocialCanvas } from 'bli-social-studio';

/** sm corner mark, md default, lg cover size on the hero gradient. */
export const SizesOnGradient = () => (
  <SocialCanvas format="square" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '4em', alignItems: 'flex-start' }}>
      <BrandLockup size="sm" />
      <BrandLockup size="md" />
      <BrandLockup size="lg" />
    </div>
  </SocialCanvas>
);

/** Centered lg lockup with the location line — the GBP / cover treatment. */
export const CenteredWithLocation = () => (
  <SocialCanvas format="square" background="navy" scale={0.4} padding="snug">
    <div style={{ margin: 'auto' }}>
      <BrandLockup size="lg" center showLocation />
    </div>
  </SocialCanvas>
);

/** Navy-ink version on the light cream canvas. */
export const OnCream = () => (
  <SocialCanvas format="square" background="cream" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0' }}>
      <BrandLockup size="md" showLocation />
    </div>
  </SocialCanvas>
);
