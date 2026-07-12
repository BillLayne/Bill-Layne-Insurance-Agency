import { CarouselCTASlide, SocialCanvas } from 'bli-social-studio';

/** The stock closing slide — every prop at its default, on the gradient. */
export const DefaultClose = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <CarouselCTASlide />
  </SocialCanvas>
);

/** Custom close on navy: reassurance sub line + compliance fine print. */
export const AskAnythingClose = () => (
  <SocialCanvas format="portrait" background="navy" scale={0.32}>
    <CarouselCTASlide
      headline="Not sure what your policy actually covers?"
      sub="No robots here — a real Surry County agent reads every message."
      ctaLabel="Ask us anything"
      finePrint="Coverage subject to policy terms and underwriting. NC License #6571216"
    />
  </SocialCanvas>
);
