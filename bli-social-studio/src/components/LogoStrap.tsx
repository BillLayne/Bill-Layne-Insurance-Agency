export interface LogoStrapProps {
  /** Agency phone shown bold on the right. */
  phone?: string;
  /** Website line under the phone. */
  website?: string;
  /**
   * Small compliance / disclaimer line above the strap, e.g.
   * “Coverage subject to policy terms. NC License #6571216”. Include on
   * promotional posts.
   */
  finePrint?: string;
}

/**
 * The standard brand footer bar: “BILL LAYNE / INSURANCE AGENCY” on the left,
 * phone + website on the right, over a hairline rule. Inside a SocialCanvas
 * it pins itself to the bottom automatically. Every feed template includes it
 * by default (`showStrap`) — keeping it on makes the whole feed recognizably
 * Bill Layne.
 */
export function LogoStrap({
  phone = '336-835-1993',
  website = 'BillLayneInsurance.com',
  finePrint,
}: LogoStrapProps) {
  return (
    <div className="bss-strap">
      {finePrint && <div className="bss-strap__fine">{finePrint}</div>}
      <div className="bss-strap__bar">
        <div className="bss-strap__brand">
          <span className="bss-strap__brand-name">Bill Layne</span>
          <span className="bss-strap__brand-sub">Insurance Agency</span>
        </div>
        <div className="bss-strap__contact">
          <span className="bss-strap__phone">{phone}</span>
          <span className="bss-strap__site">{website}</span>
        </div>
      </div>
    </div>
  );
}
