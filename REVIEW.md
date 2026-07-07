# Instructions prototype — review & tracking design

Multi-agent review (correctness, UX, nodegame-portability) + interaction-tracking
design. All findings adversarially verified; severities are the verified ones.
Standalone prototype / GitHub-Pages demo, so most items are quality/robustness.

## Priority findings

### Gates & dead-ends (can strand a paid participant)
- **Slide 3 — no fallback (MEDIUM).** Next unlocks ONLY if the participant opens
  and closes the inline `i`. A participant who ignores the 16px `i` is stuck with
  a disabled Next forever. This is intentional (info-first), but there is no
  safety net. Fix: add a guarded first-visit fallback timer that reveals + opens
  the gate after ~25–30s even if the info was never opened, OR make the `i` read
  as clearly required.
- **Slide 4 — die never arms the gate (MEDIUM).** Gate arms on auto-tick or a
  manual bar click, but NOT on pressing the die — yet the guide text invites die
  use ("…or press the die for a new true value"). A participant who only uses the
  die is soft-stuck. Fix: `armGate()` in `disclosure.step()`, or reword the guide.

### Accessibility
- **No `prefers-reduced-motion` (MEDIUM).** Many infinite animations run
  continuously (nav breathe, info jiggle+glow, example sign-flip, die nudge, held
  die pulse). Add a reduced-motion block that disables them.
- **Sliders unlabeled; typewriter skip mouse-only (LOW).** Add `aria-label` to the
  range inputs; allow Enter/Space to skip the typewriter.

### Leaks / robustness (all LOW)
- Dist Chart.js instance not destroyed if you navigate with the info panel open
  (`go()` hides the panel directly instead of `closeInfo()`).
- Slide 5 `bid` scene has no `leave()` (harmless timer/typewriter dangle).
- Shared module-level `dTimers` reused across disclosure + both trade scenes
  (works because one slide is active at a time; latent fragility).

### Revisit / pacing / cache (LOW)
- Trade slides re-randomize on Back instead of restoring exact tv/bid/price.
- ~40s of first-pass stage animation is unskippable (click-to-skip only skips the
  left text, not stage sequences).
- JS modules are not cache-busted while CSS is (`?v=NN`).

### Mobile (LOW)
- `.lx-pf { gap:100px }` has no narrow-screen override (can scroll on tiny phones).

### Dead code (LOW, batch prune)
- `gatedReveal` mechanism unused; split-view CSS + ~1/3 of `left.css` classes
  unreachable; duplicate selectors (`.lx-pf`, `.lx-slogan`, `.lx-bluedie2`,
  `.lx-bidc`); `setTv` + dead api entries; `onStep`/`onHold` hooks; `fadeIn()`;
  `tv:true` no-op in a `setControls` call.

## Nodegame port (concerns, not live bugs)
- Assets: prototype uses relative `img/...`; game convention is absolute `/img/...`.
  `public/img/` lacks `products/` + `products2/` (71 shoe PNGs). Copy them; fix the
  literal refs (`products.js`, `config.js` DICE_IMG, dice refs).
- iframe height: prototype assumes it owns the viewport (`100vh`). Inside the
  nodegame iframe, set a stable height once via `parent.W` (author already flagged
  with a `PORT:` comment). Prefer a fixed height (content grows per typewriter step).
- Dependencies: prototype pins `chart.js@4.4.4`; the game frame loads unpinned
  Chart.js + jQuery. New frame should load exactly one (pinned, self-hosted)
  Chart.js and drop jQuery / legacy `instructions-2/*` scripts.
- Frame: author `public/instructions-2.htm` = `left.css` (+ optional
  `stage-intro.css`) in head, `#lx-app` markup in body, scripts in order. Decide
  overlay-vs-own-title to avoid a double splash. Game-side steps 1–6 already exist;
  the only required contact point is `instructions2-done-PLAYER`.
- Copy-over unchanged (pure DOM): `typewriter/rng/stars/products/config/left/*`,
  `css/left.css`. Must edit for the seam: `left/app.js` (mount → capture
  `parent.node`, START_TIME, frame height) and `left/stage.js` (terminal Done →
  emit + `node.done`; tracking).

## Interaction tracking — proposed design
Pure-DOM `App.track` buffers events → ONE `dataSource.submit(dump)` at Done → ONE
`node.set` in `intro-2.js` → ONE `memoryCsv` writer (`intro2-left.csv`). Mirrors the
existing `catcher`/`task-reflection` packed-string convention (one row/participant).

**Stable event ids** (examples): `slide.enter/leave`, `nav.next/back/done`,
`ok.click`, `text.skip`, `info.open/close`, `s3.die.click`, `s3/4.auto|hold|aid.toggle`,
`s4.bar.click` (core disclosure), `s4.gate.arm`, `s5.bid.place` (core guess),
`s5.bid.retry`, `s6/s7.price.draw` (manual only — auto reveal not logged),
`s3/s7.reveal`, `sX.*.slider` (coalesced on `change`, not `input`), `gate.open`.

**Per-slide metrics** (`instr2_perSlide`, packed): enterCount, revisitCount, dwellMs,
firstInteractLatency, gateMs, gateSatisfied (per-slide rule), nEvents.

**CSV (one row/participant):** `instructions2Duration`, `instr2_maxSlideReached`,
`instr2_slidesGateSatisfied`, `instr2_backCount`, `instr2_infoOpens`,
`instr2_totalEvents`, `instr2_perSlide` (packed), `instr2_events` (packed
`id~slide~tRel~k=v+k=v`, `|`-joined, no commas), `instr2_trackVersion`.

**Seam:** `App.dataSource.submit(dump)` — standalone logs to console/localStorage;
nodegame `parent.node.emit('instructions2-done-PLAYER', dump); parent.node.done();`
(replaces the current duration-only emit; back-compat if `d` is a number). New
`instructions2Left` writer in `memoryCsv.js`, called from `logic.js`. No new
`node.set` beyond the single existing one.

## Prioritized actions
1. Close both gate soft-locks (slide 3 fallback, slide 4 die-arms-gate).
2. Add `prefers-reduced-motion` block.
3. Build the tracking layer (`track.js` + seam) before the port.
4. Port hygiene: copy shoe images + absolute `/img/...`; single pinned Chart.js,
   drop jQuery; stable iframe height; overlay decision.
5. Low-severity polish: aria-labels + keyboard skip; `bid.leave()`; per-scene
   timers; trade revisit restore; cache-bust JS; mobile gap; click-to-skip pacing.
6. Dead-code sweep.
