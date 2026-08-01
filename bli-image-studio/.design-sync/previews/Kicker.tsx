import { ImageCanvas, Kicker } from 'bli-image-studio';

/** Gold (default) + teal accent bars on the gradient. */
export const Accents = () => (
  <ImageCanvas format="square" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '3em', alignItems: 'flex-start' }}>
      <Kicker>Storm season</Kicker>
      <Kicker accent="teal">Around Elkin</Kicker>
    </div>
  </ImageCanvas>
);

/** Navy-ink kicker on cream. */
export const OnCream = () => (
  <ImageCanvas format="square" background="cream" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', alignItems: 'flex-start' }}>
      <Kicker>NC auto tip</Kicker>
    </div>
  </ImageCanvas>
);
