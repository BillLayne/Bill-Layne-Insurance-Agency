/**
 * BLI Image Studio — the Bill Layne Insurance image design system.
 * Flyers, educational infographics, quote/sales cards, collages, YouTube
 * thumbnails (@ncautoandhome), corporate images, and underwriting /
 * documentation sheets — built on the live agency brand (navy #003f87 /
 * gold #C8A84E / teal #0f766e), self-hosted Fraunces + Archivo.
 *
 * Compose: put ONE template inside an ImageCanvas set to the target format.
 * Kept fully separate from the Social Studio, email, and document-template
 * systems (its own package, namespace --bis-*, and Claude Design project).
 */

// Foundation
export { ImageCanvas } from './components/ImageCanvas';
export type { ImageCanvasFormat, ImageCanvasBackground } from './components/ImageCanvas';

// Real embedded brand assets (agency logo, QR, carrier logos)
export { BLI_LOGO, BLI_QR, CARRIER_LOGOS, CARRIER_NAMES, carrierLogo } from './components/assets';

// Atoms
export { BrandLockup } from './components/BrandLockup';
export { LogoStrap } from './components/LogoStrap';
export { Kicker } from './components/Kicker';
export { Headline } from './components/Headline';
export { Highlight } from './components/Highlight';
export { CTAPill } from './components/CTAPill';
export { ChipBadge } from './components/ChipBadge';
export { PhoneCTA } from './components/PhoneCTA';
export { StatNumber } from './components/StatNumber';
export { IconBadge } from './components/IconBadge';
export { QRBlock } from './components/QRBlock';
export { LogoPlaceholder } from './components/LogoPlaceholder';
export { CarrierLogoSlot } from './components/CarrierLogoSlot';
export { Disclaimer, STANDARD_DISCLAIMER } from './components/Disclaimer';

// Templates (one per v3 mode)
export { FlyerPromo } from './components/FlyerPromo';                 // PROMO
export { ExplainerInfographic } from './components/ExplainerInfographic'; // EDUCATION
export { QuoteCard } from './components/QuoteCard';                   // SALES / QUOTE
export { StatSpotlight } from './components/StatSpotlight';           // EDUCATION / PROMO
export { ChecklistSheet } from './components/ChecklistSheet';         // EDUCATION
export { ComparePanel } from './components/ComparePanel';             // EDUCATION
export { CollageBoard } from './components/CollageBoard';             // COLLAGE
export { YouTubeThumbnail } from './components/YouTubeThumbnail';     // YOUTUBE
export { CorporateCard } from './components/CorporateCard';           // CORPORATE
export { UWDocSheet } from './components/UWDocSheet';                 // UNDERWRITING / DOC
