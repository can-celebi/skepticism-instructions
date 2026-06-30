// slides.js — LEFT panel: slide text OR an info screen; plus the directive band.
window.App = window.App || {};

App.slides = (function () {
  const $ = (id) => document.getElementById(id);
  const N = App.config.N_SLIDES;
  let dotsBuilt = false;
  let pendingSlide = null;

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

    // slide text
    $('slide-step').textContent = `${s.slide} / ${N}`;
    $('slide-title').textContent = slide.title || '';
    const main = Array.isArray(slide.main) ? slide.main : [slide.main];
    $('slide-main').innerHTML = main.map((p) => `<p class="stmt">${p}</p>`).join('');
    const extra = Array.isArray(slide.extra) ? slide.extra : [];
    $('more-detail').hidden = extra.length === 0 || !!slide.example; // examples show takeaway on the right

    // single-column slides (end pages) hide the right panel and go full width
    const single = !!slide.single;
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

  return { render };
})();
