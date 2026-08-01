import { ImageCanvas, PhoneCTA } from 'bli-image-studio';

/** The phone-first block on the gradient. */
export const Default = () => (
  <ImageCanvas format="square" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0' }}>
      <PhoneCTA />
    </div>
  </ImageCanvas>
);

/** Centered on cream. */
export const CenteredCream = () => (
  <ImageCanvas format="square" background="cream" scale={0.4} padding="snug">
    <div style={{ margin: 'auto' }}>
      <PhoneCTA align="center" label="Questions? Call or text" />
    </div>
  </ImageCanvas>
);
