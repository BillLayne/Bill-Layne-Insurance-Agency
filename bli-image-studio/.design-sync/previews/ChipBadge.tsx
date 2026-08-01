import { ImageCanvas, ChipBadge } from 'bli-image-studio';

/** Trust chips on the gradient. */
export const TrustChips = () => (
  <ImageCanvas format="square" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexWrap: 'wrap', gap: '1.2em', alignItems: 'flex-start' }}>
      <ChipBadge label="Independent Agency" icon="shield" tone="gold" />
      <ChipBadge label="Elkin, NC" icon="pin" tone="teal" />
      <ChipBadge label="Since 2005" tone="soft" />
    </div>
  </ImageCanvas>
);

/** On cream. */
export const OnCream = () => (
  <ImageCanvas format="square" background="cream" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexWrap: 'wrap', gap: '1.2em', alignItems: 'flex-start' }}>
      <ChipBadge label="Auto" icon="car" tone="teal" />
      <ChipBadge label="Home" icon="home" tone="teal" />
    </div>
  </ImageCanvas>
);
