/**
 * Internal icon set. Not exported from the package index — components use these
 * directly. All icons inherit color via `fill="currentColor"` unless a
 * component stylesheet overrides the fill. Simple, universally-legible glyphs
 * for insurance topics (auto, home, umbrella, shield) + UI marks.
 */

export type IconName =
  | 'phone'
  | 'message'
  | 'mail'
  | 'globe'
  | 'pin'
  | 'clock'
  | 'check'
  | 'x'
  | 'star'
  | 'arrow'
  | 'arrowUpRight'
  | 'shield'
  | 'home'
  | 'car'
  | 'umbrella'
  | 'alert'
  | 'camera'
  | 'doc'
  | 'none';

export function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3.5a1 1 0 0 1 1-1H7.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

export function IconMessage() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
    </svg>
  );
}

export function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

export function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.93 6h-2.95a15.7 15.7 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14a7.96 7.96 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4H4.26zm.81 2h2.95c.32 1.25.78 2.45 1.38 3.56A8.03 8.03 0 0 1 5.07 16zm2.95-8H5.07a8.03 8.03 0 0 1 4.33-3.56A15.7 15.7 0 0 0 8.02 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82A13.6 13.6 0 0 1 12 19.96zM14.34 14H9.66a14.7 14.7 0 0 1 0-4h4.68a14.7 14.7 0 0 1 0 4zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14a16.5 16.5 0 0 0 0-4h3.38a7.96 7.96 0 0 1 0 4h-3.38z" />
    </svg>
  );
}

export function IconPin() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

export function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 5h-2v6l5.25 3.15.99-1.65L13 12.4V7z" />
    </svg>
  );
}

export function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.3 16.17l-3.48-3.48L4.4 14.1l4.9 4.9L20 8.3l-1.41-1.41L9.3 16.17z" />
    </svg>
  );
}

export function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );
}

export function IconStar() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.6l2.83 6.02 6.6.62-4.98 4.38 1.45 6.48L12 16.74l-5.9 3.36 1.45-6.48L2.57 9.24l6.6-.62L12 2.6z" />
    </svg>
  );
}

export function IconArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 11h12.17l-4.58-4.59L13 5l7 7-7 7-1.41-1.41L16.17 13H4v-2z" />
    </svg>
  );
}

export function IconArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 7h9v9h-2V9.41l-8.29 8.3-1.42-1.42L12.59 8H7V7z" />
    </svg>
  );
}

export function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5l8-3zm-1.2 13.2l5.3-5.3-1.4-1.4-3.9 3.9-1.8-1.8-1.4 1.4 3.2 3.2z" />
    </svg>
  );
}

export function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3l9 8h-2.5v9h-5v-6h-3v6h-5v-9H3l9-8z" />
    </svg>
  );
}

export function IconCar() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11l1.5.7a2 2 0 0 1 1.1 1.8V17a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H5.4v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3.5a2 2 0 0 1 1.1-1.8L5 11zm1.9-.5h10.2l-1-3a.6.6 0 0 0-.5-.4H8.4a.6.6 0 0 0-.6.4l-.9 3zM7 15a1.2 1.2 0 1 0 0-2.4A1.2 1.2 0 0 0 7 15zm10 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z" />
    </svg>
  );
}

export function IconUmbrella() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c-4.7 0-8.6 3.4-9.4 7.9-.1.6.4 1.1 1 1.1H11v7.5a1.5 1.5 0 0 0 3 0 1 1 0 0 0-2 0V11h7.4c.6 0 1.1-.5 1-1.1C20.6 5.4 16.7 2 12 2z" />
    </svg>
  );
}

export function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}

export function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 5h-3.2l-1.4-1.9a1 1 0 0 0-.8-.4H9.4a1 1 0 0 0-.8.4L7.2 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-8 12.5A4.5 4.5 0 1 1 12 8.5a4.5 4.5 0 0 1 0 9zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
    </svg>
  );
}

export function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );
}

/** Resolve an IconName to its component (or null for 'none'). */
export function iconFor(name: IconName): (() => JSX.Element) | null {
  switch (name) {
    case 'phone': return IconPhone;
    case 'message': return IconMessage;
    case 'mail': return IconMail;
    case 'globe': return IconGlobe;
    case 'pin': return IconPin;
    case 'clock': return IconClock;
    case 'check': return IconCheck;
    case 'x': return IconX;
    case 'star': return IconStar;
    case 'arrow': return IconArrowRight;
    case 'arrowUpRight': return IconArrowUpRight;
    case 'shield': return IconShield;
    case 'home': return IconHome;
    case 'car': return IconCar;
    case 'umbrella': return IconUmbrella;
    case 'alert': return IconAlert;
    case 'camera': return IconCamera;
    case 'doc': return IconDoc;
    default: return null;
  }
}
