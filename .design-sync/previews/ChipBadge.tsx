import { ChipBadge, SocialCanvas } from 'bli-social-studio';

/** Outline, gold, teal, and white variants on the hero gradient. */
export const VariantsOnGradient = () => (
  <SocialCanvas format="square" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexWrap: 'wrap', gap: '1.6em', alignItems: 'flex-start' }}>
      <ChipBadge>Since 2005</ChipBadge>
      <ChipBadge variant="gold">Free to ask</ChipBadge>
      <ChipBadge variant="teal">Storm season</ChipBadge>
      <ChipBadge variant="white">Elkin, NC</ChipBadge>
    </div>
  </SocialCanvas>
);

/** Navy-ink chips (plus the navy variant) on the light cream canvas. */
export const LightCanvasVariants = () => (
  <SocialCanvas format="square" background="cream" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexWrap: 'wrap', gap: '1.6em', alignItems: 'flex-start' }}>
      <ChipBadge>Since 2005</ChipBadge>
      <ChipBadge variant="navy">Elkin, NC</ChipBadge>
      <ChipBadge variant="teal">Auto + home</ChipBadge>
      <ChipBadge variant="gold">5.0 on Google</ChipBadge>
    </div>
  </SocialCanvas>
);

/** Icon set — pin, star, check, clock — as real context tags. */
export const IconTags = () => (
  <SocialCanvas format="square" background="navy" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '2em', alignItems: 'flex-start' }}>
      <ChipBadge icon="pin" variant="white">Elkin, NC</ChipBadge>
      <ChipBadge icon="star" variant="gold">5.0 on Google</ChipBadge>
      <ChipBadge icon="check" variant="teal">Independent since 2005</ChipBadge>
      <ChipBadge icon="clock">Mon–Fri 9–5</ChipBadge>
    </div>
  </SocialCanvas>
);
