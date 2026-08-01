import { ImageCanvas, Headline, Highlight } from 'bli-image-studio';

/** Sizes on the gradient. */
export const Sizes = () => (
  <ImageCanvas format="feed45" scale={0.32} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '1.2em' }}>
      <Headline size="xl">Big hook</Headline>
      <Headline size="lg">We read your <Highlight>policy.</Highlight></Headline>
      <Headline size="md">A title over a list</Headline>
    </div>
  </ImageCanvas>
);

/** Sans variant on cream (utility/UW pieces). */
export const SansOnCream = () => (
  <ImageCanvas format="square" background="cream" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0' }}>
      <Headline size="md" font="sans">Documentation Sheet</Headline>
    </div>
  </ImageCanvas>
);
