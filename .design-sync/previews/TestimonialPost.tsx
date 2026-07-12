import { SocialCanvas, TestimonialPost } from 'bli-social-studio';

/** Short quote (<140 chars) gets the big serif type — Google review on the gradient. */
export const ShortQuoteDobson = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <TestimonialPost
      quote="Bill found the gap in our old policy in ten minutes. We switched the same day."
      name="Sarah W."
      location="Dobson, NC"
    />
  </SocialCanvas>
);

/** Long quote (>140 chars) steps down to the smaller size — Facebook review on cream. */
export const LongQuoteElkinCream = () => (
  <SocialCanvas format="portrait" background="cream" scale={0.32}>
    <TestimonialPost
      quote="After the hail storm last spring I was dreading the claims process. Bill’s office called the adjuster for us, checked in every week, and had our roof squared away before the neighbors even got a callback."
      name="Mike & Donna R."
      location="Elkin, NC"
      source="facebook"
    />
  </SocialCanvas>
);
