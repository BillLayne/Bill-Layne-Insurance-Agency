# Compliance guardrails — insurance advertising

Bill Layne Insurance Agency is an independent NC agency. Everything this studio
produces is advertising and must stay compliant. These rules override any creative
or visual goal.

## Never say or imply

- "Best rates", "lowest", "cheapest", "unbeatable", "we can't be beat", "guaranteed
  savings", "save $X guaranteed".
- Guaranteed **coverage**, **approval**, **renewal**, **underwriting decision**, or
  **claim outcome**.
- Anything that reads as personalized financial or legal advice.

## Never fabricate

- Prices, premiums, savings percentages, discounts.
- Coverages, limits, deductibles, effective dates.
- VINs, plate numbers, policy numbers, claim numbers, addresses, names.

Figures and coverage lines appear **only** when Bill supplies real, current numbers
for a specific customer. Otherwise use a clean phone-first card (no figures).

## Never show

- Competitor agency names or logos.
- A carrier logo without the "Independent Agency" clarifier line.

## Use instead (compliant language)

- "Request a quote" · "Compare options" · "Let's review your options" ·
  "Coverage and pricing vary" · "Quote subject to underwriting, eligibility, and
  policy terms."
- Discounts: "may qualify for" / "ask about" — never "you will save".

## Required fine print

Put the standard disclaimer on every promotional / sales piece (the `Disclaimer`
component / `finePrint` prop default):

> Coverage and pricing vary. Quote subject to underwriting, eligibility, and policy
> terms. NC License #6571216

Third-party statistics (`StatSpotlight`) must carry a `source` line.

## Photos of real people / property

- Only use photos Bill has the right to use. The hero photos of Bill are genuine.
- On UW / documentation sheets, redact plates, faces, and addresses (`redact` on
  `UWDocSheet` cells) and never alter the factual condition shown.
