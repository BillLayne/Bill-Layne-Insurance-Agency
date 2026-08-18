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

## Model settings that matter

These were set deliberately after testing exposed real failures. Don't
change them casually.

| Setting | Value | Why |
|---|---|---|
| `thinking_budget` | `0` | With thinking on, the model spoke its own reasoning aloud mid-call ("The user is still trying to... I need to reiterate..."). Setting this to 0 was the only thing that stopped it. |
| `end_call` tool | **removed** | The agent kept hanging up right after learning the caller's carrier, before ever reading them the number. Narrowing the tool description did not stop it; taking the tool away did. The agent now cannot hang up at all. |
| `silence_end_call_timeout` | `30` | With `end_call` gone, this is what closes the line — 30 seconds after the caller stops talking, so calls don't hang open. |
| `temperature` | `0` | Deterministic-ish phrasing for a compliance-sensitive script. |
| RAG | enabled | Over the three auto-syncing site documents. |

## Test suite

Six adversarial simulation tests live in the ElevenLabs workspace. They are
not decoration — running them found five real defects that a read-through of
the prompt would not have caught:

1. It gave the right claims number but never said the line was open 24
   hours, so the caller would have waited until 9am for nothing.
2. It spoke its own internal reasoning aloud to the caller mid-emergency
   ("The user is still trying to... I need to reiterate...").
3. It told a caller with a dented mailbox to hang up and call 911.
4. It asked which carrier the caller had and then hung up without ever
   reading them the number — the single most important thing it does.
5. It handed out a *claims* line to someone asking about a *payment*.

All five are fixed. Final state: **16 of 16 completed runs passing**
(6 tests x 3 repeats), claims number delivered in 6/6 claim-path runs, and
no reasoning text leaking into speech across any run.

Re-run the whole suite after any prompt edit — several of these defects
appeared in only 1 run out of 3, so a single pass is not evidence.

| Test | Covers |
|---|---|
| Refuses to quote a price under pressure | Caller pushes 3+ times for any dollar figure |
| Claim triage: correct Progressive number | Right number + "open 24 hours, don't wait on us" |
| Won't bind coverage or invent a carrier number | Refuses to bind; refuses to guess Alamance's number |
| Injury emergency deflects to 911 immediately | First words are 911, no clarifying question |
| Refuses card details on a billing call | Stops the caller mid-card-number |
| Minor wreck with no injury is NOT a 911 call | Guards against the 911 over-trigger |

## Not done yet

- **No phone number.** Nothing is answering a real call until a Twilio or SIP
  number is bought and attached.
- **Messages go nowhere but ElevenLabs.** Transcripts and summaries live in the
  ElevenLabs dashboard. A post-call webhook to email or the CRM is the next
  step so overnight messages land in front of the team at 9am.
- **Alamance Farmers and Hagerty claims numbers** are still missing from the
  site and therefore from the agent.
- **Not yet tested against real recorded calls**, only simulations.
