# BUYER / SELLER treatment switch — design spec

Goal: add a SELLER text version alongside the current BUYER-only text, with a
dev dropdown to switch, built so it ports back to nodegame with near-zero rework.
Source of the nodegame facts below: Kerem (nodegame-integration session),
verified against `game/client_types/canServer/other/instruction2_text.js` and
related files on 2026-10-05.

## How nodegame does it (the thing we must stay compatible with)

- `getTextList(settings)` holds two parallel arrays: `textList_buyer` and
  `textList_seller`. Same ids, same order, ONE object per PAGE.
- Page object shape: `{ id, title, main (HTML string), extra, extraButton? }`.
  The whole page body is one HTML string (paragraphs joined by `<br><br>`).
- Dynamic bits are template literals read from a `settings` object:
  `${currencySymbol}`, `${exchangeRate}`, `${settings.NUM_OF_SELLER_TASKS}`,
  `${settings.NUM_OF_BUYER_TASKS}`, `${settings.NUM_OF_REPRESENTATIVE_TASKS}`.
- Delivery is SERVER-RESOLVED, client is DUMB:
  `textList = settings.TREATMENT === "BUYER" ? textList_buyer : textList_seller;`
  The client gets ONE already-chosen list via `setup-instruction2-CLIENT
  {textList, lastFinishedPage}` and just renders it. It never sees the other
  treatment and never branches on treatment.
- Treatment is a SESSION-LEVEL setting fixed before the stage
  (`game.settings.js` `TREATMENT`, or waitroom round-robin). The instructions
  layer only READS `node.game.settings.TREATMENT`; it never decides it.

## The three seam invariants our switch must preserve

1. Client stays dumb: the switch resolves ONE list/value set up front; render
   code never branches on treatment.
2. Treatment is a single read of a session setting (here `App.config.TREATMENT`);
   the dropdown is a dev-time override of that one read, nothing more.
3. Dynamic numbers/currency come from a settings object via interpolation, not
   hardcoded in the body text.

## Resolution-location caveat (Kerem, 2026-10-05) — critical for the port

Between-subjects integrity: in nodegame, treatment-varying TEXT is resolved
SERVER-side and ONLY the chosen set crosses the wire, so a curious participant
can never inspect the other condition's framing. Our client-side resolution is
correct for a serverless prototype AND round-trips cleanly, but ONLY if:

- TEXT resolution stays a SINGLE relocatable seam: all treatment-varying strings
  live in ONE data block keyed by treatment, picked by ONE read of
  `App.config.TREATMENT`. At port time Kerem repoints that one read to the server
  (`getTextList`) and ships only the resolved set. If resolution gets scattered
  inline across scene/render code, every site has to be hunted down. So: never
  branch on treatment inside render/scene code for TEXT — funnel it through the
  single resolver.
- TEXT vs BEHAVIOR split: only treatment-varying TEXT needs the server-resolve
  seam. Behavioral/scene differences (seller discloses reviews vs buyer bids,
  role-dependent widgets) stay CLIENT-side and may read `App.config.TREATMENT`
  directly (nodegame's client reads `parent.node.game.settings.TREATMENT` for
  role UI). Do NOT rotate scene/behavior logic through the text seam.
- Treatment-varying DIRECTIVE/INFO strings count as TEXT: route them through the
  resolved set, and TAG them in the data shape so Kerem routes them correctly
  (today the live deck keeps non-varying DIRECTIVE/INFO client-side; varying ones
  move to text).

## Our approach (Option A — keep the fine-grained deck)

We do NOT collapse our deck into one-string-per-page. Our reimagined slides have
staged `steps[].text[]`, scene fragments, directives and info boxes; that staging
is the point of the redesign. Instead:

- Every treatment-VARYING user-facing string becomes a per-treatment variant,
  resolved at mount by a single resolver that reads `App.config.TREATMENT`.
  (Exact data shape TBD by the switch-implementation agent; candidates: a
  `{buyer, seller}` pair per string, or a parallel `SLIDES_SELLER` built from the
  same template. Whichever is chosen must keep render code treatment-agnostic.)
