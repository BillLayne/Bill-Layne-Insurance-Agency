import { ImageCanvas, QRBlock } from 'bli-image-studio';

/** The REAL agency QR (default) — scans to the agency contact card. */
export const RealQR = () => (
  <ImageCanvas format="square" scale={0.4} padding="snug">
    <div style={{ margin: 'auto' }}>
      <QRBlock size="md" caption="Scan to request a quote" />
    </div>
  </ImageCanvas>
);

/** Forced placeholder (for a layout mockup before the code is final). */
export const Placeholder = () => (
  <ImageCanvas format="square" background="white" scale={0.4} padding="snug">
    <div style={{ margin: 'auto' }}>
      <QRBlock size="md" placeholder />
    </div>
  </ImageCanvas>
);
