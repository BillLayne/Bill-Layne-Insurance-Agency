import { SocialCanvas, TipsListPost } from 'bli-social-studio';

/** Canonical 4-tip saveable: NC storm-season prep on the premium gradient. */
export const StormSeasonPrep = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <TipsListPost
      kicker="Hurricane season · June–Nov"
      title="Before the next storm hits"
      tips={[
        <>Film a phone walkthrough — <strong>that video is your inventory</strong>.</>,
        <>Clear gutters and trim limbs near the roof.</>,
        <>Know your <strong>wind &amp; hail deductible</strong> — it’s separate.</>,
        <>Save our number: 336-835-1993.</>,
      ]}
      footnote="NC hurricane season runs June 1 – November 30."
    />
  </SocialCanvas>
);

/** 3-tip teen-driver variant on the cream canvas with a CTA pill. */
export const TeenDriverSavings = () => (
  <SocialCanvas format="portrait" background="cream" scale={0.32}>
    <TipsListPost
      kicker="New driver at home?"
      title="Three ways to soften a teen premium"
      tips={[
        <>Ask about the <strong>good-student discount</strong> — a B average counts.</>,
        <>A driver-training course could lower the rate.</>,
        <>Put them on the <strong>older sedan</strong>, not the new SUV.</>,
      ]}
      ctaLabel="Ask us about teen discounts"
      finePrint="Savings vary by policy and driving record. NC License #6571216"
    />
  </SocialCanvas>
);
