import { Headline, Highlight, SocialCanvas } from 'bli-social-studio';

/** The 2026 hook: one oversized statement with a hand-marked phrase. */
export const HookOnGradient = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <div style={{ margin: 'auto 0' }}>
      <Headline size="xl">
        Your rate went up. <Highlight>Let’s find out why.</Highlight>
      </Headline>
    </div>
  </SocialCanvas>
);

/** All four sizes on the navy canvas. */
export const Sizes = () => (
  <SocialCanvas format="portrait" background="navy" scale={0.32}>
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '2em' }}>
      <Headline size="xl">Storm ready</Headline>
      <Headline size="lg">Storm ready in one weekend</Headline>
      <Headline size="md">Storm ready in one weekend, the NC way</Headline>
      <Headline size="sm">Storm ready in one weekend, the NC way — no jargon</Headline>
    </div>
  </SocialCanvas>
);

/** Hand-drawn underline + circle accents on the cream canvas. */
export const HandAccentsOnCream = () => (
  <SocialCanvas format="portrait" background="cream" scale={0.32}>
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '3em' }}>
      <Headline size="lg">
        Deductibles, <Highlight look="underline">decoded</Highlight>
      </Headline>
      <Headline size="lg">
        The <Highlight look="circle">$64K</Highlight> dog-bite claim
      </Headline>
    </div>
  </SocialCanvas>
);

/** Archivo sans variant for utility posts, centered. */
export const SansCentered = () => (
  <SocialCanvas format="portrait" background="teal" scale={0.32}>
    <div style={{ margin: 'auto 0' }}>
      <Headline size="lg" font="sans" align="center">
        Holiday hours inside
      </Headline>
    </div>
  </SocialCanvas>
);
