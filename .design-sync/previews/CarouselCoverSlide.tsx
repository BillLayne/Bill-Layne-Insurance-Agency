import { CarouselCoverSlide, SocialCanvas } from 'bli-social-studio';

/** Curiosity-gap hook with topic chip — slide 1 of a 7-slide home carousel. */
export const HomePolicyGapCover = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <CarouselCoverSlide
      topic="HOME · NC"
      hook="The one gap in your home policy nobody mentions"
      totalSlides={7}
    />
  </SocialCanvas>
);

/** Pattern-interrupt cover with a teaser sub line, on navy. */
export const FloodTruthCover = () => (
  <SocialCanvas format="portrait" background="navy" scale={0.32}>
    <CarouselCoverSlide
      topic="FLOOD FACTS"
      hook="Your home policy doesn’t cover flood. At all."
      sub="What NC homeowners actually need to know — six quick slides."
      totalSlides={6}
    />
  </SocialCanvas>
);
