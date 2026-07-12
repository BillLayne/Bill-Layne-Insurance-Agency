import { HeroPromoPost, Highlight, SocialCanvas } from 'bli-social-studio';

/** The canonical offer post on the premium gradient. */
export const FreePolicyReview = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <HeroPromoPost
      kicker="Free this month"
      headline={
        <>
          We’ll read your policy <Highlight>so you don’t have to.</Highlight>
        </>
      }
      subline="Bring any auto or home policy — we’ll flag the gaps and the overcharges in plain English."
      ctaLabel="Call or text 336-835-1993"
      ctaIcon="phone"
      finePrint="Coverage subject to policy terms and underwriting. NC License #6571216"
    />
  </SocialCanvas>
);

/** Life-event trigger post on navy with a secondary action. */
export const TeenDriverMoment = () => (
  <SocialCanvas format="portrait" background="navy" scale={0.32}>
    <HeroPromoPost
      kicker="New driver in the house?"
      headline={
        <>
          Adding a teen <Highlight look="underline">without the sticker shock.</Highlight>
        </>
      }
      subline="Good-student and driver-training discounts can soften it — many families are surprised how much."
      ctaLabel="Message us"
      ctaIcon="message"
      secondaryCtaLabel="Ask about discounts"
      finePrint="Savings vary by policy and driving record. NC License #6571216"
    />
  </SocialCanvas>
);

/** Centered announcement on the gold canvas — navy CTA for contrast. */
export const GoldAnnouncement = () => (
  <SocialCanvas format="portrait" background="gold" scale={0.32}>
    <HeroPromoPost
      kicker="Elkin · Dobson · Surry County"
      headline="Independent means we work for you."
      headlineSize="md"
      subline="One office, a dozen carriers, and a real person who answers the phone."
      ctaLabel="Get a free quote review"
      ctaVariant="navy"
      align="center"
    />
  </SocialCanvas>
);
