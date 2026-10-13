# CODE-REVIEW.md — port-readiness & code-quality review

Read-only review of the standalone `LIVE-left-proto` instructions deck, focused on
(1) dead/redundant code, (2) correctness/fragility, (3) the three nodegame port seam
invariants, and (4) a lightweight validation suite to adopt before/during the port.

Scope note: the `exBid` scene's caption CSS / micro-offsets are being edited live by another
agent and are deliberately **not** reviewed here. All JS passes `node -c`. No files were changed.

## Summary

The port seams are in good shape: `App.resolveText()` is a genuine single read of
`App.config.TREATMENT` for TEXT, numbers are interpolated from `App.settings`, behavior
scenes read `TREATMENT` directly (allowed), and `App.bridge` (setup/visited/done) is wired at
the right choke points with no stray `parent.node` calls. The main port risks are (a) two
direct treatment branches in `content.js` that vary *slide/step structure* outside the resolver,
and (b) the bidding-example scene carrying treatment-varying strings hardcoded in scene code
(buyer-framed for both treatments — a known, tagged stub). Everything else is low-severity
dead code and drift from many rapid edits.

Findings by severity: **HIGH 0 · MED 6 · LOW 11.**

---

## 1. Dead / redundant code

- **MED — `App.config.INFO`, `DIRECTIVE`, `CONDITION`, `MIN_SLIDE`, `N_SLIDES`, `COLOR`,
  `DICE_IMG`, `BLUE_DICE_IMG` are all dead.** `js/config.js:29-107`. Verified zero references
  outside `config.js`: the deck's info boxes live in `App.content.INFO` (`content.js`), the
  action hints live in `actionHint()`/`App.T('hint.*')` (`stage.js:17`), dice icons are
  inlined in `setControls` (`stage.js:80`), and scenes hardcode the above/below rgba colors
  rather than reading `COLOR`. `CONDITION`/`DIRECTIVE` are the old slide-number model (the only
  mention is the comment at `stage.js:13` saying they "do not map to these slides"). `N_SLIDES:13`
  is stale (the live deck has a different count). Recommendation: delete the whole legacy block
  (`SIGMA`/`REVIEW_COUNT`/`BOUNDS`/`TV_RANGE`/`PRICE_BAND` must stay — `rng.js:5` destructures them).
- **LOW — `PROD_COST_OFFSET: 0.3` is orphaned.** `config.js:10`. `rng.js` does not destructure it
  and scenes hardcode `0.3` (`scenes.js:452,456,554`). Either wire the scenes to it or drop it.
- **LOW — `App.settings.PER_ROUND_SWING` is orphaned.** `treatment.js:41`. Defined as a "single
  knob" for the ±£10 swing, but no slide text interpolates it (the bonus text uses
  `MAX_BONUS_DISPLAY_*`, not swing). Keep only if the swing prose is reintroduced; it is tagged
  TODO already.
- **LOW — `TEXT_VARIANTS['lessons.5']` is defined but never rendered for either treatment.**
  `treatment.js:201-203`. `content.js:143-145` builds seller from `lessons.0-.3` and buyer from
  `lessons.0-.4`; `lessons.5` is in neither list. Comments say it is parked (Stefan's agreed
  close) so re-adding is one array append — acceptable to keep, but it is genuinely orphaned today.
- **LOW — `TEXT_VARIANTS['lessons.4'].seller` is an empty string, and never rendered.**
  `treatment.js:197`. Confirmed safe: seller's step list stops at `lessons.3`, so the `''` is
  never shown. Note the fallback logic (`treatment.js:271`) treats `''` as present (not null), so
  if `lessons.4` were ever added to the seller list it would render a blank `<p>` rather than
  falling back to buyer text.
- **LOW — benched scenes `price` (`tradeScene(false)`), `earnings` (`tradeScene(true)`),
  `market` are exported but unreachable.** `scenes.js:349-475,677-784,812`. No active slide uses
  `scene:'price'`/`'earnings'`/`'market'` (slide 6 uses `priceInfo`; the earnings and
  strategy-market slides are commented out in `content.js:92-101,152-158`). `tradeScene` (~125
  lines) and `market` (~110 lines) are dead in the current deck. Comments mark them intentionally
  parked — fine to keep, but tag clearly as "parked, not in the deck."
- **LOW — commented-out slides reference `scene:'exDisp'`, which is not exported.**
  `content.js:149-151` vs `scenes.js:812`. Latent: if the `ex-disp-*` slides are uncommented,
  `active` resolves to `null` and the slide renders with no stage (silent, no throw). Add `exDisp`
  to the export or delete the dead slides when that feature is decided.
- **LOW — `priceInfo.leave()` references members that are never assigned.** `scenes.js:532`
  reads `this._t1`, `this._t2`, `this._s6t`; only `this._th` is ever set (`scenes.js:529`).
  Harmless (guarded), but dead cleanup from an earlier shape.
- **LOW — `config.js:11-14` comment block ("9-slide model") and the `?reset` comment
  (`app.js:3`) are stale** — there is no persistence and the deck is not 9 slides.
