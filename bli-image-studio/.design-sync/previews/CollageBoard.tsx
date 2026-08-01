import { ImageCanvas, CollageBoard } from 'bli-image-studio';

/** Before/after story — two panels. */
export const BeforeAfter = () => (
  <ImageCanvas format="square" background="navy" scale={0.4} padding="snug">
    <CollageBoard
      kicker="Claim story"
      headline="Storm damage, handled"
      layout="grid"
      panels={[
        { tag: 'Before', caption: 'Hail damage to the roof' },
        { tag: 'After', caption: 'Repaired — claim paid' },
      ]}
    />
  </ImageCanvas>
);

/** Feature layout — one big panel + supporting. */
export const AgencyDay = () => (
  <ImageCanvas format="feed45" background="cream" scale={0.32} padding="snug">
    <CollageBoard
      kicker="Around the office"
      headline="A day at Bill Layne Insurance"
      layout="feature"
      panels={[
        { caption: 'In the community' },
        { caption: 'Real people' },
        { caption: 'Elkin, NC' },
      ]}
    />
  </ImageCanvas>
);
