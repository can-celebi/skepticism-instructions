// slides.js — LEFT panel: slide text OR an info screen; plus the directive band.
window.App = window.App || {};

App.slides = (function () {
  const $ = (id) => document.getElementById(id);
  const N = App.config.N_SLIDES;
  let dotsBuilt = false;
  let pendingSlide = null;
  let lastSlide = null;   // detect slide changes → (re)start the typewriter once per entry
  let typeHandle = null;  // handle to the running typewriter (skip/cancel)

  // click the text to skip the typewriter to the end
  function skipTyping() { if (typeHandle) typeHandle.skip(); }

  function buildDots() {
    const wrap = $('progress-dots');
    wrap.innerHTML = '';
    for (let i = 1; i <= N; i++) {
      const d = document.createElement('span');
      d.className = 'dot';
      d.dataset.slide = i;
      wrap.appendChild(d);
    }
    dotsBuilt = true;
  }

  function renderDirective(s, gated, last) {
    let dir = App.config.DIRECTIVE[s.slide];
    if (typeof dir === 'function') dir = dir(s);
    const el = $('directive');
    // extra attention on the slide-5 "click the black die" step
    el.classList.toggle('attract', !!(gated && s.slide === 5 && s.s5 === 'rerandom'));
    const hide = () => { el.classList.add('hide'); el.classList.remove('done'); $('dir-text').textContent = ''; };
    if (!dir || last) { hide(); if (pendingSlide === s.slide) pendingSlide = null; return; }
    if (gated) {
      $('dir-text').innerHTML = dir;
      el.classList.remove('hide', 'done');
      $('dir-check').textContent = '';
      pendingSlide = s.slide;
    } else if (pendingSlide === s.slide) {
      pendingSlide = null;
      $('dir-text').innerHTML = dir;
      el.classList.remove('hide');
      el.classList.add('done');
      $('dir-check').textContent = '✓';
      const sl = s.slide;
      setTimeout(() => {
        if (App.state.get().slide === sl) { el.classList.add('hide'); el.classList.remove('done'); $('dir-text').textContent = ''; }
      }, 3300); // green tick lingers ~3x longer before it fades
    } else { hide(); }
  }

  function render(s) {
    if (!dotsBuilt) buildDots();
    const slide = s.slides[s.slide - 1];
    if (!slide) return;

    const slideChanged = lastSlide !== s.slide;
    lastSlide = s.slide;
    const acked = !!s.acknowledged[s.slide];
    const single = !!slide.single;

    // slide meta
    $('slide-step').textContent = `${s.slide} / ${N}`;
    $('slide-title').textContent = slide.title || '';
    const main = Array.isArray(slide.main) ? slide.main : [slide.main];
    const mainHtml = () => main.map((p) => `<p class="stmt">${p}</p>`).join('');
    const extra = Array.isArray(slide.extra) ? slide.extra : [];
    $('more-detail').hidden = extra.length === 0 || !!slide.example; // examples show takeaway on the right

    // ---- acknowledge / typing gate ----
    // Each slide opens as text only; a typewriter reveals it (first visit) and then
    // the OK button appears. Clicking OK reveals the right panel. Already-acknowledged
    // slides (Back-nav / resume) render instantly, no OK, panel already shown.
    if (acked) {
      if (typeHandle) { typeHandle.cancel(); typeHandle = null; }
      $('slide-main').innerHTML = mainHtml();
      $('ok-ack').hidden = true;
    } else if (slideChanged) {
      $('ok-ack').hidden = true;
      typeHandle = App.typewriter.run($('slide-main'), main, () => { $('ok-ack').hidden = false; });
    } // else: unacked & mid-typing / awaiting OK — leave the text + OK button as-is

    // reveal-state classes on #app (single source of truth for the layout)
    const app = document.getElementById('app');
    app.classList.toggle('pre-ack', !acked && !single);
    app.classList.toggle('revealed', acked || single);
    app.classList.toggle('has-right', !single);
    app.classList.toggle('view-left', s.mobileView !== 'right');
    app.classList.toggle('view-right', s.mobileView === 'right');
    $('panel-switch').textContent = s.mobileView === 'right' ? '‹' : '›';

    // single-column slides (end pages) hide the right panel and go full width
    document.querySelector('.content').classList.toggle('single', single);
    document.getElementById('right').classList.toggle('u-hide', single);

    // left-side info screen (triggered by RIGHT-panel info buttons)
    const leftInfo = s.info && s.info.side === 'left' ? s.info : null;
    $('slide-card').classList.toggle('u-hide', !!leftInfo);
    const infoEl = $('left-info');
    infoEl.classList.toggle('hide', !leftInfo);
    if (leftInfo) {
      // box 2 (this round) refreshes live as the bid/price change
      if (leftInfo.key === 'payoff' && App.payoffRoundLines) leftInfo.round = App.payoffRoundLines();
      $('left-info-title').textContent = leftInfo.title;
      let html = leftInfo.lines.map((l) => `<p class="stmt">${l}</p>`).join('');
      if (leftInfo.round && leftInfo.round.length) {
        html += '<div class="info-round">' + leftInfo.round.map((l) => `<p class="stmt">${l}</p>`).join('') + '</div>';
      }
      $('left-info-body').innerHTML = html;
    }

    // nav
    $('back-btn').disabled = s.slide <= 1;
    const last = s.slide >= N;
    const gated = !App.state.gateOk(s.slide);
    $('next-btn').disabled = last || gated;
    $('next-btn').textContent = last ? 'Done' : 'Next';

    renderDirective(s, gated, last);

    document.querySelectorAll('#progress-dots .dot').forEach((d) => {
      const n = Number(d.dataset.slide);
      d.classList.toggle('done', n < s.slide);
      d.classList.toggle('current', n === s.slide);
    });
  }

  return { render, skipTyping };
})();
