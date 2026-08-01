import { ImageCanvas, LogoStrap } from 'bli-image-studio';

/** The standard footer bar, pinned to the canvas bottom. */
export const StandardStrap = () => (
  <ImageCanvas format="square" background="gradient" scale={0.4}>
    <LogoStrap finePrint="Coverage and pricing vary. Quote subject to underwriting. NC License #6571216" />
  </ImageCanvas>
);

/** With a street address, on cream. */
export const WithAddress = () => (
  <ImageCanvas format="square" background="cream" scale={0.4}>
    <LogoStrap address="1283 N Bridge St, Elkin, NC 28621" />
  </ImageCanvas>
);
