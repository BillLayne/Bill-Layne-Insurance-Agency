import type { CSSProperties, ReactNode } from 'react';

export type SocialCanvasFormat =
  | 'portrait'
  | 'square'
  | 'story'
  | 'landscape'
  | 'gbp'
  | 'cover';

export type SocialCanvasBackground =
  | 'gradient'
  | 'navy'
  | 'teal'
  | 'cream'
  | 'white'
  | 'gold'
  | 'photo';

const FORMATS: Record<SocialCanvasFormat, { w: number; h: number }> = {
  portrait: { w: 1080, h: 1350 },
  square: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
  landscape: { w: 1200, h: 630 },
  gbp: { w: 1200, h: 900 },
  cover: { w: 1640, h: 624 },
};

const GUIDES: Record<
  SocialCanvasFormat,
  { top: number; right: number; bottom: number; left: number; label: string }
> = {
  portrait: { top: 72, right: 64, bottom: 72, left: 64, label: 'Grid-safe zone' },
  square: { top: 24, right: 135, bottom: 24, left: 135, label: 'Grid-safe 3:4' },
  story: { top: 250, right: 60, bottom: 380, left: 60, label: 'Story-safe zone' },
  landscape: { top: 40, right: 40, bottom: 40, left: 40, label: 'Safe zone' },
  gbp: { top: 0, right: 150, bottom: 0, left: 150, label: 'GBP crop-safe 900×900' },
  cover: { top: 0, right: 180, bottom: 0, left: 180, label: 'Mobile-safe 640×312' },
};

export interface SocialCanvasProps {
  /**
   * Post format — sets the true pixel dimensions (2026 platform specs):
   * `portrait` 1080×1350 (4:5 — the DEFAULT for Instagram AND Facebook feed),
   * `square` 1080×1080, `story` 1080×1920 (IG/FB Stories + Reels),
   * `landscape` 1200×630 (FB link/OG), `gbp` 1200×900 (Google Business
   * Profile post, 4:3), `cover` 1640×624 (Facebook cover photo, upload at 2×).
   */
  format?: SocialCanvasFormat;
  /**
   * Background treatment. Dark surfaces (`gradient`, `navy`, `teal`, `photo`)
   * automatically switch all child components to white ink + light-gold
   * accents; light surfaces (`cream`, `white`, `gold`) use deep-navy ink.
   * `gradient` is the premium BLI hero gradient (navy→teal).
   */
  background?: SocialCanvasBackground;
  /** Photo URL for `background="photo"`. Missing src falls back to the brand gradient. */
  photoSrc?: string;
  /** Legibility scrim over the photo (only with `background="photo"`). Default `soft`. */
  photoOverlay?: 'soft' | 'strong' | 'none';
  /** Subtle film-grain texture — the 2026 “imperfect by design” finish. Default true. */
  grain?: boolean;
  /** Inner padding: `none` 0 · `snug` 5% · `standard` 7% (default) · `roomy` 9.5% of width. */
  padding?: 'none' | 'snug' | 'standard' | 'roomy';
  /**
   * Visual scale for on-screen layout (e.g. 0.35 to fit several posts side
   * by side). The canvas still renders its true pixel size internally, so
   * text proportions never change. Use 1 (default) when exporting.
   */
  scale?: number;
  /**
   * Show dashed platform safe-area guides (IG grid crop, story UI zones,
   * GBP center-square, FB cover mobile zone). Design aid only — ALWAYS turn
   * off before exporting.
   */
  safeGuides?: boolean;
  children?: ReactNode;
}

/**
 * The post artboard every BLI social graphic starts with. Renders at the true
 * pixel size of the target platform and establishes the scale model for every
 * component inside it (1em = 1% of canvas width), so the same template lays
 * out correctly in any format. Compose: put one template (HeroPromoPost,
 * TipsListPost, TestimonialPost…) inside a SocialCanvas.
 */
export function SocialCanvas({
  format = 'portrait',
  background = 'gradient',
  photoSrc,
  photoOverlay = 'soft',
  grain = true,
  padding = 'standard',
  scale = 1,
  safeGuides = false,
  children,
}: SocialCanvasProps) {
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
    <div className="bss-scale" style={outerStyle}>
      <div className={`bss-canvas bss-canvas--${background}`} style={canvasStyle}>
        {background === 'photo' &&
          (photoSrc ? (
            <div
              className="bss-canvas__photo"
              style={{ backgroundImage: `url(${photoSrc})` }}
            />
          ) : (
            <div className="bss-canvas__photo bss-canvas__photo--fallback" />
          ))}
        {background === 'photo' && photoOverlay !== 'none' && (
          <div className={`bss-canvas__shade bss-canvas__shade--${photoOverlay}`} />
        )}
        {grain && <div className="bss-canvas__grain" />}
        <div className={`bss-canvas__inner bss-pad--${padding}`}>{children}</div>
        {safeGuides && (
          <div className="bss-canvas__guides">
            <div
              className="bss-guide"
              style={{ top: g.top, right: g.right, bottom: g.bottom, left: g.left }}
            >
              <span className="bss-guide__label">{g.label}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
