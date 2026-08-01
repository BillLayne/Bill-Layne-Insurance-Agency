import { ImageCanvas, CarrierLogoSlot } from 'bli-image-studio';

/** The agency's most-written carriers — real logos, each with the required line. */
export const MainCarriers = () => (
  <ImageCanvas format="square" background="white" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', gap: '2.5em', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
      <CarrierLogoSlot carrier="NC Grange" />
      <CarrierLogoSlot carrier="Foremost" />
      <CarrierLogoSlot carrier="Nationwide" />
    </div>
  </ImageCanvas>
);

/** More of the built-in set. */
export const MoreCarriers = () => (
  <ImageCanvas format="square" background="white" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', gap: '2.5em', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
      <CarrierLogoSlot carrier="Progressive" />
      <CarrierLogoSlot carrier="Travelers" />
      <CarrierLogoSlot carrier="National General" />
    </div>
  </ImageCanvas>
);

/** A carrier not in the built-in set falls back to a labeled placeholder. */
export const UnknownFallback = () => (
  <ImageCanvas format="square" background="white" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex' }}>
      <CarrierLogoSlot carrier="Erie" />
    </div>
  </ImageCanvas>
);
