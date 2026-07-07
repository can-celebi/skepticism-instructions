// state.js — single source of truth + mutations + tiny pub/sub.
// Capability follows the CURRENT slide; each slide has ONE completion condition
// that gates Next and is the persisted resume anchor.
window.App = window.App || {};

App.state = (function () {
  const { round1 } = App.util;
  const { N_SLIDES, CONDITION, PROD_COST_OFFSET } = App.config;

  const listeners = [];
  const s = {
    // scenario
    trueValue: null,
    reviews: [],
    disclosed: [],        // INDICES into reviews
    salesPrice: null,
    bid: 3.0,
    lockValue: false,
    role: 'seller',
    phase: 'decision',    // 'decision' | 'payoff'
    revealColors: false,
    payoff: null,
    priceRevealed: false, // payoff: show the price graphic only after the blue dice
    showCalc: false,      // trade tutorial: show the calculation box
    s5: 'bid',            // slide-5 two-round step: 'bid'|'rerandom'|'bid2'|'done'
    product: null,        // current product image path

    // progression
    slides: [],
    slide: 1,
    maxSlideReached: 1,
    completed: {},        // slide → bool
    acknowledged: {},     // slide → bool (subject clicked OK; reveals the right panel)
    mobileView: 'left',   // narrow screens show ONE panel: 'left' (text) | 'right' (task)
    info: null,           // { side:'left'|'right', key, title, lines } or null
    exampleCase: 0,       // current case index on an example slide
    _savedProgress: 0,
  };
  for (let n = 1; n <= N_SLIDES; n++) { s.completed[n] = false; s.acknowledged[n] = false; }

  function emit() { recordProgress(); listeners.forEach((fn) => fn(s)); }
  function subscribe(fn) { listeners.push(fn); }
  function disclosedValues() { return s.disclosed.map((i) => s.reviews[i]).sort((a, b) => a - b); }

  function gateOk(n) { return !!s.completed[n]; }

  // mark the current slide complete if the action matches its condition
  function satisfy(action) {
    if (CONDITION[s.slide] === action) s.completed[s.slide] = true;
  }
  function onEnterSlide() {
    // 'visited' slides no longer auto-complete on arrival — the subject must click
    // OK (acknowledge) to complete them and reveal the right panel. jumpTo() force-
    // acknowledges resumed slides so a reconnect never re-plays the OK gate.
    // role follows the slide context: seller for the seller-side slides (≤4),
    // buyer for the bid/earnings slides (≥7); slides 5–6 keep the user's toggle.
    if (s.slide <= 4 && s.role !== 'seller') { s.role = 'seller'; s.phase = 'decision'; s.payoff = null; }
    if (s.slide >= 5 && s.role !== 'buyer') { s.role = 'buyer'; s.phase = 'decision'; s.payoff = null; }
    s.maxSlideReached = Math.max(s.maxSlideReached, s.slide);
    s.info = null;
    s.exampleCase = 0;
    s.priceRevealed = false;
    s.showCalc = false;
    s.mobileView = 'left'; // every slide opens on its instruction text
    if (s.slide === 5) s.s5 = 'bid'; // restart the two-round predict flow
  }

  // OK button: acknowledge the current slide's text, revealing the right panel.
  // For 'visited' slides this is also the completion condition (there is no action).
  function acknowledge() {
    const slide = s.slides[s.slide - 1];
    s.acknowledged[s.slide] = true;
    if (CONDITION[s.slide] === 'visited') s.completed[s.slide] = true;
    // on mobile, jump to the task view — unless there is no right panel (end pages)
    s.mobileView = slide && slide.single ? 'left' : 'right';
    emit();
  }
  function setMobileView(which) { s.mobileView = which === 'right' ? 'right' : 'left'; emit(); }

  // the JSON progress object (resume anchor) — sent/persisted on every update
  function buildProgress(lastCompleted) {
    const completedSlides = {};
    for (let n = 1; n <= N_SLIDES; n++) completedSlides[n] = !!s.completed[n];
    return { version: 1, lastCompletedSlide: lastCompleted, slide: s.slide, completedSlides };
  }
  // furthest reached slide that is complete → persist when it changes
  function recordProgress() {
    let f = 0;
    for (let n = 1; n <= N_SLIDES; n++) if (n <= s.maxSlideReached && s.completed[n]) f = n;
    if (f !== s._savedProgress) { s._savedProgress = f; App.dataSource.saveProgress(buildProgress(f)); }
  }
  // read a progress object and take the subject to that state (empty → beginning)
  function restore(progress) {
    if (!progress || !progress.lastCompletedSlide) return;
    jumpTo(progress.lastCompletedSlide);
  }

  function recomputePayoff() {
    const trade = s.bid >= s.salesPrice;
    s.payoff = {
      salesPrice: s.salesPrice,
      trade,
      buyerPayoff: trade ? round1(s.trueValue - s.salesPrice) : 0,
      sellerPayoff: trade ? round1(s.bid - (s.trueValue - PROD_COST_OFFSET)) : 0,
    };
  }

  // ---- setup ----
  function setSlides(slides) { s.slides = slides; }
  function initScenario(sc) {
    s.trueValue = sc.trueValue;
    s.reviews = sc.reviews;
    s.product = sc.product;
    s.disclosed = [];
    s.salesPrice = null; s.bid = 3.0; s.phase = 'decision'; s.payoff = null;
    onEnterSlide(); // slide 1
    emit();
  }

  // ---- mutations ----
  function regenerateScenario() {
    const sc = App.dataSource.newScenario({ lockValue: s.lockValue, prevTrueValue: s.trueValue, prevProduct: s.product });
    s.trueValue = sc.trueValue;
    s.reviews = sc.reviews;
    s.product = sc.product;
    s.salesPrice = null; s.bid = 3.0; s.phase = 'decision'; s.payoff = null;
    s.disclosed = s.role === 'buyer' ? sc.disclosedAuto.slice() : [];
    satisfy('roll');
    if (s.role === 'buyer' && s.disclosed.length && CONDITION[s.slide] === 'disclose') s.completed[s.slide] = true;
    App.dataSource.persistState({ event: 'regenerate', trueValue: s.trueValue, role: s.role });
    emit();
  }

  function toggleDisclose(i) {
    if (s.role !== 'seller') return;
    const at = s.disclosed.indexOf(i);
    if (at >= 0) s.disclosed.splice(at, 1); else s.disclosed.push(i);
    if (s.disclosed.length >= 1) satisfy('disclose');
    App.dataSource.persistState({ event: 'disclose', disclosed: disclosedValues() });
    emit();
  }

  function setBid(v) {
    s.bid = App.util.clamp(round1(parseFloat(v)), 0, 6);
    // trade tutorial (slide 7): payoffs/calc react live to the slider once a price exists
    const slide = s.slides[s.slide - 1];
    if (slide && slide.tutorial === 'trade' && s.salesPrice != null) recomputePayoff();
    emit();
  }

  function submitBid() {
    if (s.bid == null) return;
    if (s.salesPrice == null) s.salesPrice = App.dataSource.computeSalesPrice(s.trueValue);
    recomputePayoff();
    s.phase = 'payoff';
    s.priceRevealed = false; // price graphic hidden until the blue dice is pressed
    s.info = null; // auto-close any open payoff/calc info on a fresh submit
    satisfy('submit');
    // slide 5 = two-round predict-the-value: complete only after the 2nd submit
    if (s.slide === 5) {
      if (s.s5 === 'bid') s.s5 = 'rerandom';
      else if (s.s5 === 'bid2') { s.completed[5] = true; s.s5 = 'done'; }
    }
    App.dataSource.onDecision({
      role: s.role, trueValue: s.trueValue, reviews: s.reviews,
      disclosed: disclosedValues(), bid: s.bid, ...s.payoff,
    });
    emit();
  }

  // dice on the payoff: redraw the random sales price and re-animate
  function rerollPrice() {
    if (s.phase !== 'payoff') return;
    s.salesPrice = App.dataSource.computeSalesPrice(s.trueValue);
    recomputePayoff();
    emit();
  }

  function revertPayoff() { s.phase = 'decision'; s.payoff = null; s.info = null; s.priceRevealed = false; emit(); }

  // payoff: the blue dice reveals the price graphic and draws the price
  function revealPrice() { s.priceRevealed = true; drawPrice(); }

  // price/trade tutorial: re-randomize the whole scenario (new value + product + price)
  function tutorialRandomize() {
    const sc = App.dataSource.newScenario({});
    s.trueValue = sc.trueValue; s.reviews = sc.reviews; s.product = sc.product;
    s.disclosed = sc.disclosedAuto.slice();
    s.bid = 3.0; s.phase = 'decision'; s.payoff = null;
    drawPrice(); // sets the price + satisfies 'price'
  }
  function setShowCalc(b) { s.showCalc = !!b; emit(); }

  function setRole(r) {
    if (s.role === r) return;
    s.role = r; s.phase = 'decision'; s.payoff = null;
    if (r === 'buyer') satisfy('buyer');
    emit();
  }

  // buyer re-randomize: new product/value, then disclose the top K highest reviews
  function rerandomizeBuyer() {
    const sc = App.dataSource.newScenario({});
    s.trueValue = sc.trueValue; s.reviews = sc.reviews; s.product = sc.product;
    s.salesPrice = null; s.bid = 3.0; s.phase = 'decision'; s.payoff = null; s.info = null;
    const k = 1 + Math.floor(Math.random() * 6); // 1..6
    const idx = s.reviews.map((v, i) => i).sort((a, b) => s.reviews[b] - s.reviews[a]);
    s.disclosed = idx.slice(0, Math.min(k, s.reviews.length));
    if (s.slide === 5 && s.s5 === 'rerandom') s.s5 = 'bid2'; // ready for the 2nd bid
    emit();
  }

  function setExampleCase(i) {
    const slide = s.slides[s.slide - 1];
    const n = slide && slide.cases ? slide.cases.length : 1;
    s.exampleCase = Math.max(0, Math.min(i, n - 1));
    // after stepping through all cases, the takeaway shows and (a couple
    // seconds later) Next unlocks
    if (s.exampleCase === n - 1 && !s.completed[s.slide]) {
      const sl = s.slide;
      setTimeout(() => { if (s.slide === sl && CONDITION[sl] === 'example') { s.completed[sl] = true; emit(); } }, 2200);
    }
    emit();
  }

  // draw the sales price (instant) — used by the price tutorial and the payoff dice
  function drawPrice() {
    s.salesPrice = App.dataSource.computeSalesPrice(s.trueValue);
    recomputePayoff();
    satisfy('price');
    emit();
  }
  function setLockValue(b) { s.lockValue = !!b; emit(); }
  function setRevealColors(b) { s.revealColors = !!b; emit(); }
  // info screens are toggle buttons: clicking the same key again closes it.
  // `side` is the panel OPPOSITE the trigger ('left' for right-panel triggers).
  function toggleInfo(info) {
    if (s.info && s.info.key === info.key) s.info = null;
    else s.info = info;
    emit();
  }
  function clearInfo() { s.info = null; emit(); }

  function advanceSlide() {
    if (s.slide >= N_SLIDES || !gateOk(s.slide)) return;
    s.slide += 1; onEnterSlide(); emit();
  }
  function backSlide() {
    if (s.slide <= 1) return;
    s.slide -= 1; onEnterSlide(); emit();
  }

  // resume after reload/reconnect: force-complete slides ≤ n, open at n
  function jumpTo(n) {
    n = Math.max(1, Math.min(n, N_SLIDES));
    if (n <= 1) return;
    for (let k = 1; k <= n; k++) { s.completed[k] = true; s.acknowledged[k] = true; }
    s.slide = n; s.maxSlideReached = Math.max(s.maxSlideReached, n);
    onEnterSlide(); // set role/phase for the resumed slide (else buyer slides show seller UI)
    emit(); // recordProgress re-saves the resumed position
  }

  return {
    get: () => s, subscribe, gateOk, disclosedValues,
    setSlides, initScenario,
    regenerateScenario, toggleDisclose, setBid, submitBid, rerollPrice, revertPayoff,
    setRole, setLockValue, setRevealColors, toggleInfo, clearInfo, setExampleCase, rerandomizeBuyer, drawPrice, revealPrice,
    tutorialRandomize, setShowCalc,
    acknowledge, setMobileView,
    advanceSlide, backSlide, jumpTo, restore,
  };
})();
