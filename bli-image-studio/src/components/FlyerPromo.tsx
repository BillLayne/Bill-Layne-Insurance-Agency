import type { ReactNode } from 'react';
import { Kicker } from './Kicker';
import { Headline } from './Headline';
import { CTAPill } from './CTAPill';
import { PhoneCTA } from './PhoneCTA';
import { QRBlock } from './QRBlock';
import { LogoStrap } from './LogoStrap';
import { IconBadge } from './IconBadge';
import { type IconName } from './icons';

export interface FlyerValuePoint {
  icon?: IconName;
  text: ReactNode;
}

export interface FlyerPromoProps {
  /** Eyebrow line, e.g. "AUTO · HOME · BUSINESS". */
  kicker?: string;
  /** The big statement. Wrap the key phrase in `Highlight`. */
  headline: ReactNode;
  headlineSize?: 'xl' | 'lg' | 'md';
  /** One supporting sentence in plain English. */
  subline?: ReactNode;
  /** 2–4 value points, each an icon + short line. Keep them benefit-led and compliant. */
  points?: FlyerValuePoint[];
  /** Primary CTA text, e.g. "Request a quote". Default provided. */
  ctaLabel?: string;
  ctaIcon?: IconName;
  ctaVariant?: 'gold' | 'navy' | 'teal' | 'white' | 'outline';
  /** Show the phone-first block. Default true. */
  showPhone?: boolean;
  phone?: string;
  /** Show the QR slot (uses the real QR image if `qrSrc` provided). Default false. */
  showQR?: boolean;
  qrSrc?: string;
  qrCaption?: string;
  align?: 'left' | 'center';
  /** Compliance fine print above the strap. Default the standard agency line. */
  finePrint?: string;
  showStrap?: boolean;
}

/**
 * PROMO mode — the flagship flyer / promotional graphic: kicker, one oversized
 * headline, a plain-English subline, optional value points, and a phone-first
 * CTA (plus an optional QR slot). Works across feed, story, and 8.5×11 print
 * formats. Keep claims compliant — "Request a quote", never a savings promise.
 */
export function FlyerPromo({
  kicker,
  headline,
  headlineSize = 'lg',
  subline,
  points,
  ctaLabel = 'Request a quote',
  ctaIcon = 'arrow',
  ctaVariant = 'gold',
  showPhone = true,
  phone = '336-835-1993',
  showQR = false,
  qrSrc,
  qrCaption,
  align = 'left',
  finePrint = 'Coverage and pricing vary. Quote subject to underwriting. NC License #6571216',
  showStrap = true,
}: FlyerPromoProps) {
  return (
    <div className={`bis-t bis-flyer${align === 'center' ? ' bis-flyer--center' : ''}`}>
      <div className="bis-t__main">
        {kicker && (
          <div className="bis-flyer__kicker">
            <Kicker>{kicker}</Kicker>
          </div>
        )}
        <Headline size={headlineSize} align={align}>
          {headline}
        </Headline>
        {subline && <div className="bis-flyer__sub">{subline}</div>}
        {points && points.length > 0 && (
          <ul className="bis-flyer__points">
            {points.map((p, i) => (
              <li className="bis-flyer__point" key={i}>
                <IconBadge icon={p.icon ?? 'check'} shape="circle" tone="teal" size="sm" />
                <span className="bis-flyer__point-text">{p.text}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="bis-flyer__action">
          {ctaLabel && <CTAPill label={ctaLabel} icon={ctaIcon} variant={ctaVariant} size="lg" />}
          {showPhone && <PhoneCTA phone={phone} align={align} />}
          {showQR && <QRBlock src={qrSrc} caption={qrCaption} size="sm" />}
        </div>
      </div>
      {showStrap && <LogoStrap finePrint={finePrint} />}
    </div>
  );
}
