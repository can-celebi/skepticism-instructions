// app.js — bootstrap + DOM wiring.
window.App = window.App || {};

(function () {
  const $ = (id) => document.getElementById(id);
  let warnTimer = null;
  const curSlide = () => App.state.get().slides[App.state.get().slide - 1];

  // the "this round" box (box 2) — recomputed live as the bid/price change
  App.payoffRoundLines = function () {
    const s = App.state.get();
    const p = s.payoff || {};
    const f = (x) => (x == null ? '—' : Number(x).toFixed(1));
    const tv = s.trueValue, bid = s.bid, price = p.salesPrice;
    const cost = Math.round((tv - 0.3) * 10) / 10;
    const round = ['<b>This round</b>'];
    if (p && p.salesPrice != null) {
      round.push(`True value ${f(tv)} · your bid ${f(bid)} · sales price ${f(price)}.`);
      if (p.trade) {
        round.push(`Buyer: true value − price = ${f(tv)} − ${f(price)} = <b>${f(p.buyerPayoff)}</b>`);
        round.push(`Seller: bid − (true value − 0.3) = ${f(bid)} − ${f(cost)} = <b>${f(p.sellerPayoff)}</b>`);
      } else {
        round.push('No trade — both earn <b>0</b>.');
      }
    } else {
      round.push('Press the blue dice to draw the price and see the numbers here.');
    }
    return round;
  };

  // payoff info = box 1 (general formula) + box 2 (this round, live)
  function payoffInfo() {
    const lines = App.config.INFO.payoff.lines.slice();
    return { key: 'payoff', side: 'left', title: App.config.INFO.payoff.title, lines, round: App.payoffRoundLines() };
  }

  function wire() {
    // seller controls
    $('dice').addEventListener('click', () => App.state.regenerateScenario());
    $('lock').addEventListener('change', (e) => App.state.setLockValue(e.target.checked));
    $('color-helper').addEventListener('change', (e) => {
      App.state.setRevealColors(e.target.checked);
      if (e.target.checked) {
        const w = $('color-warn');
        w.hidden = false;
        w.textContent = 'these colors are a teaching aid — NOT shown in the actual game';
        clearTimeout(warnTimer);
        warnTimer = setTimeout(() => { w.hidden = true; }, 4000);
      }
    });
    $('role-seller').addEventListener('click', () => App.state.setRole('seller'));
    $('role-buyer').addEventListener('click', () => App.state.setRole('buyer'));
    $('rerandom-btn').addEventListener('click', () => App.state.rerandomizeBuyer());

    // buyer bid
    $('bid').addEventListener('input', (e) => App.state.setBid(e.target.value));
    $('submit-bid').addEventListener('click', () => {
      if (App.state.get().phase === 'payoff') App.state.revertPayoff(); // "New bid"
      else App.state.submitBid();
    });
    $('price-dice').addEventListener('click', () => App.state.drawPrice());
    $('reveal-price-dice').addEventListener('click', () => App.state.revealPrice());
    $('topbar-dice').addEventListener('click', () => App.state.tutorialRandomize());
    $('calc-check').addEventListener('change', (e) => App.state.setShowCalc(e.target.checked));

    // info buttons — toggle (click again to close); shown on the OPPOSITE panel.
    // RIGHT-panel triggers → info on the LEFT:
    $('lock-info-btn').addEventListener('click', () => App.state.toggleInfo({ key: 'lock', side: 'left', ...App.config.INFO.lock }));
    $('color-info-btn').addEventListener('click', () => App.state.toggleInfo({ key: 'color', side: 'left', ...App.config.INFO.color }));
    $('trade-info-btn').addEventListener('click', () => App.state.toggleInfo(payoffInfo()));
    $('graph-info-btn').addEventListener('click', () => App.state.toggleInfo({ key: 'graph', side: 'left', ...App.config.INFO.graph }));
    $('left-info-close').addEventListener('click', () => App.state.clearInfo());
    // LEFT-panel trigger → info on the RIGHT:
    $('more-detail').addEventListener('click', () => {
      const sl = curSlide();
      App.state.toggleInfo({ key: 'more-detail', side: 'right', title: `${sl.title} — more detail`, lines: sl.extra });
    });
    $('right-info-close').addEventListener('click', () => App.state.clearInfo());

    // example stepper
    $('ex-prev').addEventListener('click', () => App.state.setExampleCase(App.state.get().exampleCase - 1));
    $('ex-next').addEventListener('click', () => App.state.setExampleCase(App.state.get().exampleCase + 1));

    // acknowledge (OK) + click-to-skip the typewriter
    $('ok-ack').addEventListener('click', () => App.state.acknowledge());
    $('slide-main').addEventListener('click', () => App.slides.skipTyping());

    // mobile one-panel switcher (edge arrow tab)
    $('panel-switch').addEventListener('click', () => {
      App.state.setMobileView(App.state.get().mobileView === 'right' ? 'left' : 'right');
    });

    // footer nav
    $('next-btn').addEventListener('click', () => App.state.advanceSlide());
    $('back-btn').addEventListener('click', () => App.state.backSlide());
  }

  window.addEventListener('DOMContentLoaded', () => {
    wire();
    App.state.subscribe((s) => { App.slides.render(s); App.sandbox.render(s); });
    App.dataSource.init({
      onSlides: (slides) => App.state.setSlides(slides),
      onScenario: (sc) => App.state.initScenario(sc),
      onResume: (progress) => App.state.restore(progress),
    });
  });
})();
