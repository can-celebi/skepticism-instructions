# Debug mode (dev-only slide jumper)

A small developer aid for jumping to any slide without clicking through the deck.
**It is off by default and never appears for participants** — it only turns on when the URL
contains `?debug`.

## How to use
Open the page with `?debug` in the URL, e.g.:

- Local file: `file:///…/LIVE-left-proto/index.html?debug`
- Served: `http://localhost:8400/?debug`
- Live Pages: `https://can-celebi.github.io/skepticism-instructions/?debug`

When active you get:
- a small **DEBUG** bar pinned top-left with a **jump** dropdown listing every slide
  (`1. context`, `2. overview`, …). Pick one to jump straight there.
- **clickable footer dots** — click any dot to jump to that slide.
- a console hook: `App.stage.jump(11)` jumps to slide 12 (0-indexed).

Jumping marks all earlier slides as "done", so **Back** from the landing slide replays the
earlier ones in their finished/static state (no animations), while the landing slide itself
plays its first-visit animation. Gated slides still gate normally (you interact to unlock Next).

## Why it's safe to ship
- Gated entirely behind `location.search` containing `debug` (`const DEBUG = /\bdebug\b/…` in
  `js/left/stage.js`). With a clean URL (what participants get, and what the nodegame frame
  loads), `DEBUG` is `false`, `setupDebug()` never runs, and no debug DOM/CSS is added.
- All debug code is isolated: the `DEBUG` const, `debugJump()`, `setupDebug()` in
  `js/left/stage.js`, and the `#lx-debug` / `.lx-debug-*` rules in `css/left.css`.

## Removing it entirely (optional, at nodegame-port time)
If you'd rather strip it than leave it gated: delete `debugJump`/`setupDebug` and the `DEBUG`
const + its `if (DEBUG) setupDebug()` call and the `debugSel` sync line in `stage.js`, and the
`#lx-debug` block in `left.css`. Nothing else references them.
</content>
