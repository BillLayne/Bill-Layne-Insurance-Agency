import type { ReactNode } from 'react';
import { CTAPill } from './CTAPill';
import { Headline } from './Headline';
import { Kicker } from './Kicker';
import { LogoStrap } from './LogoStrap';

export interface QAPostProps {
  /** Eyebrow above the question. Default “YOU ASKED”. */
  askedLabel?: string;
  /** A real customer question, in their words. */
  question: ReactNode;
  /** Label on the answer card. Default “OUR ANSWER”. */
  answerLabel?: string;
  /** The answer in plain English — 2–3 sentences, no jargon. */
  answer: ReactNode;
  ctaLabel?: string;
  showStrap?: boolean;
  finePrint?: string;
}

/**
 * The FAQ answer post: a real question big in serif, the answer in a gold-
 * edged card. Doubles as search content — Instagram reads captions like a
 * search engine now, so repeat the question keywords in the caption.
 */
export function QAPost({
  askedLabel = 'You asked',
  question,
  answerLabel = 'Our answer',
  answer,
  ctaLabel,
  showStrap = true,
  finePrint,
}: QAPostProps) {
  return (
    <div className="bss-t bss-qa">
      <div className="bss-t__main">
        <Kicker>{askedLabel}</Kicker>
        <div className="bss-qa__question">
          <Headline size="md">{question}</Headline>
        </div>
        <div className="bss-qa__answer">
          <div className="bss-qa__answer-label">{answerLabel}</div>
          <div className="bss-qa__answer-text">{answer}</div>
        </div>
        {ctaLabel && (
          <div className="bss-t__cta">
            <CTAPill label={ctaLabel} icon="message" />
          </div>
        )}
      </div>
      {showStrap && <LogoStrap finePrint={finePrint} />}
    </div>
  );
}
