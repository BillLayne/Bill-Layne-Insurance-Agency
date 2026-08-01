export interface LogoStrapProps {
  /** Agency phone shown bold. */
  phone?: string;
  /** Website line. */
  website?: string;
  /** Optional street address (shown on flyers/corporate pieces). */
  address?: string;
  /**
   * Small compliance / disclaimer line above the strap, e.g.
   * "Coverage and pricing vary. Quote subject to underwriting. NC License #6571216".
   * Include on promotional pieces.
   */
  finePrint?: string;
}

/**
 * The standard brand footer bar: "BILL LAYNE / INSURANCE AGENCY" on the left,
 * contact details on the right, over a hairline rule. Inside an ImageCanvas it
 * pins itself to the bottom automatically. Keeping it on every piece makes the
 * whole library recognizably Bill Layne.
 */
export function LogoStrap({
  phone = '336-835-1993',
  website = 'BillLayneInsurance.com',
  address,
  finePrint,
}: LogoStrapProps) {
  return (
    <div className="bis-strap">
      {finePrint && <div className="bis-strap__fine">{finePrint}</div>}
      <div className="bis-strap__bar">
        <div className="bis-strap__brand">
          <span className="bis-strap__brand-name">Bill Layne</span>
          <span className="bis-strap__brand-sub">Insurance Agency</span>
        </div>
        <div className="bis-strap__contact">
          <span className="bis-strap__phone">{phone}</span>
          <span className="bis-strap__site">{website}</span>
          {address && <span className="bis-strap__addr">{address}</span>}
        </div>
      </div>
    </div>
  );
}