- **LOW — shared module-level `dTimers`** (`scenes.js:265`) is still shared across `disclosure`
  and the two (now-unused) `tradeScene`s. Latent fragility flagged in REVIEW.md; currently only
  `disclosure` uses it live, so benign until a parked scene returns.

TEXT_VARIANTS ↔ usage key-consistency (full cross-check done): every `T('key')` and every key
pushed via the `.map` step-lists in `content.js` resolves to a defined variant; **no `T()` call
references an undefined key** (so nothing renders "undefined"). The only defined-but-unused key
is `lessons.5` (above).

## 2. Correctness / fragility

- **MED — explore-gated slides can dead-end with no safety-net timer.** Slide 3 `reviews`
  unlocks Next only via `onInfoClosed → _reveal → openGate` (`scenes.js:257,247`); slide 6
  `priceInfo` needs explore-A closed (→ stage 2) then explore-B closed (→ part C OK → gate)
  (`scenes.js:493-496,520-523`). A participant who never opens an explore button is stuck with a
  disabled Next. This is the intended "mandatory explore" design (COAUTHOR-FEEDBACK), and there is
  now an `actionHint` affordance (`stage.js:19-20`), but unlike the benched slide-7 scene
  (`scenes.js:373`, 25 s fallback) there is no timed fallback. Recommendation: decide explicitly
  whether the hint is sufficient or add a guarded first-visit fallback timer (REVIEW.md item 1).
- **MED — scenes key off hardcoded step indices while `content.js` varies step count by
  treatment.** `twoPanel` reveals its image at `onStep idx===2` (`scenes.js:211`); `disclosure`
  keys idx 0/1/2 (`scenes.js:307-311`); `exBid` keys idx 0-5 (`scenes.js:628-637`). Meanwhile
  `content.js:37-39` gives seller 7 twoPanel steps vs buyer 6. This happens to be safe today
  because both treatments share the identical first three keys (`twoPanel.0/.1/.2`) before
  diverging at index 3, so idx 2 means the same thing. But the coupling is fragile: any reorder
  that shifts a keyed index silently breaks the reveal. Recommendation: have scenes reveal on a
  semantic marker (e.g. a `step.reveal` flag in the slide data) rather than a literal index.
- **LOW — trade/bid scenes re-randomize on Back instead of restoring exact tv/bid/price.**
  Slide 5 `bid.enter` calls `fresh` (`scenes.js:343-344`), slide 6 draws a fresh price on revisit
  (`scenes.js:381`). The revisit path renders a valid final state, so no bug, but the shown
  numbers differ from first pass (REVIEW.md flagged; matches the known no-persistence gap in
  PORT-PIPELINE §3).
- **LOW — no stray `${...}` tokens leak.** Verified every interpolated token
  (`currencySymbol`, `exchangeRate`, `NUM_OF_*`, `MAX_BONUS_DISPLAY_*`) is defined in
  `App.settings`; `App.interp` leaves unknown tokens intact, so a typo would surface as visible
  `${...}` — none found today.
- **LOW — nothing throws if `TREATMENT` is unset.** `treatment.js:266`, `content.js:37,143`,
  `scenes.js:548` all compare/`||`-default safely; `App.config` is guaranteed by `config.js`
  loading first (`index.html:59-61`).
- **LOW — stale/contradictory comment on the seller takeaway length.** `treatment.js:198` says
  "seller arc is 5 lines, ends on lessons.4"; the code (`content.js:143-145`) and the adjacent
  comment (`treatment.js:197`) say 4 lines ending on `lessons.3`. Fix the comment so the port
  owner is not misled.

## 3. Port-readiness — the three seam invariants

Invariant (a) — all treatment-varying TEXT resolves through the single read in
`App.resolveText()`; render/scene code never branches on treatment for TEXT:

