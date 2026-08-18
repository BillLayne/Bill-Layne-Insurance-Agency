# BLI After-Hours Voice Assistant

An ElevenLabs Conversational AI agent that answers when the Elkin office is
closed. It triages the call, hands out 24-hour carrier claim numbers, and takes
a message for callback. It is **not** licensed to sell, quote, or bind anything.

## Agent

| | |
|---|---|
| Name | BLI After-Hours Assistant (DollarBill) |
| Agent ID | `agent_6801m0bgqxpxeycbgmkr0w1h3n44` |
| Voice | DollarBill (`ZGL4RqYbsD7HrIin7SI1`) — casual, energetic, on-brand |
| Language | English (answers in Spanish if the caller speaks Spanish) |
| Status | **Draft — no phone number attached** |

Test it in the browser: <https://elevenlabs.io/app/talk-to?agent_id=agent_6801m0bgqxpxeycbgmkr0w1h3n44>

## Guardrails

These are the whole point. The agent will never:

1. Quote, estimate, or hint at a price, premium, rate, or discount.
2. Say whether something is or isn't covered, or interpret a policy.
3. Add, remove, change, bind, reinstate, or cancel coverage.
4. Take a card number, bank account, or full SSN.
5. Give legal advice or advise whether to file a claim.
6. Invent a carrier, phone number, or staff name — it says "I don't know"
   and falls back to 336-835-1993.
7. Claim to be a human. Asked directly, it says it's an automated assistant.

Anyone hurt, a fire, or a wreck in progress → it stops and says call 911.

## Carrier claim numbers it reads out

Sourced from `claims-center/index.html`. **Keep the two in sync.**

| Carrier | 24-hour claims |
|---|---|
| Progressive | 1-800-776-4737 |
| Travelers | 1-800-252-4633 |
| Nationwide | 1-800-421-3535 |
| National General | 1-800-468-3466 |
| Foremost | 1-800-527-3907 |
| Dairyland | 1-800-334-0090 |
| Universal Property | 1-888-438-7734 |
| NC Grange Mutual | 1-800-849-7775 |

Alamance Farmers Mutual and Hagerty have no claims number published on the
site, so the agent is told **not to guess** — it takes a message instead. Add
them to the site and to the prompt when you have them.

## Knowledge base

Three auto-syncing URL documents, so site edits flow through automatically:

- `ah4KiKIjTaT7Bow3AleV` — homepage / agency overview
- `KaqeaTEaidTxDpo1No3a` — claims center & carrier claim numbers
- `nqeuSHKp5ue4ciF3cKz8` — carriers we represent

## Facts baked into the prompt

Elkin office 1283 N Bridge St, Elkin NC 28621 · 336-835-1993 ·
Save@BillLayneInsurance.com · Mon–Fri 9–5 · independent since 2005 ·
Spanish desk Aseguranza Comunidad Unida, 209 S Main St, Dobson NC 27017,
336-356-2200, Rosa Jimenez.

## Not done yet

- **No phone number.** Nothing is answering a real call until a Twilio or SIP
  number is bought and attached.
- **Messages go nowhere but ElevenLabs.** Transcripts and summaries live in the
  ElevenLabs dashboard. A post-call webhook to email or the CRM is the next
  step so overnight messages land in front of the team at 9am.
- **No load/accuracy testing** against real recorded calls.
