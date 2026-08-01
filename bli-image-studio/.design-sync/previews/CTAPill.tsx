import { ImageCanvas, CTAPill } from 'bli-image-studio';

/** Variants on the gradient. */
export const Variants = () => (
  <ImageCanvas format="square" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '2em', alignItems: 'flex-start' }}>
      <CTAPill label="Request a quote" icon="arrow" variant="gold" size="lg" />
      <CTAPill label="Call or text 336-835-1993" icon="phone" variant="white" />
      <CTAPill label="Compare options" variant="outline" />
    </div>
  </ImageCanvas>
);

/** Navy CTA for the gold canvas. */
export const OnGold = () => (
  <ImageCanvas format="square" background="gold" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', alignItems: 'flex-start' }}>
      <CTAPill label="Let's review your options" icon="arrow" variant="navy" size="lg" />
    </div>
  </ImageCanvas>
);
