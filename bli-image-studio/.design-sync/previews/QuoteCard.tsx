import { ImageCanvas, QuoteCard } from 'bli-image-studio';

/** Clean phone-first card — NO figures (the default, compliant look). */
export const PhoneFirst = () => (
  <ImageCanvas format="feed45" background="navy" scale={0.32}>
    <QuoteCard
      headline="Auto Insurance"
      icon="car"
      preparedFor="Let's build your quote together"
    />
  </ImageCanvas>
);

/** With real supplied numbers — coverage lines + a premium figure. */
export const WithFigures = () => (
  <ImageCanvas format="feed45" background="white" scale={0.32}>
    <QuoteCard
      kicker="Personalized Quote"
      headline="Homeowners"
      icon="home"
      preparedFor="Prepared for the Johnson family"
      headlineFigure="$142/mo"
      lines={[
        { label: 'Dwelling (Cov. A)', value: '$320,000' },
        { label: 'Liability', value: '$300,000' },
        { label: 'Deductible', value: '$1,000' },
      ]}
    />
  </ImageCanvas>
);
