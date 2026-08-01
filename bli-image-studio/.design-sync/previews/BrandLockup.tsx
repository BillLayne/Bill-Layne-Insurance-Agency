import { ImageCanvas, BrandLockup } from 'bli-image-studio';

/** The REAL agency badge (default) — reads on the gradient. */
export const RealBadge = () => (
  <ImageCanvas format="square" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0' }}>
      <BrandLockup />
    </div>
  </ImageCanvas>
);

/** The badge also reads on a light surface. */
export const OnCream = () => (
  <ImageCanvas format="square" background="cream" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0' }}>
      <BrandLockup />
    </div>
  </ImageCanvas>
);

/** Typographic lockup fallback — pass logoSrc={null}. */
export const TextLockup = () => (
  <ImageCanvas format="square" background="navy" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0' }}>
      <BrandLockup logoSrc={null} tagline="Simple. Affordable. Reliable." />
    </div>
  </ImageCanvas>
);
