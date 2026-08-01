import type { ReactNode } from 'react';
import { ChipBadge } from './ChipBadge';
import { type IconName } from './icons';

export interface YouTubeThumbnailProps {
  /** Optional small topic chip, e.g. "AUTO INSURANCE". */
  kicker?: string;
  kickerIcon?: IconName;
  /** The punch words — 2–5 huge words. Wrap the key word in `Highlight`. */
  headline: ReactNode;
  /** Optional second, smaller line under the punch words. */
  subline?: ReactNode;
  /** Right-side photo (a person/subject). Missing src renders a branded panel. Set `false` for text-only. */
  photoSrc?: string;
  showPhoto?: boolean;
  /** Channel handle shown bottom-left. Default the agency channel. */
  channel?: string;
  /** Emphasis badge, e.g. "EXPLAINED" or "2026". Optional. */
  stamp?: string;
}

/**
 * YOUTUBE mode — a high-CTR 16:9 thumbnail for @ncautoandhome: 2–5 oversized
 * punch words on the left, an optional subject photo on the right, a topic chip,
 * a channel tag, and an optional corner stamp. Built for legibility at small
 * sizes — original editorial style, not a copy of any creator. Put it inside an
 * ImageCanvas with `format="youtube"`.
 */
export function YouTubeThumbnail({
  kicker,
  kickerIcon = 'none',
  headline,
  subline,
  photoSrc,
  showPhoto = true,
  channel = '@ncautoandhome',
  stamp,
}: YouTubeThumbnailProps) {
  return (
    <div className={`bis-t bis-yt${showPhoto ? '' : ' bis-yt--textonly'}`}>
      <div className="bis-yt__text">
        {kicker && (
          <div className="bis-yt__kicker">
            <ChipBadge label={kicker} icon={kickerIcon} tone="gold" />
          </div>
        )}
        <div className="bis-yt__headline">{headline}</div>
        {subline && <div className="bis-yt__sub">{subline}</div>}
        <span className="bis-yt__channel">{channel}</span>
      </div>
      {showPhoto && (
        <div className="bis-yt__media">
          {photoSrc ? (
            <div className="bis-yt__photo" style={{ backgroundImage: `url(${photoSrc})` }} />
          ) : (
            <div className="bis-yt__photo bis-yt__photo--ph" />
          )}
          {stamp && <span className="bis-yt__stamp">{stamp}</span>}
        </div>
      )}
      {!showPhoto && stamp && <span className="bis-yt__stamp bis-yt__stamp--float">{stamp}</span>}
    </div>
  );
}
