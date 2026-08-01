import { ImageCanvas, StatNumber } from 'bli-image-studio';

/** Gold-fill number on the gradient. */
export const OnGradient = () => (
  <ImageCanvas format="square" scale={0.4}>
    <div style={{ margin: 'auto 0' }}>
      <StatNumber value="20+" caption="years serving the NC foothills" size="lg" />
    </div>
  </ImageCanvas>
);

/** Remaps to a solid dark fill on light surfaces so it never disappears. */
export const OnWhite = () => (
  <ImageCanvas format="square" background="white" scale={0.4}>
    <div style={{ margin: 'auto 0' }}>
      <StatNumber value="A+" caption="rated carriers we represent" size="lg" />
    </div>
  </ImageCanvas>
);
