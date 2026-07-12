import { SocialCanvas, StarRating } from 'bli-social-studio';

/** The trust row as it appears on testimonial posts. */
export const GoogleFiveStar = () => (
  <SocialCanvas format="square" background="navy" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0' }}>
      <StarRating size="lg" label="5.0 on Google" />
    </div>
  </SocialCanvas>
);

/** All three sizes on the light canvas. */
export const Sizes = () => (
  <SocialCanvas format="square" background="cream" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '2.5em' }}>
      <StarRating size="sm" label="sm" />
      <StarRating size="md" label="md" />
      <StarRating size="lg" label="lg" />
    </div>
  </SocialCanvas>
);

/** Partial count renders the last star as a faint outline. */
export const FourOfFive = () => (
  <SocialCanvas format="square" background="cream" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0' }}>
      <StarRating count={4} size="lg" label="4.0" />
    </div>
  </SocialCanvas>
);
