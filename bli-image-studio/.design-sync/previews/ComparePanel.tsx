import { ImageCanvas, ComparePanel, Highlight } from 'bli-image-studio';

/** Myth vs. fact — the classic education layout. */
export const FullCoverageMyth = () => (
  <ImageCanvas format="feed45" background="white" scale={0.32}>
    <ComparePanel
      kicker="Common mix-up"
      headline={<><Highlight>Myth vs. fact:</Highlight> "full coverage"</>}
      leftItems={[
        '"Full coverage means everything is covered."',
        'One box you check.',
        'Covers a rental car automatically.',
      ]}
      rightItems={[
        "It's just liability + comprehensive + collision.",
        'Each limit is a choice worth reviewing.',
        'Rental is a separate add-on — ask us.',
      ]}
    />
  </ImageCanvas>
);

/** Do vs. don't after an accident. */
export const AfterAnAccident = () => (
  <ImageCanvas format="feed45" background="gradient" scale={0.32}>
    <ComparePanel
      kicker="At the scene"
      headline="After an accident"
      leftLabel="Don't"
      rightLabel="Do"
      intent="doDont"
      leftItems={['Admit fault at the scene', 'Leave before documenting', 'Accept a fast cash offer']}
      rightItems={['Get safe and call us', 'Photograph everything', 'Let us handle the carrier']}
    />
  </ImageCanvas>
);
