# Porting this prototype into nodegame `intro-2` — integration notes

Goal: keep this standalone prototype so that moving it into the real experiment
(`games/skepticism`, stage `intro-2`) is **a few additions, not a rewrite**. Everything
here is pure DOM today; at port time only ONE small "port bridge" object changes.

---

## 1. The mental model (matches the old code exactly)

Three JS contexts. The client is dumb — it only `emit`s/`say`s up and `on`s what comes back.

1. **Browser / iframe** (`public/js/**`, our prototype). Records `START_TIME = Date.now()`.
   Talks UP only via `parent.node.emit(...)` / `parent.node.say(...-LOGIC', 'SERVER', data)`
   and listens via `node.on(...)`. Never touches logic directly.
2. **player.js (the highway)** — `canClient/intro-2.js`. Relays between browser and logic;
   this is where `node.set()` (the write into server memory) happens.
3. **Logic / server** — `logic.js` + `canServer/other/instruction2.js`. Owns the text list
   and `player.instructions.*`; answers the client's setup request; stores progress.

**Flow:** logic owns state + the text list → player.js is the highway → the client only
emits/listens → progress and tracked events flow client → player.js → logic → `player.*`,
and are read back on reconnect.

---

## 2. What actually happens when a subject enters `intro-2` (verified order)

1. Engine enters `intro-2`; loads the frame; `window.onload` captures `parent.node`, sets
   `START_TIME`, defines the ordered page list.
2. Client asks logic for setup: `node.say('setup-instruction2-LOGIC', 'SERVER')`.
   (`canClient/intro-2.js:47`)
3. Logic builds `textList = getTextList(settings)` and reads
   `player.instructions.lastPageCompleted`, then `node.say('setup-instruction2-PLAYER', …,
   { textList, lastFinishedPage })`. (`canServer/other/instruction2.js:13-30`)
4. player.js relays down: `node.emit('setup-instruction2-CLIENT', data)`. (`intro-2.js:42`)
5. Client builds pages FROM the list, injects footer, `page.init()`. (`init.js:36-61`)
6. **Resume:** if `lastFinishedPage` is set → `page.jumpTo(lastFinishedPage)` force-finishes
   every prior page and lands on the last completed one, finished. (`init.js:63-66`, `UI.js:415`)
7. Subject works a slide; conditions get met.
8. **On each page completion → fire up → logic updates the player object:**
   client `node.say('instruction-2-tracker-visited-LOGIC' | '...-conditionMet-LOGIC',
   'SERVER', id)` → `instruction2.js:44/57` sets `player.instructions.lastPageCompleted = id`.
   (`ibl.js:119/137`) Any other tracked behavior rides this same rail.
9. Repeat 7–8 per slide.
10. **Final done:** client `parent.node.emit('instructions2-done-PLAYER', Date.now()-START_TIME)`
    then `node.done()` (`buttonCBList.js:205-206`); player.js does
    `node.set({ instructions2Duration })` (`intro-2.js:15-17`); memoryCsv writer persists it.

---

## 3. Resume / reconnect — the storage + update contract (old code)

- **Storage:** `player.instructions.lastPageCompleted` — a **string page id** (not an index),
  initialised `null` in `initBuyerData.js:370` / `initSellerData.js:76`.
- **Updated after every completed page** (step 8 above) — so `player.info` is written on each
  new completion, incrementally.
- **Replayed on reconnect** (step 6) — logic hands the id back; the client jumps there.

Resume lands the subject **on** their last completed page (shown finished, Next enabled),
NOT on the next unfinished one. (A one-line choice if we ever want "next unfinished" instead.)

---

## 4. New code vs. old — do we already have the pieces?

| Old (nodegame / ibl) | This prototype | Status |
|---|---|---|
| ordered page list `MYLIST` + server `textList` | `App.content.SLIDES` (ordered, each `id`, text co-located) | ✅ have the list |
| per-page `visited`/`conditionMet`/`isCompleted` | `S.done` Set + `S.gateOpen` | ✅ have |
| `forceFinish` / `forceReviewPageFinalState` — render a page instantly in its finished state | `go(i)` → `if (S.done.has(i))` renders **static, no animation, gate open** via each scene's `api.revisit` branch | ✅ **already built for every scene** |
| `say('...-tracker-...-LOGIC', id)` after each completion | *nothing — `S.done.add(i)` stays in memory* | ❌ to add |
| `jumpTo(lastFinishedPage)` on load | *always `go(0)`* | ❌ to add |
| `emit('instructions2-done-PLAYER') + node.done()` at the end | *the last-slide "Done" currently does nothing* | ❌ to add |

