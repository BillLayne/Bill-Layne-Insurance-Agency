import type { ReactNode } from 'react';
import { Kicker } from './Kicker';
import { Headline } from './Headline';
import { PhoneCTA } from './PhoneCTA';
import { CTAPill } from './CTAPill';
import { Disclaimer } from './Disclaimer';
import { LogoStrap } from './LogoStrap';
import { IconBadge } from './IconBadge';
import { type IconName } from './icons';

export interface QuoteLine {
  /** Coverage/label, e.g. "Liability", "Comprehensive". */
  label: ReactNode;
  /** Value — ONLY fill from figures Bill provides. Never fabricate limits/premiums. */
  value: ReactNode;
}

export interface QuoteCardProps {
  kicker?: string;
  /** Line of business, e.g. "Auto Insurance", "Homeowners". */
  headline: ReactNode;
  /** Icon for the line of business. */
  icon?: IconName;
  /** For whom, e.g. "Prepared for the Johnson family". Optional. */
  preparedFor?: ReactNode;
  /**
   * Coverage line items. Leave empty for a clean phone-first "call for your
   * quote" card — only populate when Bill supplies real figures. Never invent
   * limits, deductibles, or premiums.
   */
  lines?: QuoteLine[];
  /** Big highlighted figure (e.g. a premium Bill provides). Optional. */
  headlineFigure?: ReactNode;
  headlineFigureLabel?: ReactNode;
  ctaLabel?: string;
  phone?: string;
  /** Disclaimer text. Default the standard agency line. */
  disclaimer?: string;
  showStrap?: boolean;
}

/**
 * SALES / QUOTE mode — a phone-first quote/sales card. The phone number is the
 * hero. Coverage lines and any figure appear ONLY when Bill provides real
 * numbers; otherwise it's a clean "call or text for your quote" card. Always
 * carries the compliance disclaimer — no fabricated prices, limits, or savings.
 */
export function QuoteCard({
  kicker = 'Personalized Quote',
  headline,
  icon = 'shield',
  preparedFor,
  lines,
  headlineFigure,
  headlineFigureLabel = 'Your quoted premium',
  ctaLabel = 'Request a quote',
  phone = '336-835-1993',
  disclaimer,
  showStrap = true,
}: QuoteCardProps) {
  return (
    <div className="bis-t bis-quote">
      <div className="bis-t__main">
        <div className="bis-quote__head">
          <IconBadge icon={icon} shape="tile" tone="gold" size="lg" />
          <div className="bis-quote__title">
            {kicker && <Kicker>{kicker}</Kicker>}
            <Headline size="md">{headline}</Headline>
            {preparedFor && <span className="bis-quote__for">{preparedFor}</span>}
          </div>
        </div>

        {headlineFigure && (
          <div className="bis-quote__figure">
            <span className="bis-quote__figure-val">{headlineFigure}</span>
            <span className="bis-quote__figure-label">{headlineFigureLabel}</span>
          </div>
        )}

        {lines && lines.length > 0 && (
          <ul className="bis-quote__lines">
            {lines.map((l, i) => (
              <li className="bis-quote__line" key={i}>
                <span className="bis-quote__line-label">{l.label}</span>
                <span className="bis-quote__line-dots" aria-hidden="true" />
                <span className="bis-quote__line-value">{l.value}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="bis-quote__action">
          <PhoneCTA phone={phone} />
          <CTAPill label={ctaLabel} icon="arrow" variant="gold" size="lg" />
        </div>

        <Disclaimer>{disclaimer}</Disclaimer>
      </div>
      {showStrap && <LogoStrap />}
    </div>
  );
}
