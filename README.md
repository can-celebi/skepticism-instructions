# Skepticism — Game Instructions (interactive prototype)

An interactive, split-screen reimagining of the **Part-2 game instructions** for the
"skepticism" buyer/seller information-disclosure (cherry-picking) market experiment.
The **left** side shows short instruction slides; the **right** side is a hands-on
sandbox that unlocks step by step as you advance.

**▶ Live demo:** https://can-celebi.github.io/skepticism-instructions/

> This is a **standalone review build** for colleague feedback — no server, no data
> collection, no login/reconnect. Everything runs in your browser.

## What to look at

- Walk all 13 slides with **Next** — it unlocks once you do each slide's action
  (roll the dice, disclose a review, place a bid, etc.).
- Slides **5–8** are the interactive "play" slides: predict the value from the
  reviews, learn how the random **sales price** is drawn, see **trade & payoffs**,
  and a final free-play sandbox.
- Add **`?reset`** to the URL to start over from slide 1.

## Run locally

No build step. Clone, then either open `index.html` directly, or serve it (recommended,
so the CDN scripts and images load cleanly):

```bash
python3 -m http.server 8100
# then open http://localhost:8100/
```

## Structure

- `index.html` — split-screen shell (loads Chart.js + jQuery from CDN)
- `js/`
  - `config.js` — slide list, per-slide unlock conditions, directives
  - `dataSource.js` — the data **seam** (mock here; swappable for the live nodegame
    experiment later) — slide text, scenarios, persistence
  - `state.js` — single source of truth + mutations
  - `sandbox.js` — right panel (charts, slider, payoff, price graph)
  - `slides.js` — left panel (slide text, the purple directive, progress dots)
  - `charts.js`, `products.js` (shoe images + quality ratings), `rng.js`, `stars.js`, `app.js`
- `css/` — `layout.css`, `slides.css`, `sandbox.css`
- `img/` — dice + product (shoe) images
- `STYLE.md` — style tokens

Feedback welcome — open an issue or leave comments.
