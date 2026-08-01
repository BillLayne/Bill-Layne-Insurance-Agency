import type { ReactNode } from 'react';

export interface HeadlineProps {
  /** Headline text. Wrap the one key phrase in `Highlight`. */
  children: ReactNode;
  /**
   * `xl` (thumbnails / covers — huge), `lg` default (flyers, hero pieces),
   * `md` (titles over lists/cards), `sm` (dense infographics).
   */
  size?: 'xl' | 'lg' | 'md' | 'sm';
  align?: 'left' | 'center';
  /** `display` = Fraunces serif (default, brand voice); `sans` = Archivo for utility/UW pieces. */
  font?: 'display' | 'sans';
}

/**
 * The big-type headline — one oversized, confident statement, readable at
 * thumbnail size. Keep it under ~8 words; let the body carry the detail.
 */
export function Headline({
  children,
  size = 'lg',
  align = 'left',
  font = 'display',
}: HeadlineProps) {
  const cls = [
    'bis-headline',
    `bis-headline--${size}`,
    align === 'center' ? 'bis-headline--center' : '',
    font === 'sans' ? 'bis-headline--sans' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return <div className={cls}>{children}</div>;
}
