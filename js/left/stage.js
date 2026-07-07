// stage.js — App.stage : the LEFT-column framework (nav, OK/typewriter steps, carousel,
// die/tick controls, gated scene reveal, static-on-revisit).
window.App = window.App || {};

App.stage = (function () {
  const $ = (id) => document.getElementById(id);
  const SLIDES = App.content.SLIDES;

  let S = null, active = null, carTimer = null, typeHandle = null, warnT = null;

  function showWarn(msg) { const w = $('lx-warn'); w.textContent = msg; w.hidden = false; clearTimeout(warnT); warnT = setTimeout(() => { w.hidden = true; }, 3500); }
  function setTv(v) { const e = $('lx-tvinline-val'); if (e) e.textContent = App.util.round1(v).toFixed(1); }

  function stopCarousel() { if (carTimer) { clearInterval(carTimer); carTimer = null; } }
  function carousel(fn, ms) { stopCarousel(); const at = S.i; fn(); carTimer = setInterval(() => { if (S.i !== at) { stopCarousel(); return; } fn(); }, ms); }
  function spinDie() { const d = $('lx-die'); if (d) { d.classList.remove('spin'); void d.offsetWidth; d.classList.add('spin'); } }

  // ---- text steps ----
  function typeStep(stepIdx, onDone) {
    const step = SLIDES[S.i].steps[stepIdx];
    const target = stepIdx === 0 ? $('lx-main') : $('lx-below-text');
    const para = document.createElement('div'); para.className = 'lx-para'; target.appendChild(para);
    typeHandle = App.typewriter.run(para, step.text, () => { if (onDone) onDone(); afterStepTyped(stepIdx); });
  }
  function staticStep(stepIdx) {
    const step = SLIDES[S.i].steps[stepIdx];
    const target = stepIdx === 0 ? $('lx-main') : $('lx-below-text');
    const para = document.createElement('div'); para.className = 'lx-para';
    para.innerHTML = step.text.map((t) => `<p class="stmt">${t}</p>`).join('');
    target.appendChild(para);
  }
  function advanceStep() {
    const steps = SLIDES[S.i].steps;
    if (S.step >= steps.length - 1) {
      if (active && active.gatedReveal && !S.revealed) { S.revealed = true; hideOk(); if (active.reveal) active.reveal(api); }
      else hideOk();
      return;
    }
    S.step += 1; hideOk();
    typeStep(S.step, () => { if (S.step < steps.length - 1) showOk(); else hideOk(); });
    if (active && active.onStep) active.onStep(S.step, api);
  }
  function afterStepTyped(stepIdx) { const sl = SLIDES[S.i]; if (stepIdx >= sl.steps.length - 1 && !sl.manualGate) unlockNextSoon(sl.gateDelayMs || 0); }
  function showOk() { const b = $('lx-ok'); b.hidden = false; b.classList.add('show'); }
  function showOkSoon(delay) { if (!delay) { showOk(); return; } const at = S.i, st = S.step; setTimeout(() => { if (S.i === at && S.step === st) showOk(); }, delay); }
  function hideOk() { $('lx-ok').hidden = true; }

  // ---- control bar ----
  function setControls(cfg) {
    cfg = cfg || {};
    const el = $('lx-controls');
    let h = '';
    if (cfg.die) {
      h += `<div class="lx-die-wrap"><button id="lx-die" class="lx-die" title="new draw"><img src="img/dice.png" alt="dice"></button>`;
      if (cfg.auto) h += `<label class="lx-auto"><input type="checkbox" id="lx-auto" ${cfg.autoChecked === false ? '' : 'checked'}> auto</label>`;
      h += `</div>`;
    }
    if (cfg.hold || cfg.aid) {
      h += `<div class="lx-ticks-row">`;
      if (cfg.hold) h += `<label class="lx-tick"><input type="checkbox" id="lx-hold"> hold the true value constant</label>`;
      if (cfg.aid) h += `<label class="lx-tick"><input type="checkbox" id="lx-aid"> visual aid</label>`;
      h += `</div>`;
    }
    if (cfg.guide) h += `<div class="lx-guide">${cfg.guide}</div>`;
    el.innerHTML = h; el.hidden = !h;
    if ($('lx-die')) $('lx-die').addEventListener('click', onDie);
    if ($('lx-auto')) $('lx-auto').addEventListener('change', (e) => { if (active && active.setAuto) active.setAuto(e.target.checked, api); });
    if ($('lx-hold')) $('lx-hold').addEventListener('change', (e) => { S.hold = e.target.checked; if (active && active.onHold) active.onHold(S.hold, api); });
    if ($('lx-aid')) $('lx-aid').addEventListener('change', (e) => { S.aid = e.target.checked; if (e.target.checked) showWarn('these colors are a teaching aid, not shown in the actual game'); if (active && active.onAid) active.onAid(S.aid, api); });
  }
  function onDie() {
    const a = $('lx-auto'); if (a) a.checked = false;   // clicking the die drops out of auto
    stopCarousel(); spinDie();
    if (active && active.step) active.step(api);
  }

  // ---- api for scenes ----
  const api = {
    get stage() { return $('lx-stage'); },
    get S() { return S; },
    get revisit() { return S.done.has(S.i); },   // returning to an already-completed slide → show final state, no animation
    lx: App.lx,
    carousel, stopCarousel, setControls, showOk, hideOk, spinDie, showWarn, setTv,
    openGate: (delay) => unlockNextSoon(delay || 0),   // manual-gate slides call this when their action condition is met
  };

  // ---- nav / chrome ----
  function buildDots() { const w = $('lx-dots'); w.innerHTML = ''; SLIDES.forEach((_, i) => { const d = document.createElement('span'); d.className = 'lx-dot'; d.dataset.i = i; w.appendChild(d); }); }
  function refreshNav() {
    $('lx-back').disabled = S.i <= 0;
    const last = S.i >= SLIDES.length - 1;
    $('lx-next').textContent = last ? 'Done' : 'Next';
    $('lx-next').disabled = !S.gateOpen;
  }
  function unlockNextSoon(delay) { const at = S.i; setTimeout(() => { if (S.i === at) { S.gateOpen = true; S.done.add(at); refreshNav(); showNextHint(at); } }, delay); }
  function showNextHint(i) { const sl = SLIDES[i], h = $('lx-nexthint'); if (!h || !sl || !sl.nextHint) return; h.textContent = sl.nextHint; h.hidden = false; void h.offsetWidth; h.classList.add('show'); }
  function renderChrome() {
    const sl = SLIDES[S.i];
    $('lx-step-label').textContent = `${S.i + 1} / ${SLIDES.length}`;
    $('lx-title').textContent = sl.title || '';
    $('lx-title').classList.toggle('lx-title-ex', sl.scene === 'exBid');   // ultra-thin gray title that breathes to black
    refreshNav();
    document.querySelectorAll('#lx-dots .lx-dot').forEach((d) => { const n = +d.dataset.i; d.classList.toggle('done', n < S.i); d.classList.toggle('current', n === S.i); });
    const info = $('lx-info-btn'); info.hidden = !sl.info; info.onclick = sl.info ? () => showInfo(sl.info) : null;
  }
  let distChart = null;
  function closeInfo() { const wasOpen = !$('lx-info-panel').hidden; $('lx-info-panel').hidden = true; if (distChart) { distChart.destroy(); distChart = null; } document.removeEventListener('click', outsideInfo, true); if (wasOpen && active && active.onInfoClosed) active.onInfoClosed(); }
  function outsideInfo(e) { const p = $('lx-info-panel'); if (p.hidden) return; if (p.contains(e.target) || (e.target.closest && e.target.closest('.lx-inline-info'))) return; closeInfo(); }
  function showInfo(key) {
    const info = App.content.INFO[key]; if (!info) return;
    $('lx-info-title').textContent = info.title;
    let html = info.lines.map((l) => `<p>${l}</p>`).join('');
    if (info.dist) html += `<div class="lx-dist"><canvas id="lx-dist-canvas"></canvas></div>` +
      `<div class="lx-slider-wrap lx-sw-tv"><input type="range" id="lx-dist-slider" class="lx-range black" min="1" max="5" step="0.1" value="3"></div>` +
      `<div class="lx-dist-lab">true value <b id="lx-dist-val">3.0</b></div>`;
    if (info.hint) html += `<p class="lx-info-hint">${info.hint}</p>`;
    $('lx-info-body').innerHTML = html;
    $('lx-info-panel').hidden = false;
    if (info.dist) buildDist();
    setTimeout(() => document.addEventListener('click', outsideInfo, true), 0);
  }
  function buildDist() {
    if (!window.Chart) return;
    const xs = []; for (let x = 0; x <= 6.0001; x += 0.1) xs.push(Math.round(x * 10) / 10);
    const pdf = (mu) => xs.map((x) => Math.exp(-((x - mu) * (x - mu)) / (2 * 0.25)));   // sigma 0.5
    distChart = new Chart($('lx-dist-canvas'), {
      type: 'line',
      data: { labels: xs, datasets: [{ data: pdf(3), borderColor: '#111', borderWidth: 2, pointRadius: 0, tension: 0.35, fill: true, backgroundColor: 'rgba(23,105,192,0.12)' }] },
      options: { animation: { duration: 500 }, responsive: true, maintainAspectRatio: false,
        scales: { x: { ticks: { callback: (v, i) => (xs[i] % 1 === 0 ? xs[i] : '') }, grid: { display: false } }, y: { display: false } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } } },
    });
    const sl = $('lx-dist-slider'), val = $('lx-dist-val');
    sl.addEventListener('input', () => { const mu = +sl.value; val.textContent = mu.toFixed(1); distChart.data.datasets[0].data = pdf(mu); distChart.update(); });
  }

  function killCharts() { $('lx-stage').querySelectorAll('canvas').forEach((c) => { const ch = window.Chart && Chart.getChart(c); if (ch) ch.destroy(); }); }
  function leaveSlide() { stopCarousel(); if (typeHandle) typeHandle.cancel(); if (active && active.leave) active.leave(); killCharts(); }

  function go(i) {
    i = Math.max(0, Math.min(i, SLIDES.length - 1));
    leaveSlide();
    S.i = i; S.step = 0; S.gateOpen = false; S.revealed = false; S.hold = false; S.aid = false;
    $('lx-main').innerHTML = ''; $('lx-below-text').innerHTML = ''; $('lx-stage').innerHTML = '';
    $('lx-controls').innerHTML = ''; $('lx-controls').hidden = true; $('lx-info-panel').hidden = true; hideOk();
    { const h = $('lx-nexthint'); h.hidden = true; h.textContent = ''; h.classList.remove('show'); }
    renderChrome();
    const sl = SLIDES[S.i];
    active = App.scenes[sl.scene] || null;
    $('lx-app').classList.toggle('lx-no-stage', !sl.scene);

    // revisited slide → static text, no typing, gate already open
    if (S.done.has(S.i)) {
      for (let k = 0; k < sl.steps.length; k++) staticStep(k);
      if (active && active.enter) active.enter(api);
      if (active && active.gatedReveal && active.reveal) { S.revealed = true; active.reveal(api); }
      S.gateOpen = true; refreshNav(); hideOk(); showNextHint(S.i);
      return;
    }

    typeStep(0, () => {
      if (active && active.enter) active.enter(api);
      const multi = sl.steps.length > 1;
      if (multi || (active && active.gatedReveal)) showOkSoon(sl.okDelayMs || 0);   // okDelayMs delays only the first OK
      else hideOk();
    });
  }

  function mount() {
    S = { i: -1, step: 0, tv: null, reviews: [], disclosed: new Set(), product: null, bid: 3.0, price: null,
          hold: false, aid: false, gateOpen: false, revealed: false, done: new Set() };
    buildDots();
    $('lx-ok').addEventListener('click', advanceStep);
    $('lx-main').addEventListener('click', (e) => {
      const btn = e.target.closest('.lx-inline-info');
      if (btn) { e.stopPropagation(); btn.classList.add('lx-info-seen'); showInfo(btn.dataset.info); return; }   // stop nagging once opened
      if (typeHandle) typeHandle.skip();
    });
    $('lx-next').addEventListener('click', () => go(S.i + 1));
    $('lx-back').addEventListener('click', () => go(S.i - 1));
    $('lx-info-close').addEventListener('click', closeInfo);
    go(0);
  }

  return { mount };
})();
