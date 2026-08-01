import { ImageCanvas, Headline, Kicker, Highlight } from 'bli-image-studio';

/** The premium hero gradient — the default hook surface. */
export const HeroGradient = () => (
  <ImageCanvas format="feed45" scale={0.32}>
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '2em' }}>
      <Kicker>Independent · Elkin, NC</Kicker>
      <Headline size="lg">Coverage that <Highlight>fits your life.</Highlight></Headline>
    </div>
  </ImageCanvas>
);

/** Light cream surface — navy ink, calmer pieces. */
export const OnCream = () => (
  <ImageCanvas format="feed45" background="cream" scale={0.32}>
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '2em' }}>
      <Kicker accent="teal">Since 2005</Kicker>
      <Headline size="lg">A real person answers the phone.</Headline>
    </div>
  </ImageCanvas>
);

/** 16:9 for YouTube; the same canvas drives every format. */
export const YouTubeFormat = () => (
  <ImageCanvas format="youtube" background="navy" scale={0.42}>
    <div style={{ margin: 'auto 0' }}>
      <Headline size="xl">Full coverage, <Highlight>explained.</Highlight></Headline>
    </div>
  </ImageCanvas>
);
