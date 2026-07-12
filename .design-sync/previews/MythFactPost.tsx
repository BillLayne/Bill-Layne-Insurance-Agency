import { MythFactPost, SocialCanvas } from 'bli-social-studio';

/** The canonical red-car debunk — struck myth, gold fact card, CTA pill. */
export const RedCarMyth = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <MythFactPost
      myth="Red cars cost more to insure."
      fact="Color never touches your rate. Year, model, trim, and driving record do."
      ctaLabel="Ask what actually moves your rate"
    />
  </SocialCanvas>
);

/** Flood-coverage debunk on the cream canvas with compliance fine print. */
export const FloodCoverageMyth = () => (
  <SocialCanvas format="portrait" background="cream" scale={0.32}>
    <MythFactPost
      kicker="Home truths"
      myth="My homeowners policy covers flood damage."
      fact={
        <>
          Flood is a <strong>separate policy</strong> — and most have a 30-day
          wait. Ask before the storm forms.
        </>
      }
      finePrint="Coverage subject to policy terms and underwriting. NC License #6571216"
    />
  </SocialCanvas>
);
