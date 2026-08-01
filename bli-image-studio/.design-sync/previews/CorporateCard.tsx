import { ImageCanvas, CorporateCard } from 'bli-image-studio';

/** Understated "about the agency" on cream. */
export const AboutTheAgency = () => (
  <ImageCanvas format="feed45" background="cream" scale={0.32}>
    <CorporateCard
      headline="Insurance, the way it should be."
      body="We're an independent agency in Elkin — which means we work for you, not a single carrier. We shop a dozen companies, explain the fine print in plain English, and answer the phone when you call."
      attribution="Bill Layne · Agency Owner"
    />
  </ImageCanvas>
);

/** With a portrait panel, on white. */
export const WithPortrait = () => (
  <ImageCanvas format="header" background="white" scale={0.34}>
    <CorporateCard
      kicker="Independent · Since 2005"
      headline="A neighbor who happens to know insurance."
      body="Two decades helping NC foothills families protect what matters."
      photoSrc=""
    />
  </ImageCanvas>
);
