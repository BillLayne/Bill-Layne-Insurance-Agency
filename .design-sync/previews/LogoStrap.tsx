import { LogoStrap, SocialCanvas } from 'bli-social-studio';

/** Default strap — pins itself to the canvas bottom automatically. */
export const OnGradient = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <LogoStrap />
  </SocialCanvas>
);

/** Navy-ink strap on the light cream canvas. */
export const OnCream = () => (
  <SocialCanvas format="portrait" background="cream" scale={0.32}>
    <LogoStrap />
  </SocialCanvas>
);

/** Promotional posts carry the compliance line above the bar. */
export const WithFinePrint = () => (
  <SocialCanvas format="portrait" background="navy" scale={0.32}>
    <LogoStrap finePrint="Coverage subject to policy terms and underwriting. NC License #6571216" />
  </SocialCanvas>
);