The hardest part of resume — rendering an animated slide *instantly in its final resting
state* — is already solved here (that's exactly what `api.revisit` / the `showFinal` branches
do). nodegame's `jumpTo` is just "do that for every slide up to N." So the new model is
cleaner than the old ibl force-finish machinery; only the wiring is missing.

---

## 5. The "port bridge" — the ONE object that changes at port time

No abstract framework. Just one small object (call it `App.bridge`) holding every point where
the prototype touches the outside world. Standalone bodies are local; at port each body swaps to
the matching `node` call. Nothing else in the prototype changes.

| `App.bridge` method | Standalone (now) | In nodegame (port) |
|---|---|---|
| `getTextList()` | return text from `App.content.SLIDES` | `node.on('setup-instruction2-CLIENT')` → use logic's `textList` |
| `getResumePoint()` | `null` (or `localStorage` for local testing) | logic's `lastFinishedPage` from the same setup message |
| `markCompleted(id)` | `console.log` / `localStorage` | `parent.node.say('instruction-2-tracker-conditionMet-LOGIC', 'SERVER', id)` |
| `trackEvent(name, data)` | `console.log` / buffer | `parent.node.say('<name>-LOGIC', 'SERVER', data)` (logic updates the relevant `player.*`) |
| `finish(dump)` | `console.log(dump)` | `parent.node.emit('instructions2-done-PLAYER', dump); parent.node.done();` |

**Key requirement (locked):** even in standalone the prototype must take its text **from a
list** (`App.content.SLIDES` via `getTextList()`), so that at port time the ONLY change to text
handling is "the list now arrives from logic instead of being local." Same shape, different source.

Wiring `getResumePoint()` + `markCompleted()` gives full disconnect/reconnect resume locally
(via `localStorage`) — provable before we ever touch nodegame.

---

## 6. CSV escaping gotcha (decides the packed-string format)

NDDB (`node_modules/NDDB/lib/formats/csv.js`) wraps every **string** cell in `"..."` and escapes
JSON-style (`\"`, not RFC-4180 `""`). R's `read.csv`/`readr` mis-parse any packed string with a
literal `"`. Numbers are written raw. → **Any packed/tracked field must be pipe-delimited with no
commas/quotes/newlines** (like `keystroke_taskReflection_rule`); reads cleanly with `read.csv` +
`strsplit(x, "\\|")`. If JSON is unavoidable, restrict to numeric arrays (catcher-style).

## 7. The port checklist (when we do it)

1. `game.stages.js` — keep `.stage('intro-2')` (reuse the id) OR add `intro2-left`; skip-list entry.
2. `canClient/intro-2.js` — the setup highway already exists; add the tracker relays if renaming events.
3. `public/instructions-2.htm` → replaced by our frame; load our `js/left/*` + `config/rng/...`.
4. `canServer/other/instruction2.js` — already stores `lastPageCompleted`; reuse or extend event names.
5. `memoryCsv.js` — `instructions2` writer (duration + any packed tracked fields).
6. Only `App.bridge`'s method bodies change; `content/widgets/scenes/stage` copy over unchanged.

## 8. Behavioural tracking — future direction (NOT built yet; notes only)

Captured intent from the user; deferred until the presentation updates settle. Do not build
without a go-ahead.

- **Own module(s).** Tracking lives in its own JS file(s) (e.g. `js/left/track.js` →
  `App.track`), not sprinkled through scenes. It subscribes to the central choke points that
  already exist — `advanceStep` (OK), `onDie`, `openGate`, the bid handler, info open/close —
  so scenes stay clean.
- **Granularity target = per-OK-step, not just per-slide.** *Recording* at OK-step level is
  easy here: the engine already holds `S.i` (slide) + `S.step` (which OK), and every OK/die/
  bid passes through one function. A tracker just logs `{slide, step, event, t, ...}`.
  Caveat: *resume* at OK-step level is harder than recording — it means restoring mid-slide
  visual state (replaying prior steps' final look), vs. the slide-level resume the old
  nodegame code does (`lastPageCompleted`, land on last finished slide). Recording fine
  granularity ≠ resuming at fine granularity; keep them separate.
- **Viewport capture for normalization.** Record the active view size (and dpr) at start and on
  resize, so click/coordinate data can be normalized across screen sizes. First-class field.
- **Per-slide behavioural inventory (to decide what's worth capturing):** durations per
  slide/step; die rolls (count + resulting true values); bids placed + replays (slide 5);
  info-box opens/closes (slides 3/7); manual review selections (slide 4); slider drags
  (slides 6/7); price draws. Open question the user flagged: what *more* is worth tracking and
  will it help the analysis — revisit per slide.
- **CSV shape** still governed by §6: flat scalars + pipe-delimited packed strings (no commas/
  quotes), one `finish(dump)` handoff.
</content>
</invoke>