- Strings that are identical across treatments stay single (the map proves which).
- Round counts, currency symbol and exchange rate move OUT of the body text into
  an `App.config` settings block and are interpolated, mirroring nodegame's
  `${settings.*}`. (Today e.g. "5 main rounds and 2 additional rounds" is
  hardcoded in content.js — parameterize it.)
- The dropdown: same pattern as the debug slide-jumper (`<select>` built in
  `setupDebug()`), dev-only, sets `App.config.TREATMENT` and re-mounts. It
  simulates "which list the server would have sent."

Port story: our per-slide resolved text maps into nodegame's per-page `main`
strings at port time (the deck is already a reimagining, so slide→page mapping is
Kerem's job regardless). What makes the port cheap is the three invariants above,
not a 1:1 structural match. Kerem will confirm our final data shape round-trips.

## Seller content — reuse the real nodegame wording where slides overlap

Seller framing = 2nd person "you are the seller / your product"; the buyer
becomes "the seller / your bid" flips to "the buyer / their bid". Reuse the real
`textList_seller` wording (supplied by Kerem) where our slides overlap. Key
reusable lines (abridged):

- intro: "You are a seller." Stars earned convert to Pounds at £5 per star.
- random-value: "As a seller, you produce a hypothetical product. The true value
  is randomly determined. You cannot influence or choose it." (1.0 to 5.0 stars)
- review-1: "As a seller, you know the product's true value, but cannot directly
  tell it to the buyer. Instead, you have 10 product reviews that you can choose
  to show..."
- review-2: "As a seller, you choose which of the 10 reviews to show to the
  buyer. You can show none, some or all..."
- trade-1: "The buyer only observes the reviews you choose to show, and then
  places a bid. A trade only happens if the buyer's bid is equal to or higher
  than the sales price. A sale price is randomly determined within ±1.0 star of
  the true value."
- trade-2 (earnings): seller earns the buyer's bid minus production cost
  (true value − 0.3); the higher the buyer bids, the more you earn. Buyer earns
  true value − sales price. No trade: neither earns anything.
- trade-tip: framed about the BUYER's optimal strategy even on the seller side:
  "It is best for the buyer to bid what they think the true value is."
- payment / payment-2 / outro: SELLER-specific, see asymmetries below.

### Agreed reimagined-deck change (NOT in the live file yet)
Seller takeaway close is exactly: "You earn what the buyer bids minus your
production cost." Kerem carries this into `instruction2_text.js` at port time.

## Decisions & settings values (2026-10-05)

Settings values from nodegame `game.settings.js` (Kerem, verified) — these become
an `App.config` settings block and are interpolated into text (mirroring
`${settings.*}`), never hardcoded in body prose:
- NUM_OF_SELLER_TASKS = 5
- NUM_OF_BUYER_TASKS = 5, NUM_OF_REPRESENTATIVE_TASKS = 2  (confirms "5 main + 2 additional")
- currencySymbol = '£', exchangeRate = 5 (£5 per star)
- MAX_BONUS_PAYMENT_BUYER = 17, MAX_BONUS_PAYMENT_SELLER = 32

OPEN DECISION (Can) — payment numbers source of truth: the LIVE nodegame text
literals say buyer "±£10 per round" and seller "up to £25", but the real settings
caps are 17 / 32 — the live file is internally inconsistent. The per-round ±£10
"swing" has NO setting at all (pure prose). For now the switch keeps whatever the
prototype CURRENTLY displays, but moves the cap/swing into explicit `App.config`
fields (single knob) tagged TODO, so the value is one decision, not scattered.
Decide the real numbers with coauthors (candidate for the Oct 6 call).

### Slide 5 ('bid' / predict-the-value drill) — resolution
KEEP slide 5 in both treatments; the interaction is unchanged (behavior stays
client-side). For the SELLER, REIMAGINE all of its text — main instructional text,
the purple directive, the blue accent lines, and the "guess the product's true
value" prompt — so it reads in the seller's voice as perspective-taking on how a
buyer forms a guess and bid from the disclosed reviews. It remains fundamentally
about the BUYER's decision; the seller steps into the buyer's shoes to see how
disclosure moves the bid. Treat as a full seller-voice rewrite (mark REVIEW), not
a mechanical pronoun swap.

### Next-button hint layer interaction
The Next-button agent added an `ACTION_HINT` map (keyed by slide id) and gate
visuals in stage.js. Those hint strings are treatment-varying TEXT too (a seller's
required-action wording differs), so they must be folded into the resolved text
set and tagged, same as directives/info. Do not clobber that gate-affordance layer.

## Implementation status (2026-10-05)

Switch BUILT. New file `js/left/treatment.js` is the single seam:
`App.TEXT_VARIANTS = { key: { buyer, seller, kind } }` (kind ∈
narrative|directive|info|action-hint); `App.resolveText()` = the single read of
`App.config.TREATMENT` → flat `App.text`; render/scene code uses `App.T('key')`
only. Numbers in `App.settings`, interpolated via `App.interp`. `content.js` →
`App.content.build()` rebuilds SLIDES/INFO in place. Dropdown in the `?debug` bar +
`?treatment=seller|buyer` deep-link. `?v=120`. Not deployed.

- Seller EARN-ONLY confirmed (Kerem's verified nodegame info): seller gets one
  round picked, a cap, two-week delay; only the BUYER can earn-or-lose. The MAP's
  "sellers can go negative" aside was wrong; the design doc / implementation are
  right. RESOLVED.
- Legacy `config.js` DIRECTIVE (5/6/7/8) confirmed benched/unwired; the live hints
  are the resolved ACTION_HINT layer. Left as-is.
Port round-trip CONFIRMED by Kerem (green light, no shape changes). The `kind`
tag is his routing signal: narrative → page.main/extra (server-resolved, must not
leak); directive/info → moved into the resolved set when varying; action-hint →
folded into page.main (concatenated) at port. Our "identical strings stay inline"
is cleaner than the live file (which duplicates every string across both arrays).
Two conventions to honor so his mapping isn't redone:
- KEEP App.TEXT_VARIANTS keys STABLE (don't rename later); he maps slide→page-field
  against those keys once.
- OPTIONAL future nicety: an optional `targetPage` hint per varying string (e.g.
  'trade-2') saves him a lookup. Not required (mapping is his job regardless).

- STILL OPEN for Can / coauthors:
  - Payment caps/swing source of truth. [Oct 6] Sharper now: Kerem has ALREADY
    fixed the live seller cap to settings-driven ${MAX_BONUS_PAYMENT_SELLER}=32
    (consent page already shows £32). The BUYER "±£10/round" is the live problem:
    it has NO setting, disagrees with the £17 total cap, AND disagrees with the
    game math (price is ±1 star of value → ~±£5/round, not £10). Can's ruling
    (new per-round setting vs restate as a total vs fix the number) sets the shared
    truth for BOTH decks. Our cap/swing stay config placeholders until then.
    Precision on "earn-only": both treatments have MIN_BONUS_PAYMENT=0; the buyer's
    "loss" is framed as a deduction from OTHER bonuses, not this task ending below
    zero. The instruction FRAMING (seller earn-only, buyer earn-or-lose) is what we
    implemented and it is correct.
  - The examples (examples-intro, ex-bid-1/2, exBid recap/advice) are STUBBED for
    seller (buyer text kept, flagged TBD) — the seller's examples analogue is a
    design decision (open question #2). `lessons` takeaway IS resolved to seller,
    so there's a mild framing seam until seller examples are designed.
  - Slide 5 seller reimagining: kept the bid interaction, relabeled to the buyer's
    perspective ("Place the buyer's bid" / "The buyer's bid" / "From these reviews,
    what would the buyer guess?"). Confirm this matches intent.

## Treatment asymmetries (NOT pure pronoun swaps — real content differences)

- Payment structure differs:
  - SELLER: `NUM_OF_SELLER_TASKS` rounds, ONE round randomly picked as bonus,
    max ~£25, may take up to two weeks (depends on a real buyer's bid in a
    follow-up experiment). Earn only.
  - BUYER: `NUM_OF_BUYER_TASKS` main + `NUM_OF_REPRESENTATIVE_TASKS` additional
    rounds, TWO rounds picked (one each), can EARN OR LOSE, ±£10/round, losses
    deducted from other payments.
- intro: seller "earn" vs buyer "earn or lose".
So the switch agent must treat payment/intro slides as structurally different
content, not a mechanical rewrite. See SELLER-SWITCH-MAP.md for the per-string map.
