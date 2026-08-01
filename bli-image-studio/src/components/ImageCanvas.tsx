import type { CSSProperties, ReactNode } from 'react';

export type ImageCanvasFormat =
  | 'feed45'
  | 'square'
  | 'story'
  | 'youtube'
  | 'header'
  | 'flyer';

export type ImageCanvasBackground =
  | 'gradient'
  | 'navy'
  | 'teal'
  | 'cream'
  | 'white'
  | 'gold'
  | 'photo';

/**
 * True pixel dimensions per format (2026 platform + print specs):
 * `feed45` 1080×1350 (4:5 — IG/FB feed), `square` 1080×1080,
 * `story` 1080×1920 (9:16 story/reel), `youtube` 1280×720 (16:9 thumbnail),
 * `header` 1640×864 (~1.9:1 blog / email / OG header),
 * `flyer` 1275×1650 (8.5×11 portrait, 150 ppi — export at 2× for print).
 */
const FORMATS: Record<ImageCanvasFormat, { w: number; h: number }> = {
  feed45: { w: 1080, h: 1350 },
  square: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
  youtube: { w: 1280, h: 720 },
  header: { w: 1640, h: 864 },
  flyer: { w: 1275, h: 1650 },
};

const GUIDES: Record<
  ImageCanvasFormat,
  { top: number; right: number; bottom: number; left: number; label: string }
> = {
  feed45: { top: 72, right: 64, bottom: 72, left: 64, label: 'Feed-safe zone' },
  square: { top: 48, right: 48, bottom: 48, left: 48, label: 'Safe zone' },
  story: { top: 250, right: 60, bottom: 380, left: 60, label: 'Story-safe zone' },
  youtube: { top: 24, right: 24, bottom: 84, left: 24, label: 'Title-safe (avoid ⏱ corner)' },
  header: { top: 40, right: 260, bottom: 40, left: 260, label: 'Crop-safe center' },
  flyer: { top: 75, right: 75, bottom: 75, left: 75, label: 'Print margin (0.5in)' },
};

export interface ImageCanvasProps {
  /** Output format — sets true pixel size + the 1em = 1% scale model. See FORMATS. */
  format?: ImageCanvasFormat;
  /**
   * Background treatment. Dark surfaces (`gradient`, `navy`, `teal`, `photo`)
   * automatically switch all child components to white ink + light-gold
   * accents; light surfaces (`cream`, `white`, `gold`) use deep-navy ink.
   * `gradient` is the premium BLI hero gradient (navy→teal).
   */
  background?: ImageCanvasBackground;
  /** Photo URL for `background="photo"`. Missing src falls back to the brand gradient. */
  photoSrc?: string;
  /** Legibility scrim over the photo (only with `background="photo"`). Default `soft`. */
  photoOverlay?: 'soft' | 'strong' | 'none';
  /** Subtle film-grain texture — the "imperfect by design" finish. Default true. Turn off for UW/documentation sheets. */
  grain?: boolean;
  /** Inner padding: `none` 0 · `snug` 5% · `standard` 7% (default) · `roomy` 9.5% of width. */
  padding?: 'none' | 'snug' | 'standard' | 'roomy';
  /**
   * Visual scale for on-screen layout (e.g. 0.32 to preview several pieces
   * side by side). The canvas still renders its true pixel size internally,
   * so text proportions never change. Use 1 (default) when exporting.
   */
  scale?: number;
  /** Show dashed platform/print safe-area guides. Design aid only — turn OFF before export. */
  safeGuides?: boolean;
  children?: ReactNode;
}

/**
 * The artboard every BLI Image Studio graphic starts with. Renders at the true
 * pixel size of the target platform (or 8.5×11 print) and establishes the scale
 * model for every component inside it (1em = 1% of canvas width), so the same
 * template lays out correctly in any format. Compose: put one template
 * (FlyerPromo, ExplainerInfographic, QuoteCard, YouTubeThumbnail…) inside an
 * ImageCanvas.
 */
export function ImageCanvas({
  format = 'feed45',
  background = 'gradient',
  photoSrc,
  photoOverlay = 'soft',
  grain = true,
  padding = 'standard',
  scale = 1,
  safeGuides = false,
  children,
}: ImageCanvasProps) {
  const { w, h } = FORMATS[format];
  const g = GUIDES[format];

  const outerStyle: CSSProperties = {
    width: w * scale,
    height: h * scale,
  };

  const canvasStyle: CSSProperties = {
    width: w,
    height: h,
    fontSize: w / 100,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
  };

  return (
    <div className="bis-scale" style={outerStyle}>
      <div className={`bis-canvas bis-canvas--${background}`} style={canvasStyle}>
        {background === 'photo' &&
          (photoSrc ? (
            <div
              className="bis-canvas__photo"
              style={{ backgroundImage: `url(${photoSrc})` }}
            />
          ) : (
            <div className="bis-canvas__photo bis-canvas__photo--fallback" />
          ))}
        {background === 'photo' && photoOverlay !== 'none' && (
          <div className={`bis-canvas__shade bis-canvas__shade--${photoOverlay}`} />
        )}
        {grain && <div className="bis-canvas__grain" />}
        <div className={`bis-canvas__inner bis-pad--${padding}`}>{children}</div>
        {safeGuides && (
          <div className="bis-canvas__guides">
            <div
              className="bis-guide"
              style={{ top: g.top, right: g.right, bottom: g.bottom, left: g.left }}
            >
              <span className="bis-guide__label">{g.label}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
