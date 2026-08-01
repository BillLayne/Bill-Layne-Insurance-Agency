import { ImageCanvas, YouTubeThumbnail, Highlight } from 'bli-image-studio';

/** Punch words + subject photo — the high-CTR default. */
export const FullCoverageExplained = () => (
  <ImageCanvas format="youtube" background="navy" scale={0.42} padding="snug">
    <YouTubeThumbnail
      kicker="AUTO INSURANCE"
      kickerIcon="car"
      headline={<>"Full coverage" <Highlight>isn't real.</Highlight></>}
      subline="Here's what you actually have"
      stamp="EXPLAINED"
    />
  </ImageCanvas>
);

/** Text-only thumbnail on the gradient. */
export const TextOnly = () => (
  <ImageCanvas format="youtube" background="gradient" scale={0.42} padding="snug">
    <YouTubeThumbnail
      kicker="HOME INSURANCE"
      kickerIcon="home"
      headline={<>Are you <Highlight>underinsured?</Highlight></>}
      showPhoto={false}
      stamp="2026"
    />
  </ImageCanvas>
);
