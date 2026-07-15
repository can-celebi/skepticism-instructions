// scenes.js — App.scenes : per-slide scene builders for the left stage.
window.App = window.App || {};

App.scenes = (function () {
  const { round1, rand } = App.util;
  const rng = App.rng, lx = App.lx;
  const pickShoe = (tv, prev) => App.pickShoeForValue(tv, prev);
  const TICKS = [0, 1, 2, 3, 4, 5, 6].map((n) => `<span>${n}.0</span>`).join('');
  const slide = (api) => App.content.SLIDES[api.S.i];

  function draw(S, hold) {
    S.tv = hold && S.tv != null ? S.tv : rng.randomTrueValue();
    S.product = hold && S.product ? S.product : pickShoe(S.tv, S.product);
    S.reviews = rng.generateReviews(S.tv);
    S.disclosed = new Set();
  }
  const rowsOf = (a) => a.map((v, i) => ({ v, i }));
  const topK = (reviews, k) => reviews.slice().sort((a, b) => b - a).slice(0, k);
  const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const q = (id) => document.getElementById(id);

  // phone-feed upward swipe: the current item slides up and out while the next slides up into place
  function swipeUp(host, html, api) {
    if (!host) return null;
    let track = host.querySelector(':scope > .lx-swipe-track');
    if (!track) {   // first item, no swipe
      host.classList.add('lx-swipe-host');
      host.innerHTML = `<div class="lx-swipe-track">${html}</div>`;
      track = host.querySelector(':scope > .lx-swipe-track');
      host.style.height = track.firstElementChild.offsetHeight + 'px';
      return null;
    }
    const oldItem = track.firstElementChild, oldH = oldItem.offsetHeight;
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    const newItem = tmp.firstElementChild;
    track.appendChild(newItem);
    const newH = newItem.offsetHeight;
    track.style.transition = 'none'; track.style.transform = 'translateY(0)';
    host.style.transition = 'none'; host.style.height = oldH + 'px';
    void track.offsetWidth;   // reflow, then slide up sharply
    track.style.transition = 'transform .3s cubic-bezier(.4,0,.15,1)';
    track.style.transform = `translateY(${-oldH}px)`;
    host.style.transition = 'height .3s cubic-bezier(.4,0,.15,1)';
    host.style.height = newH + 'px';
    const at = api.S.i;
    return setTimeout(() => {
      if (api.S.i !== at) return;
      oldItem.remove();
      track.style.transition = 'none'; track.style.transform = 'translateY(0)';
      host.style.transition = ''; host.style.height = newItem.offsetHeight + 'px';
    }, 320);
  }
  function sliderRaw(id, val, color) { return `<div class="lx-slider-wrap"><input type="range" id="${id}" class="lx-range ${color}" min="0" max="6" step="0.1" value="${val}"><div class="lx-ticks">${TICKS}</div></div>`; }
  const markUsed = (id) => { const e = q(id); if (e) e.classList.add('used'); };
  const TYPE_SLOW = 60;   // accent typing (score/advice/calc/guide): same as the main-text typewriter
  function bidSlot(bid) { return `<div class="lx-bid-slot" id="lx-bid-slot">${sliderRaw('lx-slider', bid, 'black')}<div class="lx-yourbid">Your bid <b id="lx-bidval">${bid.toFixed(1)}</b></div></div>`; }

  // tiny plain-text typewriter (faster/cancellable) for accent lines like the guess prompt & score
  function typeText(el, text, speed, onDone) {
    if (!el) return { cancel() {} };
    let i = 0, stop = false; el.textContent = '';
    (function step() {
      if (stop) return;
      if (i >= text.length) { if (onDone) onDone(); return; }
      const ch = text[i++]; el.textContent += ch;
      setTimeout(step, ch === ' ' ? 0 : speed);
    })();
    return { cancel() { stop = true; } };
  }
  // how close the bid landed to the true value → a graded label + subtle tone
  function guessFeedback(diff) {
    if (diff <= 0.0001) return { label: 'Perfect guess', color: '#0e9e57' };
    if (diff <= 0.1)    return { label: 'Excellent guess', color: '#2ba463' };
    if (diff <= 0.3)    return { label: 'Great guess', color: '#4fa15f' };
    if (diff <= 0.5)    return { label: 'Good guess', color: '#8a9a3f' };
    if (diff <= 1.0)    return { label: 'Fair guess', color: '#c79a2e' };
    if (diff <= 1.5)    return { label: 'Poor guess', color: '#cf7a25' };
    return { label: 'Terrible guess', color: '#c0512e' };
  }

  // shared bid flow (slide 5)
  function buildBid(api, setup) {
    const S = api.S;
    S.tv = setup.tv; S.reviews = setup.reviews; S.disclosed = new Set(setup.disclosed); S.bid = 3.0;
    const shownVals = setup.disclosed.map((i) => S.reviews[i]).sort((a, b) => a - b);
    api.stage.innerHTML =
      `<div class="lx-lead" id="lx-lead5"></div>` +                     // lead-in shown first, above the (initially hidden) reviews + UI
      `<div class="lx-slowrise" id="lx-rise5">` +
      `<div class="lx-box-title">Displayed reviews</div><div class="lx-bars sm" id="lx-shownbars"></div>` +
      bidSlot(S.bid) +
      `<div class="lx-graphic-slot empty tight" id="lx-gslot"><div class="lx-guess-prompt" id="lx-guess-prompt"></div>${lx.line()}</div>` +
      `<div class="lx-score" id="lx-score" hidden></div>` +
      `<div class="lx-btn-slot" id="lx-btnslot"><button id="lx-bid-btn" class="lx-btn ghost">Place bid</button></div>` +
      `</div>`;
    q('lx-gslot').querySelector('.lx-line').classList.add('bid-black');   // slide 5: bid bar black too
    lx.bars(q('lx-shownbars'), shownVals, {});
    const r = q('lx-rise5'), bidBtn = q('lx-bid-btn'), promptText = "Can you guess the product's true value?";
    const leadText = 'Below is an example of a seller who displayed all the reviews.';
    let prompt = { cancel() {} };
    if (api.revisit || setup.replayed) {                 // Back or try-again → lead + guess shown at once, no re-typing
      q('lx-lead5').textContent = leadText;
      if (r) { r.style.transition = 'none'; r.classList.add('show'); }
      q('lx-guess-prompt').textContent = promptText;
      api.openGate(0);
    } else {
      bidBtn.style.opacity = '0';                        // hold the button back until the question is asked
      const at = api.S.i;
      // 1) the lead-in types first; 2) once done, the reviews + UI fade in; 3) then the guess prompt; 4) then the bid button
      typeText(q('lx-lead5'), leadText, TYPE_SLOW, () => {
        if (api.S.i !== at) return;
        if (r) r.classList.add('show');
        setTimeout(() => {
          if (api.S.i !== at) return;
          prompt = typeText(q('lx-guess-prompt'), promptText, TYPE_SLOW, () => { bidBtn.style.transition = 'opacity .5s ease'; bidBtn.style.opacity = '1'; });
        }, 1400);
      });
    }
    const sl = q('lx-slider'), val = q('lx-bidval');
    sl.addEventListener('input', () => { S.bid = round1(+sl.value); val.textContent = S.bid.toFixed(1); });
    q('lx-bid-btn').addEventListener('click', () => {
      prompt.cancel();
      q('lx-bid-slot').classList.add('gone');
      const gs = q('lx-gslot'); gs.classList.remove('empty');
      lx.setLine(gs.querySelector('.lx-line'), { tv: S.tv, bid: S.bid });
      const diff = round1(Math.abs(S.bid - S.tv)), fb = guessFeedback(diff);
      const sub = diff <= 0.0001 ? 'spot on — you matched the true value' : `off by ${diff.toFixed(1)}`;
      const sc = q('lx-score');
      sc.innerHTML = `<div class="lx-score-main" id="lx-score-main" style="color:${fb.color}"></div>` +
        `<div class="lx-score-sub" id="lx-score-sub"></div>` +
        `<div class="lx-score-goal" id="lx-score-goal" style="opacity:0">aim to bid as close to the true value as possible</div>`;
      sc.hidden = false; void sc.offsetWidth; sc.classList.add('lx-fadein');
      typeText(q('lx-score-main'), fb.label, TYPE_SLOW, () => typeText(q('lx-score-sub'), sub, TYPE_SLOW, () => {
        const at = api.S.i;
        setTimeout(() => { if (api.S.i !== at) return; const g = q('lx-score-goal'); if (g) { g.style.transition = 'opacity 1.3s ease'; g.style.opacity = '1'; } }, 1500);
      }));
      q('lx-btnslot').innerHTML = '<button id="lx-try" class="lx-try-btn">↺ try again</button>';
      q('lx-try').addEventListener('click', () => setup.replay(api));
      api.openGate(5000);   // Next unlocks 5s after the bid is placed
    });
  }

  // ---- true-value heading helper ----
  const tvHead = () => `<div class="lx-tvhead" id="lx-tvhead">True value <b>—</b></div>`;
  // count the number up/down to the new value with the same easeOutQuart the bars use
  function animateNum(el, from, to, ms) {
    if (el._raf) cancelAnimationFrame(el._raf);
    const start = performance.now(), ease = (t) => 1 - Math.pow(1 - t, 4);
    const frame = (now) => {
      const t = Math.min(1, (now - start) / ms);
      el.textContent = (from + (to - from) * ease(t)).toFixed(1);
      if (t < 1) el._raf = requestAnimationFrame(frame); else { el.textContent = to.toFixed(1); el._raf = null; }
    };
    el._raf = requestAnimationFrame(frame);
  }
  function setTvHead(v) {
    const e = document.querySelector('#lx-tvhead b'); if (!e) return;
    const to = round1(v), from = parseFloat(e.textContent);
    if (isNaN(from) || Math.abs(from - to) < 0.05) { e.textContent = to.toFixed(1); return; }
    e.classList.remove('lx-tvpop'); void e.offsetWidth; e.classList.add('lx-tvpop');
    animateNum(e, from, to, 350);
  }
  // min / avg / max row that counts to its new values in step with the bars (350ms)
  const statsHtml = (id) => `<div class="lx-stats" id="${id}"><span>min <b>—</b></span><span>avg <b>—</b></span><span>max <b>—</b></span></div>`;
  function setStats(id, values) {
    const el = q(id); if (!el) return;
    const bs = el.querySelectorAll('b');
    if (!values.length) { bs.forEach((b) => { if (b._raf) cancelAnimationFrame(b._raf); b.textContent = '—'; }); return; }
    const mn = Math.min(...values), mx = Math.max(...values), av = values.reduce((s, x) => s + x, 0) / values.length;
    [mn, av, mx].forEach((t, i) => {
      const b = bs[i], to = round1(t), from = parseFloat(b.textContent);
      if (!isNaN(from) && Math.abs(from - to) >= 0.05) animateNum(b, from, to, 350);
      else b.textContent = to.toFixed(1);
    });
  }

  // -------------------------------------------------- Slide 1: product (upward swipe; the "True value" label holds still)
  const product = {
    enter(api) { api.setControls({}); api.carousel(() => this.rotate(api), 3000); },
    rotate(api) {
      const S = api.S; draw(S, false);
      if (!q('lx-p1-host')) api.stage.innerHTML = `<div class="lx-scene-center"><div id="lx-p1-host"></div><div class="lx-val-label">True value</div></div>`;
      this._t = swipeUp(q('lx-p1-host'), `<div class="lx-imgcard"><img class="lx-shoe" src="${S.product}" alt="product"><div class="lx-starsrow">${App.stars.html(S.tv)}</div><div class="lx-val">${lx.f1(S.tv)}</div></div>`, api);
    },
    leave() { clearTimeout(this._t); },
  };

  // -------------------------------------------------- Slide 2: two-panel (static labels, swiping image + reviews)
  const twoPanel = {
    enter(api) { api.setControls({}); api.carousel(() => this.rotate(api), 3000); },
    rotate(api) {
      const S = api.S; draw(S, false); const k = 3 + Math.floor(Math.random() * 3);
      if (!q('lx-img-host')) {
        api.stage.innerHTML = `<div class="lx-window"><div class="lx-two">
          <div class="lx-two-l"><div id="lx-img-host"></div><div class="lx-val-label">True value</div></div>
          <div class="lx-two-r"><div class="lx-box-title">Reviews you see</div><div id="lx-rev-host"></div></div>
        </div></div>`;
      }
      this._t1 = swipeUp(q('lx-img-host'), `<div class="lx-imgcard"><img class="lx-shoe" src="${S.product}" alt="product"><div class="lx-val lx-q">?</div></div>`, api);
      this._t2 = swipeUp(q('lx-rev-host'), lx.reviewList(rowsOf(topK(S.reviews, k)), {}), api);
    },
    leave() { clearTimeout(this._t1); clearTimeout(this._t2); },
  };

  // -------------------------------------------------- Slide 3: reviews (bars) + tv heading + aid legend
  const reviews = {
    enter(api) {
      api.stage.innerHTML =
        `<div class="lx-slowrise" id="lx-rev3">` +
          tvHead() +
          `<div class="lx-box-title">Reviews</div>` +
          `<div class="lx-bars" id="lx-bars3"></div>` +
          statsHtml('lx-stats3') +
          `<div class="lx-aidlegend" id="lx-aidleg" hidden><span class="lg hi">above value</span><span class="lg mid">true value</span><span class="lg lo">below value</span></div>` +
        `</div>`;
      this.c = q('lx-bars3');
      this._revealed = false;
      const guideText = 'Press the die for a new true value, or untick “auto” to go through them yourself.';
      this._reveal = () => {
        if (this._revealed) return; this._revealed = true;
        api.setControls({ die: true, auto: true, hold: true, aid: true, guide: ' ' });
        q('lx-rev3').classList.add('show');
        api.carousel(() => this.step(api), 1750);
        const g = document.querySelector('#lx-controls .lx-guide');
        if (g) { g.textContent = guideText; if (!api.revisit) { g.style.opacity = '0'; requestAnimationFrame(() => { g.style.transition = 'opacity 1.2s ease'; g.style.opacity = '1'; }); } }   // fade in, no typing
        api.openGate(api.revisit ? 0 : 6000);   // Next unlocks 6s after the graph is revealed
      };
      if (api.revisit) { q('lx-rev3').style.transition = 'none'; this._reveal(); return; }
      // first visit: hard-gated — the graph reveals ONLY after the info box is opened + closed (onInfoClosed)
    },
    leave() { if (this._guideTyper) this._guideTyper.cancel(); },
    onInfoClosed() { if (this._reveal) this._reveal(); },   // reveal the graph after the info box is opened + closed
    step(api) { draw(api.S, api.S.hold); api.spinDie(); this.paint(api); },
    paint(api) { const S = api.S; setTvHead(S.tv); lx.bars(this.c, S.reviews.slice(), { aid: S.aid, tv: S.tv, animate: true }); setStats('lx-stats3', S.reviews); },
    setAuto(on, api) { if (on) api.carousel(() => this.step(api), 1750); else api.stopCarousel(); },
    onAid(on, api) { q('lx-aidleg').hidden = !on; this.paint(api); },
  };

  // -------------------------------------------------- Slide 4: disclosure (reveal all in random order)
  let dTimers = [];
  const clearD = () => { dTimers.forEach((t) => clearTimeout(t)); dTimers = []; };
  const setBold = (id, on) => { const e = q(id); if (e) e.classList.toggle('lx-bold', on); };
  const disclosure = {
    enter(api) {
      api.stage.innerHTML =
        `<div class="lx-slowrise" id="lx-rise4">` +
          tvHead() +
          `<div class="lx-box-title">All 10 reviews</div><div class="lx-bars" id="lx-allb"></div>` +
          statsHtml('lx-stats-all') +
          `<div class="lx-aidlegend" id="lx-aidleg" hidden><span class="lg hi">above value</span><span class="lg mid">true value</span><span class="lg lo">below value</span></div>` +
          `<div class="lx-cue" id="lx-cue4" hidden>Click the bars to show them to the buyer</div>` +
          `<div class="lx-sep"></div>` +
          `<div class="lx-box-title">Displayed reviews</div><div class="lx-bars sm lx-shownbox" id="lx-shownb"></div>` +
          statsHtml('lx-stats-shown') +
        `</div>`;
      this.cAll = q('lx-allb'); this.cShown = q('lx-shownb');
      // cue reappears on hovering the all-reviews graph; in auto it hides again on leave
      this.cAll.addEventListener('mouseenter', () => { const c = q('lx-cue4'); if (c) { c.hidden = false; c.classList.remove('hide'); } });
      this.cAll.addEventListener('mouseleave', () => { const c = q('lx-cue4'), auto = q('lx-auto') && q('lx-auto').checked; if (c && auto) c.hidden = true; });
      this.newScenario(api);   // paint an initial sample (hidden) — auto-cycle starts when the graph reveals
      api.openGate(api.revisit ? 0 : 12000);   // Next appears 12s after entering (no interaction gate)
      const guideText = 'Press the die for a new true value, or untick “auto” to go through them yourself.';
      const showControls = () => api.setControls({ die: true, auto: true, autoChecked: true, hold: true, aid: true, guide: ' ' });
      const fadeGuide = () => { const g = document.querySelector('#lx-controls .lx-guide'); if (g) { g.textContent = guideText; g.style.opacity = '0'; requestAnimationFrame(() => { g.style.transition = 'opacity 1.2s ease'; g.style.opacity = '1'; }); } };   // fade in, no typing
      const at = api.S.i;
      if (api.revisit) { q('lx-rise4').style.transition = 'none'; showControls(); const g = document.querySelector('#lx-controls .lx-guide'); if (g) g.textContent = guideText; q('lx-rise4').classList.add('show'); return; }
      // first visit: reveal graph + controls, auto-play the disclosure, then the guide types in 5s later
      this.t = setTimeout(() => {
        if (api.S.i !== at) return;
        showControls(); q('lx-rise4').classList.add('show'); this.autoCycle(api); fadeGuide();   // guide shows with the controls, no delay
      }, 1200);
    },
    leave() { clearD(); clearTimeout(this.t); clearTimeout(this.t2); if (this._guideTyper) this._guideTyper.cancel(); },
    // die → a fresh true value + distribution, manual
    step(api) { clearD(); this.newScenario(api); },
    setAuto(on, api) { if (on) this.autoCycle(api); else { clearD(); this.paint(api); } },
    onAid(on, api) { const l = q('lx-aidleg'); if (l) l.hidden = !on; this.paint(api); },
    newScenario(api) { const S = api.S; clearD(); draw(S, S.hold); S.disclosed = new Set(); const c = q('lx-cue4'); if (c) c.classList.remove('hide'); this.paint(api); },
    autoCycle(api) {
      const S = api.S; clearD(); draw(S, S.hold); S.disclosed = new Set(); api.spinDie(); this.paint(api);
      const order = shuffle(S.reviews.map((_, i) => i));      // reveal ALL, in random order
      order.forEach((idx, k) => dTimers.push(setTimeout(() => { S.disclosed.add(idx); this.paint(api); }, 700 * (k + 1))));
      const a = q('lx-auto');
      if (a && a.checked) dTimers.push(setTimeout(() => this.autoCycle(api), 700 * (order.length + 1) + 1800));
    },
    paint(api) {
      const S = api.S; setTvHead(S.tv);
      const manual = !(q('lx-auto') && q('lx-auto').checked);
      q('lx-cue4').hidden = !manual;
      const n = S.disclosed.size;
      setBold('lx-w-none', n === 0); setBold('lx-w-some', n > 0 && n < S.reviews.length); setBold('lx-w-all', n === S.reviews.length && n > 0);
      lx.bars(this.cAll, S.reviews.slice(), { selected: S.disclosed, dimUnselected: true, clickable: manual, aid: S.aid, tv: S.tv, animate: true,
        onClick: (i) => { if (!manual) return; const c = q('lx-cue4'); if (c) c.classList.add('hide'); if (S.disclosed.has(i)) S.disclosed.delete(i); else S.disclosed.add(i); this.paint(api); } });
      const shown = [...S.disclosed].map((i) => S.reviews[i]).sort((a, b) => a - b);
      if (shown.length) { this.cShown.classList.remove('is-empty'); lx.bars(this.cShown, shown, { aid: S.aid, tv: S.tv, animate: true }); }
      else { lx.killChart(this.cShown); this.cShown.classList.add('is-empty'); this.cShown.innerHTML = '<div class="lx-empty-note">The seller displays no reviews</div>'; }
      setStats('lx-stats-all', S.reviews); setStats('lx-stats-shown', shown);
    },
  };

  // -------------------------------------------------- Slide 5: bid
  const bid = {
    enter(api) { this.fresh(api, false); },
    fresh(api, replayed) { const S = api.S; draw(S, false); const disc = S.reviews.map((_, i) => i); buildBid(api, { tv: S.tv, reviews: S.reviews, disclosed: disc, replayed: !!replayed, replay: (a) => this.fresh(a, true) }); },   // always show all 10 reviews (no cherry-pick bias)
  };

  // -------------------------------------------------- Slides 6 & 7: price / earnings (staged reveal)
  function tradeScene(withEarnings) {
    return {
      enter(api) {
        const S = api.S; S.tv = round1(rand(1, 5)); S.bid = 3.0; S.price = null; this.earnStaged = false; this.tradeShown = false;
        api.stage.innerHTML =
          `<div class="lx-graphic-slot" id="lx-gslot">${lx.line()}</div>` +
          `<div class="lx-stg lx-sgroup" id="lx-tvgroup"><div class="lx-shint" id="lx-tvhint">move to set the true value</div><div class="lx-slider-wrap lx-sw-tv"><input type="range" id="lx-tvslider" class="lx-range black" min="1" max="5" step="0.1" value="${S.tv}"></div><div class="lx-svalue">True value <b id="lx-tvval">${S.tv.toFixed(1)}</b></div></div>` +
          `<div class="lx-stg lx-sgroup" id="lx-bidgroup"><div class="lx-shint" id="lx-bidhint">move to set your bid</div><div class="lx-slider-wrap lx-sw-full"><input type="range" id="lx-slider" class="lx-range red" min="0" max="6" step="0.1" value="${S.bid}"></div><div class="lx-svalue">Your bid <b class="lx-bidc" id="lx-bidval">${S.bid.toFixed(1)}</b></div></div>` +
          `<div class="lx-stg" id="lx-dierow"><div class="lx-price-row"><button id="lx-bluedie" class="lx-bluedie2" title="draw a price"></button><span class="lx-price-txt">Price <b class="lx-blue" id="lx-pricenum" style="opacity:0">0.0</b></span></div><div class="lx-price-hint" id="lx-price-hint">click the button to generate a price</div></div>` +
          `<div class="lx-oob" id="lx-oob" hidden><span class="lx-oob-ico">⚠</span> price is out of bounds</div>` +
          `<div id="lx-trade-out" class="lx-trade-out"></div>` +
          (withEarnings ? `<div id="lx-pf" class="lx-pf"></div><div id="lx-calc-box" class="lx-calc-box plain"></div>` : '');
        // wire
        const tsl = q('lx-tvslider'), tval = q('lx-tvval');
        tsl.addEventListener('input', () => { S.tv = round1(+tsl.value); tval.textContent = S.tv.toFixed(1); markUsed('lx-tvhint'); this.redraw(api); });   // moving tv does NOT reset the price
        const sl = q('lx-slider'), val = q('lx-bidval');
        sl.addEventListener('input', () => { S.bid = round1(+sl.value); val.textContent = S.bid.toFixed(1); markUsed('lx-bidhint'); this.redraw(api); });
        q('lx-bluedie').addEventListener('click', () => { this.drawPrice(api); });
        if (api.revisit) { this.showFinal(api); return; }   // returning → jump to the final state, no animation
        if (withEarnings) {   // slide 7: nothing runs below until the info box is opened + closed
          api.stage.style.visibility = 'hidden';
          this._revealed = false;
          this._reveal = () => { if (this._revealed) return; this._revealed = true; api.stage.style.visibility = ''; this.reveal(api); };
          const at = api.S.i;   // safety net so it can never dead-end if the info box is ignored
          this._infoFallback = setTimeout(() => { if (api.S.i === at) this._reveal(); }, 25000);
        } else { this.reveal(api); }
      },
      onInfoClosed() { if (this._reveal) this._reveal(); },   // slide 7: start the sequence after the info box closes
      // final resting state (used when coming Back to a completed slide)
      showFinal(api) {
        const S = api.S;
        q('lx-tvgroup').classList.add('show'); q('lx-bidgroup').classList.add('show'); q('lx-dierow').classList.add('show');
        S.price = rng.salesPrice(S.tv);
        const num = q('lx-pricenum'); if (num) { num.textContent = S.price.toFixed(1); num.style.opacity = '1'; }
        const h = q('lx-price-hint'); if (h) h.style.opacity = '0';
        this.earnStaged = true; this.tradeShown = true;   // render earnings + trade instantly
        this.redraw(api);
        api.openGate(0);
      },
      reveal(api) {
        const S = api.S, at = S.i, T = (ms, fn) => dTimers.push(setTimeout(() => { if (S.i === at) fn(); }, ms));
        this.redraw(api, { onlyLine: true });                         // gray line only
        T(3000, () => { q('lx-tvgroup').classList.add('show'); this.redraw(api, { upto: 'tv' }); });    // tv slider + black bar
        T(6000, () => { q('lx-bidgroup').classList.add('show'); this.redraw(api, { upto: 'bid' }); });  // bid slider + red bar
        T(9000, () => { q('lx-dierow').classList.add('show'); this.redraw(api, { upto: 'band' }); });   // blue die + band
        T(9600, () => { const d = q('lx-bluedie'); if (d) { d.classList.remove('spin3'); void d.offsetWidth; d.classList.add('spin3'); } });  // die turns 3 times
        T(11300, () => this.drawPrice(api, { spin: false }));         // then the price is revealed (auto — does NOT unlock Next)
        T(13600, () => { const d = q('lx-bluedie'); if (d) d.classList.add('lx-nudge'); });   // then the die shakes to invite a click
      },
      drawPrice(api, opts) {
        opts = opts || {};
        const S = api.S; S.price = rng.salesPrice(S.tv);
        const d = q('lx-bluedie'); if (d && opts.spin !== false) { d.classList.remove('lx-nudge', 'spin2'); void d.offsetWidth; d.classList.add('spin2'); }
        // only the number animates — counts up + pops like the slide-3 true value; the "Price" label never moves
        const num = q('lx-pricenum');
        if (num) { const from = parseFloat(num.textContent) || 0; num.style.opacity = '1';
          num.classList.remove('lx-numpop'); void num.offsetWidth; num.classList.add('lx-numpop'); animateNum(num, from, S.price, 700); }
        // a manual die click fades the direction out and unlocks Next (enforces drawing a price)
        if (opts.spin !== false) { const h = q('lx-price-hint'); if (h) { h.style.transition = 'opacity .5s ease'; h.style.opacity = '0'; } api.openGate(1000); }
        this.redraw(api);
        // the blue price bar eases in on the graph too
        const pm = api.stage.querySelector('.lx-mark.lx-price');
        if (pm) { pm.classList.remove('lx-price-appear'); void pm.offsetWidth; pm.classList.add('lx-price-appear'); }
      },
      redraw(api, stage) {
        stage = stage || {};
        const S = api.S;
        const showTv = !stage.onlyLine;
        const showBid = !stage.onlyLine && stage.upto !== 'tv';
        const showBand = !stage.onlyLine && (stage.upto === 'band' || stage.upto === undefined);
        lx.setLine(api.stage.querySelector('.lx-line'), {
          tv: showTv ? S.tv : null, bid: showBid ? S.bid : null,
          price: (showBand && S.price != null) ? S.price : null,
          band: showBand, tvTag: false, bidTag: false, priceTag: false,
        });
        // out-of-bounds check (price no longer inside tv ± 1)
        const isOob = S.price != null && (S.price < S.tv - 1.0001 || S.price > S.tv + 1.0001);
        const oob = q('lx-oob'); if (oob) oob.hidden = !isOob;
        // when the price is out of bounds, hide trade/payoff entirely so the warning stands alone
        const out = q('lx-trade-out');
        if (out) {
          if (S.price == null || isOob) { out.innerHTML = ''; out.style.opacity = ''; }
          else {
            const html = S.bid >= S.price ? `Trade <span class="lx-chk">✔</span> <span class="lx-paren">(bid ≥ price)</span>`
                                          : `Trade <span class="lx-x">✘</span> <span class="lx-paren">(bid &lt; price)</span>`;
            out.innerHTML = html;
            if (this.tradeShown) { out.style.opacity = '1'; }
            else {                                   // first appearance: 2s after the price, fade in slowly
              this.tradeShown = true;
              out.style.transition = 'none'; out.style.opacity = '0';
              const at = S.i;
              dTimers.push(setTimeout(() => { if (S.i !== at) return; out.style.transition = 'opacity 1.2s ease'; out.style.opacity = '1'; }, 2000));
            }
          }
        }
        if (withEarnings) this.earn(api, isOob);
      },
      earn(api, isOob) {
        const S = api.S, pf = q('lx-pf'), box = q('lx-calc-box');
        if (!pf) return;
        if (this.calcTyper) { this.calcTyper.cancel(); this.calcTyper = null; }
        if (S.price == null || isOob) { pf.innerHTML = ''; box.innerHTML = ''; return; }
        const trade = S.bid >= S.price;
        const buyer = trade ? round1(S.tv - S.price) : 0, seller = trade ? round1(S.bid - (S.tv - 0.3)) : 0;
        const pfHtml = (cls) => `<div class="lx-pf-cell ${cls}" id="lx-pfa">You earn <b class="${buyer < 0 ? 'lx-neg' : ''}">${buyer.toFixed(1)}</b></div><div class="lx-pf-cell ${cls}" id="lx-pfb">Seller earns <b>${seller.toFixed(1)}</b></div>`;
        const calcStmts = trade
          ? [`You: value − price = ${round1(S.tv).toFixed(1)} − ${S.price.toFixed(1)} = <b>${buyer.toFixed(1)}</b>`,
             `Seller: bid − (value − 0.3) = ${S.bid.toFixed(1)} − ${round1(S.tv - 0.3).toFixed(1)} = <b>${seller.toFixed(1)}</b>`,
             `<span class="lx-cost-note">production cost = value − 0.3</span>`]
          : ['No trade, so both earn <b>0</b>.'];
        // after the first reveal, live-drag updates are instant
        if (this.earnStaged) {
          pf.innerHTML = pfHtml('');
          box.innerHTML = calcStmts.map((s) => `<p class="stmt">${s}</p>`).join('');
          return;
        }
        // first reveal: payoff cells step in one at a time, then the calc is typed out
        this.earnStaged = true;
        pf.innerHTML = pfHtml('lx-stg'); box.innerHTML = '';
        const at = S.i, T = (ms, fn) => dTimers.push(setTimeout(() => { if (S.i === at) fn(); }, ms));
        T(400,  () => { const e = q('lx-pfa'); if (e) e.classList.add('show'); });
        T(1400, () => { const e = q('lx-pfb'); if (e) e.classList.add('show'); });
        T(2600, () => { if (window.App.typewriter) this.calcTyper = App.typewriter.run(box, calcStmts, null, { speed: TYPE_SLOW }); else { box.innerHTML = calcStmts.map((s) => `<p class="stmt">${s}</p>`).join(''); } });
      },
      leave() { clearD(); clearTimeout(this._infoFallback); if (this.calcTyper) { this.calcTyper.cancel(); this.calcTyper = null; } const s = q('lx-stage'); if (s) s.style.visibility = ''; },
    };
  }

  // -------------------------------------------------- Slide 6: price/trade text + interactive price info box; part C = earnings text
  const priceInfo = {
    enter(api) {
      api.stage.innerHTML = '';                          // no stage graphic on this slide
      this._api = api; this._shown = false;
      if (api.revisit) {
        document.querySelectorAll('#lx-main .lx-inline-hint').forEach((h) => { h.style.display = 'none'; });
        this.revealC(true);
      }
    },
    onInfoClosed() { this.revealC(false); },              // part C appears after the price info box is opened + closed
    revealC(instant) {
      if (this._shown) return; this._shown = true;
      const api = this._api;
      const para = document.createElement('div'); para.className = 'lx-para lx-partc';
      para.innerHTML =
        `<span class="lx-hr"></span>` +
        `<p class="lx-tradehead"><span class="lx-th-lab">WHEN A TRADE TAKES PLACE</span><span class="lx-th-cond"><span class="lx-red">bid</span> ≥ <span class="lx-blue">price</span></span></p>` +
        `<div class="lx-earn" id="lx-earn"></div>` +
        `<div class="lx-nt" id="lx-nt"></div>` +
        `<button id="lx-c-ok" class="lx-ok" hidden>OK</button>`;
      document.getElementById('lx-main').appendChild(para);
      const earnEl = para.querySelector('#lx-earn'), ntEl = para.querySelector('#lx-nt'), okBtn = para.querySelector('#lx-c-ok');
      const earnLines = ['You earn the true value minus the <span class="lx-blue">price</span>.', 'The seller earns your <span class="lx-red">bid</span> minus the production cost.'];
      const noTrade = ['If there is no trade, neither you nor the seller earns anything.'];
      if (instant) {   // revisit → show all, gate open
        earnEl.innerHTML = earnLines.map((t) => `<p class="stmt">${t}</p>`).join('');
        ntEl.innerHTML = noTrade.map((t) => `<p class="stmt">${t}</p>`).join('');
        api.openGate(0); return;
      }
      // first visit → type the earnings, then OK reveals + types the no-trade line
      this._t1 = App.typewriter.run(earnEl, earnLines, () => { okBtn.hidden = false; okBtn.classList.add('show'); }, { speed: TYPE_SLOW });
      okBtn.addEventListener('click', () => {
        okBtn.style.display = 'none';
        this._t2 = App.typewriter.run(ntEl, noTrade, () => api.openGate(0), { speed: TYPE_SLOW });
      });
    },
    leave() { if (this._t1) this._t1.cancel(); if (this._t2) this._t2.cancel(); },
  };

  // -------------------------------------------------- bidding examples (step-by-step)
  const exBid = {
    enter(api) {
      const c = slide(api).exCase, id = slide(api).id, tv = c.tv, price = c.price, gateTv = !!c.gateOnTrueValue;
      const fmtBid = (b) => (b % 1 === 0 ? String(b) : b.toFixed(1));
      // outcome-dependent recap. trade → paid; no trade splits on whether skipping was wise:
      //   price > value → you rightly avoided overpaying;  price ≤ value → you missed a good deal
      const recapFor = (bid) => {
        if (bid >= price) return `You paid ${price} for a product worth${price > tv ? ' only' : ''} ${tv}.`;
        return price > tv
          ? `You avoided overpaying by not buying a product worth ${tv} for ${price}.`
          : `You missed a deal to buy a product worth ${tv} for ${price}.`;
      };
      const payoffs = (bid) => { const trade = bid >= price; return { trade, buyer: trade ? round1(tv - price) : 0, seller: trade ? round1(bid - (tv - 0.3)) : 0 }; };
      const pfHtml = (bid, cls) => { const p = payoffs(bid); return `<div class="lx-pf-cell ${cls}" id="lx-expfa">Your payoff <b class="${p.buyer < 0 ? 'lx-neg' : ''}">${p.buyer.toFixed(1)}</b></div><div class="lx-pf-cell ${cls}" id="lx-expfb">Seller's payoff <b>${p.seller.toFixed(1)}</b></div>`; };
      const calcStmts = (bid) => { const p = payoffs(bid); return p.trade
        ? [`You: value − price = ${tv.toFixed(1)} − ${price.toFixed(1)} = <b>${p.buyer.toFixed(1)}</b>`,
           `Seller: bid − (value − 0.3) = ${bid.toFixed(1)} − ${round1(tv - 0.3).toFixed(1)} = <b>${p.seller.toFixed(1)}</b>`,
           `<span class="lx-cost-note">production cost = value − 0.3</span>`]
        : ['No trade, so both earn <b>0</b>.']; };
      const advice = c.finalLines.slice(1).concat(c.strategy ? [c.strategy] : []);
      api.stage.innerHTML =
        `<div class="lx-graphic-slot">${lx.line()}</div>` +
        `<div class="lx-pf" id="lx-expf"></div>` +
        `<div class="lx-calc-box plain" id="lx-excalcbox"></div>` +
        `<div class="lx-slogan"><div class="lx-recap" id="lx-recap"></div><div class="lx-advice" id="lx-advice"></div></div>` +
        `<div class="lx-exbid lx-stg" id="lx-exbid"><div class="lx-slider-wrap lx-sw-full"><input type="range" id="lx-exslider" class="lx-range red" min="0" max="6" step="0.1" value="${c.bid}"></div><div class="${gateTv ? 'lx-exbid-gate' : 'lx-exbid-hint'}" id="lx-exhint">${gateTv ? 'set your bid to the true value' : 'use the slider to change the bid'}</div></div>`;
      const line = api.stage.querySelector('.lx-line');   // examples use full colour coding: value black, bid red, price blue
      { const adv = q('lx-advice');   // warnings red; the good case soft/happy pink
        if (adv) { if (id === 'ex-bid-3') adv.classList.add('lx-advice-happy'); else adv.style.color = (id === 'ex-bid-1' || id === 'ex-bid-2') ? '#dc3545' : ''; } }

      // update graph + payoffs + calc + recap + the "Your bid is X" left-text number for the current bid
      const update = (bid) => {
        lx.setLine(line, { tv: tv, bid: bid, price: price, band: true });
        q('lx-expf').innerHTML = pfHtml(bid, '');
        q('lx-excalcbox').innerHTML = calcStmts(bid).map((s) => `<p class="stmt">${s}</p>`).join('');
        q('lx-recap').textContent = recapFor(bid);
        const bn = document.getElementById('lx-exbidnum'); if (bn) bn.textContent = fmtBid(bid);
      };
      const slEl = q('lx-exslider'); this._interacted = false;
      slEl.addEventListener('input', () => {
        update(round1(+slEl.value));
        if (this._interacted) return;
        if (gateTv) {   // Next unlocks only once the bid is set to the true value
          if (round1(+slEl.value) === tv) { this._interacted = true; api.openGate(0); const h = q('lx-exhint'); if (h) h.classList.add('done'); }
        } else { this._interacted = true; api.openGate(0); }   // other examples: unlock on first interaction
      });

      this._t = [];
      const at = api.S.i, T = (ms, fn) => this._t.push(setTimeout(() => { if (api.S.i === at) fn(); }, ms));

      if (api.revisit) {   // Back → final state + active slider, gate open
        update(c.bid);
        q('lx-advice').innerHTML = advice.map((l) => `<div>${l}</div>`).join('');
        q('lx-exbid').classList.add('show');
        api.openGate(0);
        return;
      }

      // slow staged sequence: value → bid → price on the line, payoff, calc, recap, advice, then reveal the interactive slider
      lx.setLine(line, { tv: null, bid: null, price: null, band: false });
      T(600,  () => lx.setLine(line, { tv: tv, bid: null, price: null, band: false }));
      T(1900, () => lx.setLine(line, { tv: tv, bid: c.bid, price: null, band: false }));
      T(3200, () => lx.setLine(line, { tv: tv, bid: c.bid, price: price, band: true }));
      T(4400, () => { q('lx-expf').innerHTML = pfHtml(c.bid, 'lx-stg'); });
      T(4600, () => { const e = q('lx-expfa'); if (e) e.classList.add('show'); });
      T(5600, () => { const e = q('lx-expfb'); if (e) e.classList.add('show'); });
      T(6800, () => {
        if (App.typewriter) {
          this._calc = App.typewriter.run(q('lx-excalcbox'), calcStmts(c.bid), () => {
            T(1200, () => { this._recap = typeText(q('lx-recap'), recapFor(c.bid), TYPE_SLOW, () => {
              T(1500, () => { this._advice = App.typewriter.run(q('lx-advice'), advice, () => { q('lx-exbid').classList.add('show'); }, { speed: TYPE_SLOW }); });   // Next stays gated until the user drags the slider
            }); });
          }, { speed: TYPE_SLOW });
        } else { update(c.bid); q('lx-advice').innerHTML = advice.map((l) => `<div>${l}</div>`).join(''); q('lx-exbid').classList.add('show'); }
      });
    },
    leave() { (this._t || []).forEach(clearTimeout); if (this._calc) this._calc.cancel(); if (this._recap) this._recap.cancel(); if (this._advice) this._advice.cancel(); },
  };

  // -------------------------------------------------- Slide 12: strategy market (auto price → payoff-history bar plots)
  const BROOM = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right:5px"><path d="M19 4l-6 6"/><path d="M13.5 8.5l2 2"/><path d="M11 11l-6 6v2h2l6-6"/><path d="M8 16l2 2"/></svg>';
  const market = {
    enter(api) {
      const S = { tv: 3, bid: 3, price: null, showBuyer: true, showSeller: true, history: [] };
      this.M = S; this._timer = null;
      api.stage.innerHTML =
        `<div class="lx-market" id="lx-market">` +
          `<div class="lx-slider-wrap lx-sw-tv"><input type="range" id="lx-mk-tv" class="lx-range black" min="1" max="5" step="0.1" value="3"></div>` +
          `<div class="lx-svalue">True value <b id="lx-mk-tvval">3.0</b></div>` +
          `<div class="lx-slider-wrap lx-sw-full"><input type="range" id="lx-mk-bid" class="lx-range red" min="0" max="6" step="0.1" value="3"></div>` +
          `<div class="lx-svalue">Your <span class="lx-red">bid</span> <b id="lx-mk-bidval">3.0</b></div>` +
          lx.line() +
          `<div class="lx-price-row"><button id="lx-mk-die" class="lx-bluedie2" title="draw a price"></button><span class="lx-price-txt">Price <b class="lx-blue" id="lx-mk-price" style="opacity:0">—</b></span><label class="lx-pd-auto"><input type="checkbox" id="lx-mk-auto" checked> auto</label></div>` +
          `<div class="lx-market-checks"><label class="lx-mk-check"><input type="checkbox" id="lx-mk-cb-buyer" checked> buyer trade history</label><label class="lx-mk-check"><input type="checkbox" id="lx-mk-cb-seller" checked> seller trade history</label></div>` +
          `<div class="lx-market-plots" id="lx-mk-plots"></div>` +
          `<button class="lx-clear-mkt" id="lx-mk-clear">${BROOM}clear market history</button>` +
        `</div>`;
      const tvsl = q('lx-mk-tv'), tvval = q('lx-mk-tvval'), bidsl = q('lx-mk-bid'), bidval = q('lx-mk-bidval'), auto = q('lx-mk-auto');
      this._num = q('lx-mk-price'); this._line = api.stage.querySelector('.lx-line');
      tvsl.addEventListener('input', () => { S.tv = round1(+tvsl.value); tvval.textContent = S.tv.toFixed(1); this.paintLine(); });   // affects future rounds only
      bidsl.addEventListener('input', () => { S.bid = round1(+bidsl.value); bidval.textContent = S.bid.toFixed(1); this.paintLine(); });
      q('lx-mk-die').addEventListener('click', () => { auto.checked = false; this.stopAuto(); this.tick(); });
      auto.addEventListener('change', () => { if (auto.checked) this.startAuto(); else this.stopAuto(); });
      q('lx-mk-cb-buyer').addEventListener('change', (e) => { S.showBuyer = e.target.checked; this.paint(); });
      q('lx-mk-cb-seller').addEventListener('change', (e) => { S.showSeller = e.target.checked; this.paint(); });
      q('lx-mk-clear').addEventListener('click', () => { S.history = []; this.paint(); });
      this.paintLine(); this.paint();
      if (api.revisit) { q('lx-market').classList.add('show'); this.startAuto(); api.openGate(0); }
    },
    onStepsDone(api) { const m = q('lx-market'); if (m) m.classList.add('show'); this.startAuto(); api.openGate(12000); },   // reveal + Next after 12s
    startAuto() { this.stopAuto(); this.tick(); this._timer = setInterval(() => this.tick(), 1000); },
    stopAuto() { if (this._timer) { clearInterval(this._timer); this._timer = null; } },
    paintLine() { const l = this._line, S = this.M; if (l) lx.setLine(l, { tv: S.tv, bid: S.bid, price: S.price, band: true, tvTag: false, bidTag: false, priceTag: false }); },
    tick() {
      const S = this.M; S.price = rng.salesPrice(S.tv);
      const trade = S.bid >= S.price;
      S.history.push({ trade, buyer: trade ? round1(S.tv - S.price) : 0, seller: trade ? round1(S.bid - (S.tv - 0.3)) : 0 });
      if (S.history.length > 30) S.history.shift();   // longer buffer feeds the average-over-time plot; bars show only the last window
      const el = this._num; if (el) { const from = parseFloat(el.textContent) || S.tv; el.style.opacity = '1'; el.classList.remove('lx-numpop'); void el.offsetWidth; el.classList.add('lx-numpop'); animateNum(el, from, S.price, 500); }
      const d = q('lx-mk-die'); if (d) { d.classList.remove('spin2'); void d.offsetWidth; d.classList.add('spin2'); }
      this.paintLine();
      const pm = this._line && this._line.querySelector('.lx-mark.lx-price'); if (pm) { pm.classList.remove('lx-price-appear'); void pm.offsetWidth; pm.classList.add('lx-price-appear'); }
      this.paint();
    },
    paint() {
      const S = this.M, plots = q('lx-mk-plots'); if (!plots) return;
      const both = S.showBuyer && S.showSeller, barWindow = both ? 10 : 20, rows = S.history.slice(-barWindow);
      const cols = [];
      if (S.showBuyer) cols.push(this.columnHtml('buyer', rows, barWindow));
      if (S.showSeller) cols.push(this.columnHtml('seller', rows, barWindow));
      plots.innerHTML = cols.length ? cols.join(both ? '<div class="lx-mk-divider"></div>' : '') : '<div class="lx-mk-empty">tick a box to show a market</div>';
    },
    columnHtml(side, rows, N) {
      const cap = side === 'buyer' ? 'Buyer' : 'Seller';
      const axisMax = side === 'buyer' ? 1 : Math.max(0.5, ...rows.map((r) => Math.abs(r.seller)));   // buyer fixed ±1, seller auto-scales
      const series = this.avgSeries(side, N), cur = series.length ? series[series.length - 1] : null;   // average over the shown window
      const barTitle = `<div class="lx-mk-bar-title">${cap}'s payoffs (last ${N} rounds)</div>`;
      const avgTitle = `<div class="lx-mk-avg-title">${cap}'s average payoff (last ${N}) <b>${cur == null ? '—' : cur.toFixed(1)}</b></div>`;
      return `<div class="lx-plot-wrap">${barTitle}<div class="lx-plot">${this.barsHtml(rows, side, axisMax)}</div>${avgTitle}${this.avgPlotHtml(series, side)}</div>`;
    },
    barsHtml(rows, side, axisMax) {
      let cols = '';
      rows.forEach((r) => {
        const pay = r[side];
        if (!r.trade) { cols += `<div class="lx-plot-col"><span class="lx-plot-x">✘</span></div>`; return; }
        const h = Math.min(1, Math.abs(pay) / axisMax) * 50;   // % of the half-height
        cols += pay >= 0
          ? `<div class="lx-plot-col"><div class="lx-bar pos" style="height:${h}%"></div><span class="lx-bar-num" style="bottom:calc(50% + ${h}% + 3px)">${pay.toFixed(1)}</span></div>`
          : `<div class="lx-plot-col"><div class="lx-bar neg" style="height:${h}%"></div><span class="lx-bar-num" style="top:calc(50% + ${h}% + 3px)">${pay.toFixed(1)}</span></div>`;
      });
      return cols;
    },
    // trailing-K average payoff at each recorded tick (no-trade counts as 0)
    avgSeries(side, K) {
      const h = this.M.history, out = [];
      for (let i = 0; i < h.length; i++) { const s = Math.max(0, i - K + 1); let sum = 0; for (let j = s; j <= i; j++) sum += h[j][side]; out.push(sum / (i - s + 1)); }
      return out;
    },
    avgPlotHtml(series, side) {
      const W = 100, H = 40, mid = H / 2, pad = 3;
      const zero = `<line x1="0" y1="${mid}" x2="${W}" y2="${mid}" class="lx-avgplot-zero" vector-effect="non-scaling-stroke"/>`;
      if (!series.length) return `<div class="lx-avgplot"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${zero}</svg></div>`;
      const maxAbs = Math.max(0.4, ...series.map((v) => Math.abs(v))), n = series.length;
      const pts = series.map((v, i) => { const x = n === 1 ? W / 2 : (i / (n - 1)) * W; const y = mid - (v / maxAbs) * (mid - pad); return `${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ');
      const stroke = series[series.length - 1] >= 0 ? '#5a9e78' : '#c77e7e';   // green when the current average is positive, red when negative (both buyer and seller)
      return `<div class="lx-avgplot"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${zero}<polyline points="${pts}" class="lx-avgplot-line" style="stroke:${stroke}" vector-effect="non-scaling-stroke"/></svg></div>`;
    },
    leave() { this.stopAuto(); },
  };

  // -------------------------------------------------- final slide: closing directive
  const finalNote = {
    enter(api) {
      api.stage.innerHTML =
        `<div class="lx-finalnote">` +
          `<div class="lx-fn-lead" id="lx-fn1"></div>` +
          `<div class="lx-fn-sub" id="lx-fn2"></div>` +
          `<div class="lx-fn-sub" id="lx-fn3"></div>` +
        `</div>`;
      const L1 = 'You are done with the instructions, next is a quiz.';
      const L2 = 'You can use the back button and review the instructions.';
      const L3 = 'When you are ready click the Done button to proceed.';
      if (api.revisit) { q('lx-fn1').textContent = L1; q('lx-fn2').textContent = L2; q('lx-fn3').textContent = L3; api.openGate(0); return; }
      this._t = typeText(q('lx-fn1'), L1, TYPE_SLOW, () =>
        typeText(q('lx-fn2'), L2, TYPE_SLOW, () =>
          typeText(q('lx-fn3'), L3, TYPE_SLOW, () => api.openGate(0))));
    },
    leave() { if (this._t) this._t.cancel(); },
  };

  // price/earnings (tradeScene) are BENCHED — kept for a future complex trade slide; slide 6 now uses priceInfo
  return { product, twoPanel, reviews, disclosure, bid, priceInfo, price: tradeScene(false), earnings: tradeScene(true), exBid, market, finalNote };
})();
