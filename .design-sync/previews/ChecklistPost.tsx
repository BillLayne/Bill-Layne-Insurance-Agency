import { ChecklistPost, SocialCanvas } from 'bli-social-studio';

/** The canonical saveable checklist — hurricane prep, NC's biggest seasonal moment. */
export const HurricanePrepChecklist = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <ChecklistPost
      title="Hurricane season, handled"
      items={[
        'Photograph every room for your records',
        'Check your wind & hail deductible',
        'Clear gutters, trim loose limbs',
        'Stage water, meds, and chargers',
        'Save our number: 336-835-1993',
      ]}
      footnote="Hurricane season runs June 1 – Nov 30. Surry County counts too."
    />
  </SocialCanvas>
);

/** Mixed checked / still-to-do boxes on cream, with a CTA and fine print. */
export const FirstFrostStillToDo = () => (
  <SocialCanvas format="portrait" background="cream" scale={0.32}>
    <ChecklistPost
      kicker="Before first frost"
      title="Is your house ready for the cold?"
      items={[
        { text: 'Furnace serviced', checked: true },
        { text: 'Outdoor spigots covered', checked: true },
        { text: 'Chimney swept', checked: false },
        { text: 'Space heaters checked', checked: false },
      ]}
      footnote="Frozen-pipe claims spike every January in the Yadkin Valley."
      ctaLabel="Get a free coverage review"
      finePrint="Coverage subject to policy terms and underwriting. NC License #6571216"
    />
  </SocialCanvas>
);

/** Short renter-focused list on teal — proof the template works at 3 items. */
export const RentersMoveInList = () => (
  <SocialCanvas format="portrait" background="teal" scale={0.32}>
    <ChecklistPost
      kicker="Moving to Elkin?"
      title="Renter's move-in list"
      items={[
        'Video the place before boxes land',
        'Ask us about renters coverage',
        'Update your address with your carrier',
      ]}
      ctaLabel="Text us: 336-835-1993"
      finePrint="Coverage subject to policy terms and underwriting. NC License #6571216"
    />
  </SocialCanvas>
);
