# Structured Quote-Intake Endpoint — Design Doc

**Status: PROPOSAL — not built.** Per the Aug 4 SEO/AEO handoff, Phase 3 item 3 is
"design doc first, implementation after Bill approves." Nothing in this document
has been implemented. Read, then approve, reject, or amend.

Prepared 2026-08-04.

---

## 1. What problem this actually solves

Today a lead reaches the agency one of two ways:

1. **Website forms** (`auto-quote.html`, `home-quote.html`) → Apps Script → email to
   docs@ + Twilio SMS to Bill's cell.
2. **A human types it** into a carrier portal.

Both assume a human filled the form in a browser. The bet behind this proposal is that
within the next year or two a meaningful share of insurance shopping starts with an AI
agent acting for the customer ("find me cheaper car insurance in Elkin"). An agent can
technically drive the current form — after the Phase 3 label/autocomplete work it is now
programmatically completable — but it is a slow, brittle path: multi-step DOM, JS
validation, Turnstile at the end.

A documented JSON endpoint gives that traffic a front door, and gives Bill a structured
record instead of a prose email.

**Honest caveat, stated up front:** this is a bet on a trend, not a response to observed
demand. Right now the agency has *zero* measured agent traffic. The Phase 4 GA4 "AI
Referrals" channel group is what would tell us whether this is real. **My recommendation
is to ship Phase 4 first, watch it for a quarter, and build this only if the number is
non-zero.** Building it now is defensible as a cheap option on the future; it is not
urgent, and it should not jump ahead of revenue work.

---

## 2. Scope

**In scope:** accept a structured auto or home quote request, validate it, persist it,
notify Bill, return a reference number.

**Explicitly out of scope:**
- Returning a price. No rating engine, no carrier API. This is intake only. An agent
  gets "received, reference BLI-XXXX," not a number.
- Binding coverage or taking payment.
- Replacing the existing web forms. This runs alongside them.
- Any SSN, driver's license image, or payment data. The public quote-needs page promises
  we never ask for these; the endpoint must never accept them either (see §7).

---

## 3. Where it lives

Reuses the stack already in production:

| Piece | Choice | Why |
|---|---|---|
| Runtime | Cloudflare Worker | Same as the image host, task board, link host |
| Storage | D1 | Already used by `ai-task-manager-db` |
| Notify | Twilio SMS + email to docs@ | Same two channels the current forms hit |
| Host | `quote-intake.billlayneinsurance.com` | Own subdomain, own zone settings |

**Cost:** effectively $0 — the agency is already on the Cloudflare Workers Paid plan
($5/mo). Note the KV/D1 write-volume lesson from the StreamPlayer incident: the free-tier
429 safety net is gone, so a runaway loop bills silently. Rate limiting in §7 is not
optional.

---

## 4. API surface

### `POST /v1/intake/auto`
### `POST /v1/intake/home`

Content-Type `application/json`. No auth for submission (it is a public quote form, same
trust level as the HTML one) — abuse is handled by rate limiting and Turnstile-equivalent
scoring, not by a key.

**Response 202:**
```json
{ "status": "received", "reference": "BLI-A7F3K2", "next": "An agent will follow up within one business day.", "human_contact": { "phone": "+1-336-835-1993", "email": "Save@BillLayneInsurance.com" } }
```

**Response 400:** field-level errors, so an agent can correct and retry:
```json
{ "status": "invalid", "errors": [ { "field": "drivers[0].date_of_birth", "message": "Required. ISO 8601 date (YYYY-MM-DD)." } ] }
```

### `GET /v1/schema/auto` and `GET /v1/schema/home`
Returns the JSON Schema itself, publicly and uncached-by-version. This is the part that
makes the endpoint *discoverable* — an agent can fetch the contract before submitting.
Link both from `llms.txt`.

---

## 5. Schemas

Field names mirror the existing HTML forms exactly so one mapping serves both paths.

### Auto — required
| Field | Type | Notes |
|---|---|---|
| `contact.first_name` | string | |
| `contact.last_name` | string | |
| `contact.phone` | string | E.164 or US 10-digit |
| `contact.email` | string | RFC 5322 |
| `garaging_address.street` | string | |
| `garaging_address.city` | string | |
| `garaging_address.state` | string | 2-letter; **must be `NC`** (see §6) |
| `garaging_address.zip` | string | 5-digit |
| `drivers[]` | array, min 1 | each: `first_name`, `last_name`, `date_of_birth` (ISO) |
| `vehicles[]` | array, min 1 | each: `year`, `make`, `model` |

### Auto — optional
`drivers[].marital_status`, `drivers[].licensed_age`, `vehicles[].vin` (17 char),
`vehicles[].ownership` (own/finance/lease), `current_coverage.carrier`,
`current_coverage.expiration_date`, `current_coverage.liability_limits`,
`current_coverage.deductibles`, `history.incidents[]` (type, date), `notes`.

