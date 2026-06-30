// sandbox.js — RIGHT panel renderer. Seller controls vs buyer bid; payoff is
// appended below the bid (nothing above changes). Capability follows the slide.
window.App = window.App || {};

App.sandbox = (function () {
  const $ = (id) => document.getElementById(id);
  let allChart = null, discChart = null, allKey = '', discKey = '';
  let lastPayoffRef = null, plTimers = [];
  const pct = (v) => (App.util.clamp(v, 0, 6) / 6) * 100;
  const clearPlTimers = () => { plTimers.forEach(clearTimeout); plTimers = []; };
  const show = (el, on) => { if (!el) return; el.classList.toggle('u-hide', !on); if (on) el.hidden = false; };
  const fmt = (x) => (x == null ? '—' : Number(x).toFixed(1));

  function stats(values) {
    if (!values.length) return 'Min —  ·  Avg —  ·  Max —';
    return `Min ${Math.min(...values).toFixed(1)}  ·  Avg ${App.util.mean(values).toFixed(1)}  ·  Max ${Math.max(...values).toFixed(1)}`;
  }

  function render(s) {
    const sb = $('sandbox');
    const slide = s.slides[s.slide - 1] || {};
    const isExample = !!slide.example;
    sb.dataset.role = s.role;
    sb.dataset.phase = s.phase;
    show($('role-toggle'), s.slide >= 5 && !isExample);
    $('role-seller').classList.toggle('active', s.role === 'seller');
    $('role-buyer').classList.toggle('active', s.role === 'buyer');
    $('color-helper').checked = s.revealColors;

    // right-side info screen (triggered by LEFT-panel info buttons) replaces the UI
    const rightInfo = s.info && s.info.side === 'right' ? s.info : null;
    show($('sandbox'), !rightInfo);
    const ri = $('right-info');
    ri.classList.toggle('hide', !rightInfo);
    if (rightInfo) {
      $('right-info-title').textContent = rightInfo.title;
      $('right-info-body').innerHTML = rightInfo.lines.map((l) => `<p class="stmt">${l}</p>`).join('');
    }

    // example walkthrough replaces the decision UI
    show($('example-view'), isExample);
    show($('decision-view'), !isExample);
    if (isExample) { renderExample(s, slide); return; }
    renderDecision(s);
  }

  function renderExample(s, slide) {
    const cases = slide.cases || [];
    const i = Math.max(0, Math.min(s.exampleCase, cases.length - 1));
    const c = cases[i] || {};
    $('ex-count').textContent = `${i + 1} / ${cases.length}`;
    $('ex-prev').disabled = i === 0;
    $('ex-next').disabled = i === cases.length - 1;
    $('ex-label').textContent = c.label || c.kind || '';
    $('ex-note').textContent = c.note || '';
    $('ex-visual').innerHTML = slide.example === 'bid' ? bidVisual(c) : reviewsVisual(c);
    // takeaway appears once you've stepped through every case
    const last = i === cases.length - 1;
    const tk = $('ex-takeaway');
    tk.classList.toggle('u-hide', !last);
    if (last) tk.textContent = (slide.extra && slide.extra[0]) || '';
  }

  function bidVisual(c) {
    const trade = c.price != null ? c.bid >= c.price : null;
    let m = '<div class="ex-line"><div class="ex-base"></div>';
    m += `<div class="ex-mark ex-tv" style="left:${pct(c.tv)}%"></div>`;
    m += `<div class="ex-mark ex-bid" style="left:${pct(c.bid)}%"></div>`;
    if (c.price != null) m += `<div class="ex-mark ex-price" style="left:${pct(c.price)}%"></div>`;
    m += '<div class="pl-ends"><span>0</span><span>6</span></div></div>';
    m += '<div class="pl-legend">';
    m += `<span class="lg lg-tv">true value <b>${c.tv.toFixed(1)}</b></span>`;
    m += `<span class="lg lg-bid">your bid <b>${c.bid.toFixed(1)}</b></span>`;
    if (c.price != null) m += `<span class="lg lg-price">price <b>${c.price.toFixed(1)}</b></span>`;
    m += '</div>';
    if (c.price != null) m += `<div class="pf-trade ${trade ? 'yes' : 'no'}" style="margin-top:10px">${trade ? '✓ You buy' : '✗ You don’t buy'}</div>`;
    return m;
  }

  function reviewsVisual(c) {
    const sample = [2.9, 3.1, 3.2, 3.4, 3.5, 3.5, 3.7, 3.8, 4.0, 4.2];
    const shown = sample.slice(0, c.n);
    let m = '<div class="ex-reviews">';
    shown.forEach((v) => { m += `<div class="ex-rev"><div class="ex-rev-bar" style="height:${(v / 5) * 70 + 8}px"></div><span>${v.toFixed(1)}</span></div>`; });
    m += `</div><div class="ex-rev-label">${c.n} of 10 reviews shown</div>`;
    return m;
  }

  function renderDecision(s) {
    const slideObj = s.slides[s.slide - 1] || {};
    if (slideObj.tutorial) { renderPriceTutorial(s, slideObj.tutorial); return; }
    const seller = s.role === 'seller';
    const buyer = !seller;
    const payoff = s.phase === 'payoff';
    const slide = s.slide;
    const selectable = slide >= 4 && seller && !payoff;
    const discValues = App.state.disclosedValues();
    const hasDisc = discValues.length > 0;

    show($('tut-topbar'), false); // only the price/trade tutorials use the top die

    // disclosed anchor (slide ≥ 4); title depends on whose view it is
    show($('disclosed-block'), slide >= 4);
    $('disc-title').textContent = seller ? "Reviews shown by the seller" : "Reviews seen by the buyer";
    show($('rerandom-btn'), buyer && slide >= 5);
    $('rerandom-btn').classList.toggle('shake', slide === 5 && s.s5 === 'rerandom'); // nudge until clicked
    show($('no-disclosed'), !hasDisc);
    $('discChart').style.visibility = hasDisc ? 'visible' : 'hidden';
    $('disc-stats').textContent = stats(discValues);

    // seller's 10 reviews (seller, slide ≥ 3)
    show($('all-block'), seller && slide >= 3);
    $('all-stats').textContent = stats(s.reviews);
    $('allChart').style.cursor = selectable ? 'pointer' : 'default';

    // tv-block: intro (slide 1) shows the product + stars; seller slides ≥2 show
    // the true value. Product image is prominent on slides 1–2, then a faded
    // background behind the value from slide 3 on.
    const intro = slide === 1;
    show($('tv-block'), intro || (seller && slide >= 2));
    show($('product-block'), intro || slide === 2);
    show($('tv-num-wrap'), !intro && seller && slide >= 2);
    $('tv-label').textContent = intro ? 'A product you bought' : 'True value of the product';
    const showBg = seller && slide >= 3;
    show($('tv-bg'), showBg);
    if ((intro || slide === 2) && s.product) $('product-img').src = s.product;
    if (showBg && s.product) $('tv-bg').src = s.product;
    $('tv-stars').innerHTML = s.trueValue == null ? '' : App.stars.html(s.trueValue);
    $('true-value').textContent = fmt(s.trueValue);
    show($('tv-lock'), s.lockValue);
    $('tv-block').classList.toggle('locked', s.lockValue);

    // seller controls (dice always; lock/color from slide 3)
    show($('controls'), seller && slide >= 2);
    const toggles = document.querySelector('#controls .toggles');
    show(toggles, slide >= 3);

    // buyer bid (slide ≥ 5)
    show($('bid-block'), buyer && slide >= 5);
    $('bid-block').classList.toggle('inactive', payoff);
    const submit = $('submit-bid');
    if (payoff) { submit.textContent = 'New bid'; submit.classList.add('new-bid'); submit.disabled = false; }
    else { submit.textContent = 'Submit'; submit.classList.remove('new-bid'); submit.disabled = false; }
    // slide 5 payoff: the next action is the black die, so hide the submit/New-bid row
    show($('submit-row'), !(slide === 5 && payoff));
    // slider: thumb + value always visible (smooth, grabbable, touch-friendly)
    const knob = $('bid');
    knob.classList.add('show-slider-knob');
    $('bid-text').style.opacity = '1';
    $('bid-text').textContent = fmt(s.bid);
    knob.value = s.bid;

    // payoff (buyer, after submit)
    show($('payoff-module'), buyer && payoff);
    const play = slide === 8 && buyer && payoff; // full free-play layout
    $('price-graph-block').classList.toggle('play', play);
    if (play) {
      // order: payoffs → true value + sales price → blue die → graph
      show($('tv-reveal-only'), false);
      show($('pf-trade-row'), true); show($('trade-info-btn'), false);
      show($('pf-table'), true);
      show($('calc-toggle'), true); $('calc-check').checked = s.showCalc; show($('calc-box'), s.showCalc);
      show($('reveal-dice-row'), false);
      show($('price-graph-block'), true);
      show($('price-line-head'), false); show($('price-hint'), false); show($('tut-outcome'), false);
      show($('sales-price-row'), true); show($('pf-reveal'), true);
      $('pf-tv-reveal').textContent = fmt(s.trueValue);
      $('pf-tv-stars').innerHTML = App.stars.html(s.trueValue);
      $('sales-price-val').textContent = fmt(s.salesPrice);
      if (s.payoff) { fillOutcome(s, s.payoff); drawPriceMarkers(s, false); if (s.showCalc) $('calc-box').innerHTML = calcLines(s); }
    } else {
      // slide 5 = reveal the TRUE VALUE only (predict-the-value practice)
      show($('tv-reveal-only'), buyer && payoff);
      ['pf-trade-row', 'pf-table', 'reveal-dice-row', 'price-graph-block', 'calc-toggle', 'calc-box', 'tut-outcome', 'pf-reveal', 'sales-price-row'].forEach((id) => show($(id), false));
      if (buyer && payoff) {
        $('tv-reveal-only-val').textContent = fmt(s.trueValue);
        $('tv-reveal-only-stars').innerHTML = App.stars.html(s.trueValue);
      }
    }

    renderCharts(s, seller, payoff, slide, discValues, hasDisc);
  }

  // always two lines (trade or not) so the box height never changes → no Y-jump
  function calcLines(s) {
    const p = s.payoff || {};
    if (!s.payoff || s.salesPrice == null) return '';
    const tv = s.trueValue, bid = s.bid, price = s.salesPrice, cost = App.util.round1(tv - 0.3);
    if (p.trade) {
      return `Buyer: value − price = ${fmt(tv)} − ${fmt(price)} = <b>${fmt(p.buyerPayoff)}</b><br>` +
             `Seller: bid − (value − 0.3) = ${fmt(bid)} − ${fmt(cost)} = <b>${fmt(p.sellerPayoff)}</b>`;
    }
    return `No trade — bid ${fmt(bid)} is below the price ${fmt(price)}.<br>` +
           `Buyer earns <b>0</b> · Seller earns <b>0</b>`;
  }

  // band + true value / bid / price markers (shared by the tutorial and payoff)
  function drawPriceMarkers(s, withOutcome) {
    const tv = s.trueValue, bid = s.bid, price = s.salesPrice;
    const lo = App.util.clamp(tv - App.config.PRICE_BAND, 0, 6);
    const hi = App.util.clamp(tv + App.config.PRICE_BAND, 0, 6);
    $('pl-band').style.left = pct(lo) + '%';
    $('pl-band').style.width = (pct(hi) - pct(lo)) + '%';
    setMark('pl-tv', tv); setMark('pl-bid', bid);
    $('lg-tv').textContent = fmt(tv);
    $('lg-bid').textContent = fmt(bid);
    const priceM = $('pl-price');
    priceM.style.transition = 'none';
    if (price != null) {
      setMark('pl-price', price); priceM.style.opacity = '1';
      $('lg-price').textContent = fmt(price);
      if (withOutcome) {
        const trade = bid >= price;
        const o = $('tut-outcome');
        o.textContent = trade ? '✓ Trade — you buy' : '✗ No trade';
        o.className = 'pf-trade ' + (trade ? 'yes' : 'no');
        show(o, true);
      }
    } else { priceM.style.opacity = '0'; $('lg-price').textContent = '—'; }
  }

  // dedicated interactive Price tutorial: true value + free bid slider + the
  // gray band, and the blue dice draws the price (instant) → trade/no-trade.
  function renderPriceTutorial(s, mode) {
    const isTrade = mode === 'trade';
    ['disclosed-block', 'all-block', 'controls', 'role-toggle', 'submit-row', 'pf-reveal', 'reveal-dice-row', 'tv-reveal-only'].forEach((id) => show($(id), false));
    // true value (revealed) with the faded product behind it
    show($('tv-block'), true);
    show($('product-block'), false); show($('tv-num-wrap'), true); show($('tv-lock'), false);
    show($('tv-bg'), true); if (s.product) $('tv-bg').src = s.product;
    $('tv-label').textContent = 'True value of the product';
    $('tv-stars').innerHTML = App.stars.html(s.trueValue);
    $('true-value').textContent = fmt(s.trueValue);
    // free bid slider (no submit)
    show($('bid-block'), true);
    $('bid-block').classList.remove('inactive');
    const knob = $('bid');
    knob.classList.add('show-slider-knob');
    $('bid-text').style.opacity = '1';
    $('bid-text').textContent = fmt(s.bid);
    knob.value = s.bid;
    // price graph + blue (price) and black (re-randomize) dice + sales price value
    show($('payoff-module'), true);
    show($('price-graph-block'), true);
    show($('tut-topbar'), true); // black re-randomize die at the very top
    show($('sales-price-row'), true);
    $('sales-price-val').textContent = s.salesPrice != null ? fmt(s.salesPrice) : '—';
    drawPriceMarkers(s, !isTrade); // price mode → trade/no-trade line; trade mode → payoff boxes
    // trade mode (slide 7): payoff boxes + a "show calculation" checkbox
    show($('pf-trade-row'), isTrade);
    show($('trade-info-btn'), false);
    show($('pf-table'), isTrade);
    show($('calc-toggle'), isTrade);
    show($('tut-outcome'), !isTrade);
    $('calc-check').checked = s.showCalc;
    show($('calc-box'), isTrade && s.showCalc);
    if (isTrade && s.payoff) {
      fillOutcome(s, s.payoff);
      if (s.showCalc) $('calc-box').innerHTML = calcLines(s);
    }
  }

  function renderCharts(s, seller, payoff, slide, discValues, hasDisc) {
    if (seller && slide >= 3 && !payoff) {
      const key = s.reviews.join(',') + '|' + s.disclosed.slice().sort().join(',') + '|' + s.revealColors;
      if (key !== allKey || !allChart) {
        if (allChart) allChart.destroy();
        const onIndex = (i) => {
          const st = App.state.get();
          if (st.role === 'seller' && st.slide >= 4 && st.phase === 'decision') App.state.toggleDisclose(i);
        };
        allChart = App.charts.make($('allChart'), s.reviews, App.charts.allReviewColors(s), onIndex);
        allKey = key;
      }
    } else if (allChart) { allChart.destroy(); allChart = null; allKey = ''; }

    if (hasDisc) {
      const key = discValues.join(',') + '|' + s.revealColors + '|' + s.trueValue;
      if (key !== discKey || !discChart) {
        if (discChart) discChart.destroy();
        const colors = discValues.map((v) => App.charts.barColor(v, s.trueValue, true, s.revealColors));
        discChart = App.charts.make($('discChart'), discValues, colors, null);
        discKey = key;
      }
    } else if (discChart) { discChart.destroy(); discChart = null; discKey = ''; }
  }

  // ---- payoff ----
  function fillOutcome(s, p) {
    const bn = $('pf-buyer-num'), sn = $('pf-seller-num');
    if (p.trade) {
      $('pf-trade').textContent = '✓ Trade occurred';
      $('pf-trade').className = 'pf-trade yes';
      bn.textContent = fmt(p.buyerPayoff); sn.textContent = fmt(p.sellerPayoff);
    } else {
      $('pf-trade').textContent = '✗ No trade';
      $('pf-trade').className = 'pf-trade no';
      bn.textContent = '0'; sn.textContent = '0';
    }
    bn.classList.toggle('neg', (p.trade ? p.buyerPayoff : 0) < 0);
    sn.classList.toggle('neg', (p.trade ? p.sellerPayoff : 0) < 0);
  }

  const setMark = (id, value) => { $(id).style.left = pct(value) + '%'; };

  function renderPayoff(s) {
    const p = s.payoff;
    fillOutcome(s, p);

    // the price number-line only exists from slide 7
    if (s.slide < 7) { lastPayoffRef = null; return; }

    $('pf-tv-reveal').textContent = fmt(s.trueValue);
    $('pf-tv-stars').innerHTML = App.stars.html(s.trueValue);
    const tv = s.trueValue, bid = s.bid, price = p.salesPrice;
    const lo = App.util.clamp(tv - App.config.PRICE_BAND, 0, 6);
    const hi = App.util.clamp(tv + App.config.PRICE_BAND, 0, 6);
    $('pl-band').style.left = pct(lo) + '%';
    $('pl-band').style.width = (pct(hi) - pct(lo)) + '%';
    setMark('pl-tv', tv); setMark('pl-bid', bid);
    $('lg-tv').textContent = fmt(tv);
    $('lg-bid').textContent = fmt(bid);

    const priceM = $('pl-price');
    if (s.payoff !== lastPayoffRef) {
      lastPayoffRef = s.payoff;
      clearPlTimers();
      priceM.style.transition = 'none';
      priceM.style.left = pct(tv) + '%';
      priceM.style.opacity = '0';
      $('lg-price').textContent = '—';
      plTimers.push(setTimeout(() => {
        priceM.style.transition = 'left 0.9s cubic-bezier(.2,.8,.2,1), opacity 0.3s';
        priceM.style.left = pct(price) + '%';
        priceM.style.opacity = '1';
      }, 60));
      plTimers.push(setTimeout(() => { $('lg-price').textContent = fmt(price); }, 980));
    } else {
      setMark('pl-price', price);
      priceM.style.opacity = '1';
      $('lg-price').textContent = fmt(price);
    }
  }

  return { render };
})();
