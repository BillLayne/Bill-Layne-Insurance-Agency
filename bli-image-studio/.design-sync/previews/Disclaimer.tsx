import { ImageCanvas, Disclaimer } from 'bli-image-studio';

/** The standard compliance line (default) on the gradient. */
export const Standard = () => (
  <ImageCanvas format="square" scale={0.4}>
    <div style={{ margin: 'auto 0' }}>
      <Disclaimer />
    </div>
  </ImageCanvas>
);

/** A custom compliant line, centered on cream. */
export const CustomCentered = () => (
  <ImageCanvas format="square" background="cream" scale={0.4}>
    <div style={{ margin: 'auto 0' }}>
      <Disclaimer align="center">Coverage and pricing vary. Let's review your options. NC License #6571216</Disclaimer>
    </div>
  </ImageCanvas>
);
