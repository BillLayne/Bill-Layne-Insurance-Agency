import { IconStar } from './icons';

export interface StarRatingProps {
  /** Filled stars 0–5. Default 5. */
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  /** Optional label after the stars, e.g. “5.0 on Google”. */
  label?: string;
}

/**
 * A row of five gold review stars — the social-proof mark for testimonial
 * and trust content. Use with a genuine review quote (TestimonialPost) or a
 * label like “5.0 on Google”.
 */
export function StarRating({ count = 5, size = 'md', label }: StarRatingProps) {
  const filled = Math.max(0, Math.min(5, Math.round(count)));
  return (
    <span className={`bss-stars bss-stars--${size}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`bss-stars__star${i < filled ? '' : ' bss-stars__star--empty'}`}
        >
          <IconStar />
        </span>
      ))}
      {label && <span className="bss-stars__label">{label}</span>}
    </span>
  );
}
