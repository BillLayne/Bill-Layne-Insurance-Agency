import { ImageCanvas, Headline, Highlight } from 'bli-image-studio';

/** Marker, underline, and text accents. */
export const Styles = () => (
  <ImageCanvas format="feed45" background="gradient" scale={0.32} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '1.4em' }}>
      <Headline size="md">Covered <Highlight>the right way.</Highlight></Headline>
      <Headline size="md">Covered <Highlight style="underline">the right way.</Highlight></Headline>
      <Headline size="md">Covered <Highlight style="text" accent="teal">the right way.</Highlight></Headline>
    </div>
  </ImageCanvas>
);

/** On cream — prefer gold on light surfaces. */
export const OnCream = () => (
  <ImageCanvas format="square" background="cream" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0' }}>
      <Headline size="md">Ask about <Highlight>discounts.</Highlight></Headline>
    </div>
  </ImageCanvas>
);
