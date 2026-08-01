import type { ReactNode } from 'react';

export interface StatNumberProps {
  /** The number/figure, e.g. "20+", "1,000s", "A+". Only use real, defensible figures. */
  value: ReactNode;
  /** Caption under the number, e.g. "years serving the NC foothills". */
  caption?: ReactNode;
  size?: 'xl' | 'lg' | 'md';
  align?: 'left' | 'center';
}

/**
 * One oversized statistic with a caption. On dark canvases the number fills
 * with the gold gradient; on light/gold canvases it remaps to navy/teal so it
 * never disappears. Use only real, non-misleading figures (never a fabricated
 * savings %).
 */
export function StatNumber({ value, caption, size = 'lg', align = 'left' }: StatNumberProps) {
  return (
    <div className={`bis-stat bis-stat--${size}${align === 'center' ? ' bis-stat--center' : ''}`}>
      <span className="bis-stat__value">{value}</span>
      {caption && <span className="bis-stat__caption">{caption}</span>}
    </div>
  );
}
