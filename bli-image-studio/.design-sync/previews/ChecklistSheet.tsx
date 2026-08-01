import { ImageCanvas, ChecklistSheet, Highlight } from 'bli-image-studio';

/** Save-and-share storm-prep checklist. */
export const StormPrep = () => (
  <ImageCanvas format="feed45" background="gradient" scale={0.32}>
    <ChecklistSheet
      kicker="Before storm season"
      headline={<>Home <Highlight>storm-prep</Highlight> checklist</>}
      items={[
        'Photograph every room and the exterior',
        'Clear gutters and trim close branches',
        'Know your deductible and coverage limits',
        'Save our number in your phone: 336-835-1993',
      ]}
      footnote="Questions on any of these? Call or text us."
    />
  </ImageCanvas>
);

/** Print handout version on cream. */
export const MovingChecklist = () => (
  <ImageCanvas format="flyer" background="cream" scale={0.3}>
    <ChecklistSheet
      kicker="New home?"
      headline="Moving insurance checklist"
      items={[
        'Update your address on auto + home',
        'Confirm your new dwelling coverage amount',
        'Ask about bundling auto + home',
        'Review liability and umbrella limits',
        'Set up your new-home policy start date',
      ]}
    />
  </ImageCanvas>
);
