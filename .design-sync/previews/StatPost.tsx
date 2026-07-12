import { SocialCanvas, StatPost } from 'bli-social-studio';

/** Short 4-char stat at full size, with kicker and cited source. */
export const DogBiteClaim = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <StatPost
      kicker="One number to know"
      stat="$64K"
      label="The average dog-bite liability claim. Your home policy is what steps in."
      source="Insurance Information Institute, 2024"
    />
  </SocialCanvas>
);

/** Longer stat string steps down a size — navy canvas, CTA + fine print. */
export const UninsuredDrivers = () => (
  <SocialCanvas format="portrait" background="navy" scale={0.32}>
    <StatPost
      kicker="Worth a minute"
      stat="1 in 8"
      label="U.S. drivers carry no insurance. Uninsured-motorist coverage is how you answer that."
      source="Insurance Research Council"
      ctaLabel="Check your UM limits with us"
      finePrint="Coverage subject to policy terms and underwriting. NC License #6571216"
    />
  </SocialCanvas>
);

/** Suffix rendered after the number — teal canvas (the gold stat needs a dark surface). */
export const NCPremiumAverage = () => (
  <SocialCanvas format="portrait" background="teal" scale={0.32}>
    <StatPost
      kicker="Some good news for once"
      stat="$1,470"
      suffix="/yr"
      label="What full coverage runs the average NC driver — among the lowest rates in the country."
      source="Bankrate auto rate survey, 2025"
    />
  </SocialCanvas>
);
