# Style guide — reimagined instructions

The exact visual language used here, so the rest of the nodegame `skepticism`
code (instructions, survey, quiz, etc.) can adopt it for homogeneity — ideally
by copying these CSS tokens/components and changing little else.

## Tokens (CSS variables — see `css/layout.css :root`)
```
--mono:   'Courier New', Courier, monospace   /* the one font, everywhere */
--ink:    #222    /* primary text */
--muted:  #555    /* secondary text / labels */
--line:   #ddd    /* borders / separators */
--purple: #6f42c1 /* directives, "new bid", info screens */
--red:    #dc3545 /* buyer's bid, submit, negative payoff */
--blue:   #1769c0 /* sales price, price dice, price hint */
```
Backgrounds are **uniform white** (#fff) — no panels/tints. Star fill `#f5b301`.
Trade-yes green `#1a7f4b`. Teaching colors: above-value purple `rgb(128,0,128)`,
below-value orange `rgb(255,165,0)`.

## Layout
- App = vertical flex: a two-column `.content` (1fr / 1fr, `max-width:1040px`,
  centered) above a **full-width footer** spanning both columns.
- Left column scrolls (text); right column has a fixed **directive band** on top
  (static reserved height, fades in/out) then a scrolling UI area.
- Footer: `Back` (left) · progress dots (center) · `Next` (right). Mirrors the
  nodegame footer (see FOOTER-PORT note below).
- Responsive (phone): columns stack — graphics on top, text below.

## Components
- **Buttons**: `.nav-btn` (footer) — mono, 1px border, 8px radius; `.next` is
  solid black. Primary action buttons (Submit) — solid `--red`, 8px radius,
  21px. "New bid" variant — `--purple`.
- **Bar charts** (Chart.js): black bars, value label above each, y-axis hidden,
  auto-scaled (normalized) — see `css` `.chart-box` + `js/charts.js`.
- **Bid slider**: ported verbatim from the live buyer screen — 50px black
  circular thumb hidden until first move (`show-slider-knob`), `#0000002e`
  track, 7 ticks 0.0–6.0, 50px bold value.
- **Stars**: `App.stars.html(value)` → yellow stars w/ half precision.
- **Directive cue**: purple band, empty check → green ✓ + strike on completion,
  lingers ~3s, then fades (height stays reserved).
- **Info screens**: open on the LEFT panel (`.left-info`, purple-tinted) with a
  close button — used for "more detail", payoff calc, graph reading.
- **Dice**: the black `dice.png` on a transparent button (no red). Blue variant
  via CSS `mask` (`.dice-mask.dice-blue`) for the price dice.

## To apply elsewhere
Copy `css/layout.css` tokens + the component classes; keep the mono font and
white background; route any "help/why" text to a left-side info screen with a
close button. Survey pages should reuse `.nav-btn`, the footer, and the token
palette.
