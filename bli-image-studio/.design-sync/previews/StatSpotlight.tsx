import { ImageCanvas, StatSpotlight, Highlight } from 'bli-image-studio';

/** One big number, centered on the gradient. */
export const YearsLocal = () => (
  <ImageCanvas format="square" background="gradient" scale={0.4}>
    <StatSpotlight
      kicker="Local & independent"
      value="20+"
      caption="years serving the NC foothills"
      body={<>One office in Elkin, a dozen carriers, and a real person who <Highlight>answers the phone.</Highlight></>}
    />
  </ImageCanvas>
);

/** Third-party stat with a required source line. */
export const DidYouKnow = () => (
  <ImageCanvas format="feed45" background="teal" scale={0.32}>
    <StatSpotlight
      kicker="Did you know?"
      value="2 of 3"
      caption="homes are underinsured for a full rebuild"
      body="Rebuild costs have climbed. A quick review makes sure your limit kept up."
      source="Source: industry estimates, 2025"
    />
  </ImageCanvas>
);
