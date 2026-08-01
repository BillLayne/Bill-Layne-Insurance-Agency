import { ImageCanvas, LogoPlaceholder } from 'bli-image-studio';

/** Clean "place the real logo" boxes — never an invented mark. */
export const Ratios = () => (
  <ImageCanvas format="square" background="cream" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', gap: '1.4em', alignItems: 'center', flexWrap: 'wrap' }}>
      <LogoPlaceholder label="AGENCY LOGO" ratio="wide" />
      <LogoPlaceholder label="LOGO" ratio="square" />
    </div>
  </ImageCanvas>
);