### Home — required
`contact.*` (same as auto), `property_address.*` (same shape), `ownership_status`
(own / buying / renting).

### Home — optional
`property.type`, `property.year_built`, `property.square_footage`,
`property.construction_type`, `roof.material`, `roof.year_replaced`,
`current_coverage.carrier`, `current_coverage.expiration_date`,
`current_coverage.dwelling_amount`, `desired.dwelling_amount`, `desired.deductible`,
`features` (pool, trampoline, wood_stove, security_system, home_business),
`history.claims[]`, `notes`.

**Deliberate design choice:** required fields are kept to the true minimum. Every optional
field improves the quote but none blocks submission. A half-complete lead that reaches a
human beats a complete lead that was abandoned at validation.

---

## 6. Business rules worth encoding

- **NC only.** The agency is licensed in North Carolina. A non-NC address must return a
  clear rejection, not a silent failure: `"We're licensed in North Carolina only."`
  Better to say so at the API than waste the customer's time.
- **Every household driver.** The schema should carry a comment and the endpoint a
  warning (not a rejection) when `drivers[]` has one entry but the request implies a
  household — NC carriers require all licensed household drivers listed or excluded, and
  this is the top cause of a quoted price changing.
- **No price promises.** Response copy must never imply a rate. Intake only.
- **50/100/50** is the NC minimum for policies issued/renewed on or after July 1, 2025 —
  validate any `liability_limits` against that floor and flag, don't reject.

---

## 7. Security and abuse

This is the part that decides whether this is safe to expose.

- **Rejected-by-schema fields.** `additionalProperties: false`, plus an explicit denylist
  that hard-rejects any payload containing `ssn`, `social_security`, `drivers_license`,
  `license_number`, `card_number`, `account_number`, `routing`, or `password`. If an agent
  sends one, return 400 and **do not persist the payload**, not even to logs. This mirrors
  the public promise on `/what-we-need-to-quote-you/`.
- **Rate limiting.** Per-IP and global. Cloudflare Rate Limiting rule at the edge, plus a
  D1-side daily counter. The StreamPlayer incident is the precedent: a runaway loop now
  bills silently, so a hard global ceiling with a kill switch is required, not advisory.
- **Payload cap.** 32 KB. Reject larger outright.
- **No file uploads.** Declarations pages continue to go through the existing
  `upload-policy.html` flow, which already has its own handling.
- **PII at rest.** D1 rows contain name, contact, address, DOB, VIN — real PII. Retention
  policy required before launch: propose purge at 180 days for leads that never converted.
  Nobody has decided this yet; it is a Bill decision.
- **Logging discipline.** Log the reference number and validation outcome. Never log the
  full body.

---

## 8. How Bill actually sees the lead

Unchanged from the current forms, deliberately — no new place to check:

1. **SMS to Bill's cell** — name, line of business, city, reference number.
2. **Email to docs@** — the full structured intake, rendered as the same readable HTML
   layout the current forms produce, so it drops into the existing workflow.
3. **Optional later:** a row in the Task Board (`board_tasks` in `ai-task-manager-db`),
   so intake becomes a claimable task. Worth doing only if volume justifies it.

---

## 9. Discoverability

An endpoint nothing points at is invisible. On launch:

- Add to `llms.txt` under a `## For AI Agents` section, with both `/v1/schema/*` URLs.
- Link from `/what-we-need-to-quote-you/` — the human page and the machine contract should
  reference each other.
- Consider `Organization.potentialAction` schema on the homepage pointing at the endpoint.
  (Note: this is not a documented Google feature and will not produce a rich result — it
  is speculative, aimed at agent crawlers, and should be labeled as such.)

---

## 10. Build estimate

| Stage | Work |
|---|---|
| 1 | Worker skeleton + routing + JSON Schema validation, both lines |
| 2 | D1 table + migration + reference-number generation |
| 3 | Notification path (reuse existing Twilio + docs@ email templates) |
| 4 | Rate limiting, denylist, payload cap, kill switch |
| 5 | Public schema endpoints + llms.txt wiring |
| 6 | End-to-end test from a real agent (Claude/ChatGPT) as acceptance |

Stages 1–3 are the minimum viable path; 4 is non-negotiable before it is public.

---

## 11. Open decisions for Bill

1. **Build now, or wait for Phase 4 data?** My recommendation: wait. Ship the GA4 AI
   Referrals channel group, watch one quarter, build if the number moves.
2. **PII retention window.** 180 days proposed. Needs a real answer before launch.
3. **Task Board integration** — now, or only if volume justifies it?
4. **Non-NC requests** — hard reject, or capture and refer out?
