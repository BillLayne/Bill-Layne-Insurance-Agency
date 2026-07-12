import { Headline, Kicker, SocialCanvas } from 'bli-social-studio';

/** Gold bar (default), dot, and bare accents on the hero gradient. */
export const AccentsOnGradient = () => (
  <SocialCanvas format="square" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '3em', alignItems: 'flex-start' }}>
      <Kicker>Storm season</Kicker>
      <Kicker accent="dot">Around Elkin</Kicker>
      <Kicker accent="none">Myth vs. fact</Kicker>
    </div>
  </SocialCanvas>
);

/** Navy-ink kickers on the light cream canvas. */
export const OnCream = () => (
  <SocialCanvas format="square" background="cream" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '3em', alignItems: 'flex-start' }}>
      <Kicker>NC auto tip</Kicker>
      <Kicker accent="dot">You asked</Kicker>
    </div>
  </SocialCanvas>
);

/** The real job: eyebrow line tagging the topic above a headline. */
export const AboveHeadline = () => (
  <SocialCanvas format="portrait" background="navy" scale={0.32}>
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '2em', alignItems: 'flex-start' }}>
      <Kicker>Storm season</Kicker>
      <Headline size="lg">Hail happens. Let’s talk comprehensive.</Headline>
    </div>
  </SocialCanvas>
);
