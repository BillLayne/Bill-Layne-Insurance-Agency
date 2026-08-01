import type { ReactNode } from 'react';

export interface UWMetaField {
  label: ReactNode;
  /** Fill only from real, supplied data — never fabricate a policy/claim number, VIN, or date. */
  value: ReactNode;
}

export interface UWCell {
  /** Evidence photo URL. Missing src renders a labeled empty frame. */
  photoSrc?: string;
  /** Required label chip, e.g. "Roof — south slope". */
  label: ReactNode;
  /** Optional neutral note under the frame (observation, not a conclusion). */
  note?: ReactNode;
  /** Markup callout drawn over the photo. `none` (default), `arrow`, or `circle`. */
  callout?: 'none' | 'arrow' | 'circle';
  /** Draw a privacy redaction bar across the lower strip of the photo (plate, face, address). */
  redact?: boolean;
}

export interface UWDocSheetProps {
  /** Sheet title, e.g. "Property Inspection — Exterior". */
  title: ReactNode;
  /** Subtitle / location line. */
  subtitle?: ReactNode;
  /** Metadata fields (Date, Inspector, Reference…). Values only from real data. */
  meta?: UWMetaField[];
  /** 1–6 evidence cells. */
  cells: UWCell[];
  /**
   * Footer note. Default states the evidence-preservation rule — factual
   * conditions are never altered; only crop/exposure/labels/redactions applied.
   */
  footnote?: ReactNode;
}

/**
 * UNDERWRITING / DOCUMENTATION mode — a neutral evidence sheet: titled header
 * with metadata, a labeled grid of evidence photos with optional callout markup
 * and privacy redactions, and a footer stating the evidence-preservation rule.
 * This template never alters, adds, or removes damage/hazards/conditions — only
 * crop, exposure, labels, arrows/circles, and redactions are applied. Turn the
 * canvas `grain` OFF and use a `white` background for documentation.
 */
export function UWDocSheet({
  title,
  subtitle,
  meta,
  cells,
  footnote = 'Documentation sheet. Photos shown as captured — factual conditions unaltered; only crop, exposure, labels, and privacy redactions applied.',
}: UWDocSheetProps) {
  return (
    <div className="bis-t bis-uw">
      <div className="bis-uw__header">
        <div className="bis-uw__titles">
          <span className="bis-uw__title">{title}</span>
          {subtitle && <span className="bis-uw__subtitle">{subtitle}</span>}
        </div>
        <div className="bis-uw__brand">
          <span className="bis-uw__brand-name">Bill Layne Insurance Agency</span>
          <span className="bis-uw__brand-sub">Independent Agency · Elkin, NC · 336-835-1993</span>
        </div>
      </div>

      {meta && meta.length > 0 && (
        <div className="bis-uw__meta">
          {meta.map((m, i) => (
            <div className="bis-uw__meta-field" key={i}>
              <span className="bis-uw__meta-label">{m.label}</span>
              <span className="bis-uw__meta-value">{m.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className={`bis-uw__grid bis-uw__grid--n${cells.length}`}>
        {cells.map((c, i) => (
          <figure className="bis-uw__cell" key={i}>
            <div className="bis-uw__frame">
              {c.photoSrc ? (
                <div className="bis-uw__photo" style={{ backgroundImage: `url(${c.photoSrc})` }} />
              ) : (
                <div className="bis-uw__photo bis-uw__photo--empty">
                  <span>PLACE PHOTO</span>
                </div>
              )}
              {c.callout && c.callout !== 'none' && (
                <span className={`bis-uw__callout bis-uw__callout--${c.callout}`} aria-hidden="true" />
              )}
              {c.redact && <span className="bis-uw__redact" aria-hidden="true" />}
              <span className="bis-uw__cell-index">{i + 1}</span>
            </div>
            <figcaption className="bis-uw__cell-cap">
              <span className="bis-uw__cell-label">{c.label}</span>
              {c.note && <span className="bis-uw__cell-note">{c.note}</span>}
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="bis-uw__foot">{footnote}</p>
    </div>
  );
}
