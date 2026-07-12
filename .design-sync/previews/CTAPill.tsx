import { CTAPill, SocialCanvas } from 'bli-social-studio';

/** Primary gold, secondary outline, and photo-white on the navy canvas. */
export const VariantsOnNavy = () => (
  <SocialCanvas format="square" background="navy" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '2.5em', alignItems: 'flex-start' }}>
      <CTAPill label="Call or text 336-835-1993" icon="phone" />
      <CTAPill label="Ask about discounts" variant="outline" />
      <CTAPill label="Get a free quote review" variant="white" icon="arrow" />
    </div>
  </SocialCanvas>
);

/** Navy pill is the contrast pick for gold and light canvases. */
export const NavyOnGold = () => (
  <SocialCanvas format="square" background="gold" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0' }}>
      <CTAPill label="Get a free quote review" variant="navy" size="lg" icon="arrow" />
    </div>
  </SocialCanvas>
);

/** md vs lg hero size, message + phone icons, on the hero gradient. */
export const SizesAndIcons = () => (
  <SocialCanvas format="square" scale={0.4} padding="snug">
    <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '2.5em', alignItems: 'flex-start' }}>
      <CTAPill label="Message us" icon="message" />
      <CTAPill label="Call or text 336-835-1993" size="lg" icon="phone" />
    </div>
  </SocialCanvas>
);
