import { BrandLockup, Headline, Kicker, SocialCanvas } from 'bli-social-studio';

const cap = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  textAlign: 'center',
  marginTop: 6,
};

/** The four everyday post sizes at true aspect ratio, brand mark centered. */
export const Formats = () => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
    {[
      { format: 'portrait', scale: 0.18, note: 'portrait 1080×1350' },
      { format: 'square', scale: 0.18, note: 'square 1080×1080' },
      { format: 'story', scale: 0.13, note: 'story 1080×1920' },
      { format: 'landscape', scale: 0.2, note: 'landscape 1200×630' },
    ].map((f) => (
      <div key={f.format}>
        <SocialCanvas format={f.format} scale={f.scale}>
          <div style={{ margin: 'auto' }}>
            <BrandLockup size="lg" center />
          </div>
        </SocialCanvas>
        <div style={cap}>{f.note}</div>
      </div>
    ))}
  </div>
);

/** Background sweep — dark surfaces flip the ink white, light ones go navy. */
export const Backgrounds = () => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
    {['gradient', 'navy', 'teal', 'cream', 'gold'].map((bg) => (
      <div key={bg}>
        <SocialCanvas format="square" background={bg} scale={0.15} padding="none" />
        <div style={cap}>{bg}</div>
      </div>
    ))}
  </div>
);

/** background="photo" with no photoSrc falls back to the brand gradient + scrim. */
export const PhotoFallback = () => (
  <SocialCanvas format="portrait" background="photo" scale={0.32}>
    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '2em' }}>
      <Kicker>Around Elkin</Kicker>
      <Headline size="md">Fall on Main Street — our favorite season.</Headline>
    </div>
  </SocialCanvas>
);

/** Dashed crop-safe guide for a Google Business Profile post (design aid only). */
export const SafeGuides = () => (
  <SocialCanvas format="gbp" background="navy" safeGuides scale={0.3}>
    <div style={{ margin: 'auto' }}>
      <BrandLockup size="lg" center showLocation />
    </div>
  </SocialCanvas>
);
