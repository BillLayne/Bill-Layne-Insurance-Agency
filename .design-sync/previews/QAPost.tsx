import { QAPost, SocialCanvas } from 'bli-social-studio';

/** The canonical FAQ post — real question, plain-English answer, gradient canvas. */
export const DetachedGarageQuestion = () => (
  <SocialCanvas format="portrait" scale={0.32}>
    <QAPost
      question="Does my home policy cover my detached garage?"
      answer="Usually, yes — it falls under “other structures” coverage, typically set at 10% of your dwelling limit. If you've built a big shop or workshop out back, that default may be light. Worth a five-minute check."
    />
  </SocialCanvas>
);

/** Teen-driver question on teal with the standing CTA. */
export const TeenPermitQuestion = () => (
  <SocialCanvas format="portrait" background="teal" scale={0.32}>
    <QAPost
      question="My teen just got a learner's permit. Do I add them now?"
      answer="In NC, most carriers cover permit drivers under a parent's policy automatically. Once they're fully licensed, they need to be listed — call us before that day so there are no surprises."
      ctaLabel="Ask us anything"
    />
  </SocialCanvas>
);

/** Light-surface variant on cream — navy ink, gold-edged answer card. */
export const FloodQuestionOnCream = () => (
  <SocialCanvas format="portrait" background="cream" scale={0.32}>
    <QAPost
      question="Doesn't homeowners insurance cover flooding?"
      answer="Rising water is its own policy — standard home insurance doesn't cover it, even here in the foothills. Flood coverage is separate and usually has a 30-day wait, so the time to ask is before the storm names itself."
      ctaLabel="Ask us anything"
    />
  </SocialCanvas>
);
