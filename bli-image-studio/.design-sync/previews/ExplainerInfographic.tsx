import { ImageCanvas, ExplainerInfographic, Highlight } from 'bli-image-studio';

/** Coverage 101 explainer with icon points. */
export const LiabilityExplained = () => (
  <ImageCanvas format="feed45" background="gradient" scale={0.32}>
    <ExplainerInfographic
      kicker="Coverage 101"
      headline={<>What does <Highlight>liability</Highlight> cover?</>}
      points={[
        { icon: 'car', title: 'The other driver', body: "Their car and injuries when a crash is your fault." },
        { icon: 'shield', title: 'Your legal defense', body: 'If a claim turns into a lawsuit.' },
        { icon: 'alert', title: 'Not your own car', body: "That's collision + comprehensive — a separate choice." },
      ]}
    />
  </ImageCanvas>
);

/** Numbered how-it-works, on cream. */
export const HowAClaimWorks = () => (
  <ImageCanvas format="feed45" background="cream" scale={0.32}>
    <ExplainerInfographic
      kicker="After an accident"
      headline="How a claim works"
      markers="numbered"
      points={[
        { title: 'Get safe, call us', body: 'We start the claim with you.' },
        { title: 'Document everything', body: 'Photos, the other driver, the police report.' },
        { title: 'We advocate for you', body: 'Through the carrier, start to finish.' },
      ]}
    />
  </ImageCanvas>
);
