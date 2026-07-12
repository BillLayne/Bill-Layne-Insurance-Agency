import { CommunityPost, SocialCanvas } from 'bli-social-studio';

/** Full event card — farmers market with details and a soft CTA, on cream. */
export const ElkinFarmersMarket = () => (
  <SocialCanvas format="portrait" background="cream" scale={0.32}>
    <CommunityPost
      title="Elkin Farmers Market"
      month="JUL"
      day="18"
      place="Downtown Elkin"
      time="9 AM – 12 PM"
      details="Peaches, tomatoes, and half the town on Main Street. Come say hey — we're neighbors first, insurance folks second."
      ctaLabel="See you there"
    />
  </SocialCanvas>
);

/** Minimal variant — date, place, time only, on navy. */
export const SurryCountyFairMinimal = () => (
  <SocialCanvas format="portrait" background="navy" scale={0.32}>
    <CommunityPost
      kicker="Around Surry County"
      title="Surry County Agricultural Fair"
      month="SEP"
      day="8"
      place="Fairgrounds, Dobson"
      time="Gates open 5 PM"
    />
  </SocialCanvas>
);

/** Yadkin Valley wine festival spotlight on the gradient. */
export const YadkinValleyWineFestival = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <CommunityPost
      kicker="Around the Yadkin Valley"
      title="Yadkin Valley Wine Festival"
      month="MAY"
      day="16"
      place="Elkin Municipal Park"
      time="11 AM – 6 PM"
      details="Local wineries, live music, and food trucks along the Yadkin. One of our favorite Saturdays of the year."
      ctaLabel="Tag a friend"
    />
  </SocialCanvas>
);
