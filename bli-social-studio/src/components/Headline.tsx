import type { ReactNode } from 'react';

export interface HeadlineProps {
  /** Headline text. Wrap key words in `Highlight` for the hand-marked accent. */
  children: ReactNode;
  /**
   * `xl` (hooks/carousel covers — huge), `lg` default (hero posts),
   * `md` (titles over lists/cards), `sm` (dense layouts).
   */
  size?: 'xl' | 'lg' | 'md' | 'sm';
  align?: 'left' | 'center';
  /** `display` = Fraunces serif (default, the brand voice); `sans` = Archivo for utility posts. */
  font?: 'display' | 'sans';
}

/**
 * The big-type headline — 2026’s defining social look is one oversized,
 * confident statement, readable at thumbnail size. Keep it under ~8 words;
 * let the caption carry the detail.
 */
export function Headline({
  children,
  size = 'lg',
  align = 'left',
  font = 'display',
}: HeadlineProps) {
  const cls = [
    'bss-headline',
    `bss-headline--${size}`,
    align === 'center' ? 'bss-headline--center' : '',
    font === 'sans' ? 'bss-headline--sans' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return <div className={cls}>{children}</div>;
}
