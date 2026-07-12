import { HoursUpdatePost, SocialCanvas } from 'bli-social-studio';

/** July 4th closure — the canonical holiday-hours post on the gradient. */
export const JulyFourthClosure = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <HoursUpdatePost
      rows={[
        { label: 'Fri, July 4', value: 'Closed' },
        { label: 'Sat, July 5', value: 'Back at 9 AM' },
      ]}
      note="Claims can't wait? Every carrier's 24/7 claims line is listed at BillLayneInsurance.com."
    />
  </SocialCanvas>
);

/** Winter-weather delay variant on navy. */
export const WinterWeatherDelay = () => (
  <SocialCanvas format="portrait" background="navy" scale={0.32}>
    <HoursUpdatePost
      kicker="Winter weather"
      title="Snow day in Elkin — opening late"
      rows={[
        { label: 'Tue, Jan 20', value: 'Opening at 11 AM' },
        { label: 'Phones & email', value: 'Answering as usual' },
      ]}
      note={
        <>
          Roads are icy from Elkin to Dobson — stay put. We can handle almost
          anything by phone: <span style={{ whiteSpace: 'nowrap' }}>336-835-1993</span>.
        </>
      }
    />
  </SocialCanvas>
);

/** Thanksgiving week schedule on cream — three rows, light surface. */
export const ThanksgivingWeek = () => (
  <SocialCanvas format="portrait" background="cream" scale={0.32}>
    <HoursUpdatePost
      title="Thanksgiving week hours"
      rows={[
        { label: 'Wed, Nov 25', value: '9 AM – 1 PM' },
        { label: 'Thu, Nov 26', value: 'Closed' },
        { label: 'Fri, Nov 27', value: 'Closed' },
      ]}
      note="Back Monday at 9 AM. Carrier 24/7 claims lines are at BillLayneInsurance.com."
    />
  </SocialCanvas>
);