- **PASS, with two exceptions.** The single read is `treatment.js:266`; `App.T()` is the only
  text accessor used by render/scene code. Exceptions:
  - **MED — `content.js:37-39` and `content.js:143-145` read `App.config.TREATMENT` directly**
    to choose *which keys* (and how many) go into the `twoPanel` and `lessons` step lists. The
    text itself still comes from the seam, but the *structure* (step count/order) branches on
    treatment outside the resolver. This is the single most important port item: at port time
    Kerem resolves per-page `main` server-side, so a client that varies slide structure by
    treatment needs that structure folded into the resolved set too (or these two branches
    documented as structural, not text). Keep the branches funneled here (not scattered into
    scenes) and tag them for the port.
  - **MED — `exBid` carries treatment-varying strings hardcoded in scene code, not in
    TEXT_VARIANTS.** `scenes.js:542-564`: `recapFor`, `captionFor`, `qualFor` and the
    "You overbid/underbid" copy are buyer-framed and shown to BOTH treatments. This is a known,
    tagged stub (`/* REVIEW: seller examples TBD */`, SELLER-SWITCH open question #2), so it is
    not a live bug — but it is the clearest "treatment-varying TEXT not behind the seam." When
    seller examples are designed, route these through `App.TEXT_VARIANTS`, do not branch inline.

Invariant (b) — behavior/scene differences stay client-side and are the only place reading
`TREATMENT` directly:

- **PASS.** The only behavioral treatment read is `scenes.js:548`
  (`isBuyer` → which single payoff cell to show). That is exactly the allowed pattern
  (role UI/behavior, not text).

Invariant (c) — numbers/currency come from `App.settings` via interpolation, not hardcoded:

- **PASS for user-facing prose.** Round counts, currency, exchange rate and caps are all
  `${...}` tokens in `treatment.js` (e.g. `payment.0`, `bonus.1`). The one open item is the
  cap/swing source-of-truth (`treatment.js:38-41` TODO) — a decision, not a code defect.
- **LOW drift (not prose):** scenes hardcode the model constants `0.3` production cost
  (`scenes.js:452,456,554`) and the `±1` price band / above-below colors, duplicating values that
  also live in `config.js`. Not a seam violation (these are not interpolated into text), but a
  single source would prevent drift.

Port seams (`App.bridge`) — intact:

- `setup()` fires once in `mount()` (`stage.js:372`) — the place to receive
  `{textList,lastFinishedPage}` + jumpTo.
- `visited(slide)` fires exactly once, the first time a gate opens, inside `unlockNextSoon`
  (`stage.js:126`) — the `lastPageCompleted` anchor.
- `done(durationMs)` fires on the terminal "Done" Next (`stage.js:388`).
- No `parent.node.*` calls exist yet (grep clean) — the standalone is pure DOM, exactly as
  PORT-PIPELINE §5 requires. The `switchTreatment` dev path (`stage.js:341-348`) correctly
  re-resolves text and rebuilds content in place, mirroring "which list the server would send."

## 4. Recommended lightweight validation suite (adopt before/while porting)

All of these are cheap, scriptable, and catch the exact drift classes found above. (Scripts are
illustrative — do not add them as part of this review.)

1. **`node -c` on every JS file** (already clean here). Catches syntax breakage from rapid edits
   before it reaches a browser. `for f in js/**/*.js; do node -c "$f" || exit 1; done`.
2. **`parent.` grep gate.** Fail CI if a new `parent.` appears outside `typewriter.js` and the
   `bridge.js` comments. Catches accidental early coupling to the nodegame frame that would break
   the standalone and bypass the single seam.
3. **Build-both-treatments headless smoke check** (the highest-value one). In jsdom/Node, load
   config→treatment→content, then for each treatment call `App.resolveText()` + `App.content.build()`
   and assert: (i) no resolved string still contains `${`; (ii) every key referenced by the built
   step lists exists in `App.TEXT_VARIANTS`; (iii) slide count and each slide's step count are
   within sane bounds and non-zero. Catches undefined `T()` keys, stray tokens, and
   treatment-dependent step-count regressions (finding 2/3a). Sketch:
   ```js
   ['BUYER','SELLER'].forEach(tr => {
     App.config.TREATMENT = tr; App.resolveText(); App.content.build();
     for (const k in App.text) if (/\$\{/.test(App.text[k])) throw `stray token in ${k} (${tr})`;
     App.content.SLIDES.forEach(s => (s.steps||[]).forEach(st =>
       (st.text||[]).forEach(t => { if (t == null) throw `null step text in ${s.id} (${tr})`; })));
   });
   ```
4. **TEXT_VARIANTS ↔ usage key-consistency check.** Grep all `T('…')` literals plus the keys in
   the `.map` step-lists, diff against the defined `TEXT_VARIANTS` keys, and report both
   directions: keys referenced-but-undefined (renders blank) and keys defined-but-unused (dead,
   e.g. `lessons.5`). Keeps the single text block honest as it is edited.
5. **Dead-config guard (optional).** Grep each `App.config.*` field for a use outside
   `config.js`+`rng.js`; flag zero-use fields. Would have surfaced the whole legacy block in §1.

## Do these first for the port

1. **Resolve the two `content.js` treatment branches** (`content.js:37-39,143-145`): document
   them as *structural* (step-count) differences for the server-resolve mapping, or fold the
   structure into the resolved set. This is the top seam item (invariant a).
2. **Decide the `exBid` seller story** and, if seller examples ship, move
   `recapFor`/`captionFor`/`qualFor`/overbid copy into `TEXT_VARIANTS` (`scenes.js:542-564`) —
   do not inline-branch.
3. **Adopt checks #1–#3** (node -c, `parent.` gate, build-both-treatments smoke) as the port's
   minimum gate; they directly cover the regressions this deck is prone to.
4. **Decide the explore-gate safety net** (slides 3 and 6) before trial — hint-only vs a guarded
   fallback timer (`scenes.js:247,520`).
5. **Dead-code sweep** the legacy `config.js` block, orphaned `lessons.5`/`PER_ROUND_SWING`/
   `PROD_COST_OFFSET`, and tag the benched `tradeScene`/`market`/`exDisp` scenes clearly as parked.
6. **Fix the stale comments** (`treatment.js:198` seller line count; `config.js` "9-slide model";
   `app.js` `?reset`) so the port owner reads accurate intent.
