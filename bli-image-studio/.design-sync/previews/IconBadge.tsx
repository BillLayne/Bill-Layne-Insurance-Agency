import { ImageCanvas, IconBadge } from 'bli-image-studio';

/** Shapes + tones for coverage types. */
export const CoverageIcons = () => (
  <ImageCanvas format="square" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', gap: '1.4em', alignItems: 'center' }}>
      <IconBadge icon="car" shape="tile" tone="gold" size="lg" />
      <IconBadge icon="home" shape="circle" tone="teal" size="lg" />
      <IconBadge icon="umbrella" shape="tile" tone="navy" size="lg" />
      <IconBadge icon="shield" shape="circle" tone="soft" size="lg" />
    </div>
  </ImageCanvas>
);
