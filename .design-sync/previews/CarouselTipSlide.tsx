import { CarouselTipSlide, SocialCanvas } from 'bli-social-studio';

/** Interior slide 2 of 7 — kicker chip, big outlined number, micro-learning body. */
export const StormPrepSlideTwo = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <CarouselTipSlide
      index={2}
      total={7}
      kicker="STORM SEASON PREP"
      title="Film a two-minute walkthrough"
      body={
        <>
          Open closets and drawers. After a storm,{' '}
          <strong>that video is your inventory</strong> — claims go faster.
        </>
      }
    />
  </SocialCanvas>
);

/** The LAST slide (index === total) — swaps the swipe cue for the 7/7 marker. */
export const StormPrepFinalSlide = () => (
  <SocialCanvas format="portrait" background="teal" scale={0.32}>
    <CarouselTipSlide
      index={7}
      total={7}
      kicker="STORM SEASON PREP"
      title="Screenshot this list. Seriously."
      body={
        <>
          Saves beat likes. Keep it handy for the next{' '}
          <strong>watch or warning</strong>.
        </>
      }
    />
  </SocialCanvas>
);
