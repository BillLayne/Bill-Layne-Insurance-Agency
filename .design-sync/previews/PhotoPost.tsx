import { PhotoPost, SocialCanvas } from 'bli-social-studio';

/**
 * Bottom-anchored text over the photo canvas. No photoSrc here on purpose —
 * the built-in brand-gradient fallback is the honest static render; in real
 * use, drop Bill's office or Elkin street photo into `photoSrc`.
 */
export const ElkinOfficeBottomAnchor = () => (
  <SocialCanvas format="portrait" background="photo" scale={0.32}>
    <PhotoPost
      kicker="Real people, real answers"
      headline="Stop by. We're right here in downtown Elkin."
      sub="A real office and a real person who picks up — independent since 2005."
      ctaLabel="Call or text 336-835-1993"
    />
  </SocialCanvas>
);

/** Centered statement in story format — photoSrc would be a Pilot Mountain shot. */
export const PilotMountainStory = () => (
  <SocialCanvas format="story" background="photo" scale={0.26}>
    <PhotoPost
      position="center"
      kicker="Surry County proud"
      headline="Covering the foothills, from Pilot Mountain to the Yadkin Valley."
      headlineSize="lg"
      sub="Auto · Home · Life — BillLayneInsurance.com"
    />
  </SocialCanvas>
);
