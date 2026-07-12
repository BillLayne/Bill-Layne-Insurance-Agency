import { Headline, Highlight, SocialCanvas } from 'bli-social-studio';

/** The default marker swipe on the one phrase that matters. */
export const MarkerInHeadline = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <div style={{ margin: 'auto 0' }}>
      <Headline size="lg">
        Your teen driver <Highlight>isn’t automatic.</Highlight>
      </Headline>
    </div>
  </SocialCanvas>
);

/** Hand-drawn squiggle underline and circle on the light canvas. */
export const UnderlineAndCircleOnCream = () => (
  <SocialCanvas format="portrait" background="cream" scale={0.32}>
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '3em' }}>
      <Headline size="lg">
        What renters insurance <Highlight look="underline">actually covers</Highlight>
      </Headline>
      <Headline size="lg">
        Bundling auto + home <Highlight look="circle">could save</Highlight> real money
      </Headline>
    </div>
  </SocialCanvas>
);

/** Teal color variant for water/flood topics on navy. */
export const TealOnNavy = () => (
  <SocialCanvas format="portrait" background="navy" scale={0.32}>
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '3em' }}>
      <Headline size="lg">
        Flood damage is <Highlight color="teal">a separate policy.</Highlight>
      </Headline>
      <Headline size="md">
        Ask us <Highlight look="underline" color="teal">before the storm.</Highlight>
      </Headline>
    </div>
  </SocialCanvas>
);
