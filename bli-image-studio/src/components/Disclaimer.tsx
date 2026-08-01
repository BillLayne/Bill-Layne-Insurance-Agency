export interface DisclaimerProps {
  /**
   * The disclaimer text. Defaults to the standard agency compliance line.
   * Keep to compliant language — "coverage and pricing vary", "subject to
   * underwriting / eligibility / policy terms"; never a savings or approval
   * promise.
   */
  children?: string;
  align?: 'left' | 'center';
}

/** The current standard compliance line (NC License #6571216 is the site standard). */
export const STANDARD_DISCLAIMER =
  'Coverage and pricing vary. Quote subject to underwriting, eligibility, and policy terms. NC License #6571216';

/**
 * The fine-print compliance block. Include on every promotional / sales piece.
 * Never states or implies "best/lowest rates", "guaranteed savings", or a
 * guaranteed coverage, approval, or claim outcome.
 */
export function Disclaimer({ children = STANDARD_DISCLAIMER, align = 'left' }: DisclaimerProps) {
  return (
    <p className={`bis-disclaimer${align === 'center' ? ' bis-disclaimer--center' : ''}`}>
      {children}
    </p>
  );
}
