import { PhoneCTA, SocialCanvas } from 'bli-social-studio';

/** md and lg lockups with the gold icon circle on the hero gradient. */
export const SizesOnGradient = () => (
  <SocialCanvas format="square" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '3em', alignItems: 'flex-start' }}>
      <PhoneCTA />
      <PhoneCTA size="lg" />
    </div>
  </SocialCanvas>
);

/** Navy-ink version on the light cream canvas. */
export const OnCream = () => (
  <SocialCanvas format="square" background="cream" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0' }}>
      <PhoneCTA size="lg" />
    </div>
  </SocialCanvas>
);

/** Custom label, icon circle off — the quieter inline treatment. */
export const CustomLabelNoIcon = () => (
  <SocialCanvas format="square" background="teal" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0' }}>
      <PhoneCTA label="Questions? Call or text" showIcon={false} />
    </div>
  </SocialCanvas>
);
