import { ImageCanvas, FlyerPromo, Highlight } from 'bli-image-studio';

/** The canonical offer flyer on the premium gradient. */
export const FreePolicyReview = () => (
  <ImageCanvas format="feed45" scale={0.32}>
    <FlyerPromo
      kicker="AUTO · HOME · BUSINESS"
      headline={<>We read your policy <Highlight>so you don't have to.</Highlight></>}
      subline="Bring any auto or home policy — we'll flag the gaps in plain English."
      points={[
        { icon: 'shield', text: 'One office, a dozen carriers' },
        { icon: 'check', text: 'A real person answers the phone' },
      ]}
      ctaLabel="Request a quote"
    />
  </ImageCanvas>
);

/** Centered announcement on the gold canvas — navy CTA for contrast. */
export const GoldAnnouncement = () => (
  <ImageCanvas format="feed45" background="gold" scale={0.32}>
    <FlyerPromo
      kicker="Elkin · Dobson · Surry County"
      headline="Independent means we work for you."
      headlineSize="md"
      subline="A dozen carriers under one roof — we shop, you choose."
      ctaLabel="Let's review your options"
      ctaVariant="navy"
      align="center"
      showPhone={false}
    />
  </ImageCanvas>
);

/** 8.5×11 print flyer with the QR placeholder slot. */
export const PrintFlyer = () => (
  <ImageCanvas format="flyer" background="navy" scale={0.3}>
    <FlyerPromo
      kicker="Free this month"
      headline={<>Free <Highlight>policy review.</Highlight></>}
      subline="No pressure — just a plain-English look at what you have and where the gaps are."
      points={[{ icon: 'car', text: 'Auto' }, { icon: 'home', text: 'Home' }, { icon: 'umbrella', text: 'Umbrella' }]}
      ctaLabel="Request a quote"
      showQR
      qrCaption="Scan to start"
    />
  </ImageCanvas>
);
