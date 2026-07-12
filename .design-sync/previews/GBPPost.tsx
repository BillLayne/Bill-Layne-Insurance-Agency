import { GBPPost, SocialCanvas } from 'bli-social-studio';

/** Default-ish Google Business Profile post — free quote review on the gradient. */
export const FreeQuoteReviewGBP = () => (
  <SocialCanvas format="gbp" padding="none" scale={0.36}>
    <GBPPost
      headline="Is your coverage keeping up with your life?"
      sub="A free 15-minute policy review — no pressure, plain English."
    />
  </SocialCanvas>
);

/** Custom headline + sub on teal — hurricane-season coverage check. */
export const HurricaneSeasonGBP = () => (
  <SocialCanvas format="gbp" padding="none" background="teal" scale={0.36}>
    <GBPPost
      badge="Surry County"
      headline="Hurricane season starts June 1."
      sub="Now is the moment to check your wind & hail deductible."
      ctaLabel="Book a coverage check"
    />
  </SocialCanvas>
);
