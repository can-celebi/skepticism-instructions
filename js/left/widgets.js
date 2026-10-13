// widgets.js — App.lx : the LEFT-stage renderers. All ids/classes are `lx-*`.
window.App = window.App || {};

App.lx = (function () {
  const { clamp, round1 } = App.util;
  const pct = (v) => (clamp(v, 0, 6) / 6) * 100;   // value → % on the 0–6 axis
  const f1 = (v) => round1(v).toFixed(1);
  if (window.Chart) Chart.defaults.font.family = "'Courier New', Courier, monospace";  // numbers in our font

  // product card: shoe + 5 stars + value, OR a "?" mystery card (single ? above the label)
  function product(value, opts) {
    opts = opts || {};
    const img = opts.product ? `<img class="lx-shoe" src="${opts.product}" alt="product">` : '<div class="lx-shoe lx-shoe-blank"></div>';
    const label = `<div class="lx-val-label">${opts.label || 'True value'}</div>`;
    if (opts.hidden) return `<div class="lx-product">${img}<div class="lx-val lx-q">?</div>${label}</div>`;
    return `<div class="lx-product">${img}<div class="lx-starsrow">${App.stars.html(value)}</div><div class="lx-val">${f1(value)}</div>${label}</div>`;
  }

  // vertical star-list of reviews (slide 2 only). rows: [{v,i}].
  function reviewList(rows, opts) {
    opts = opts || {};
    let body = '';
    rows.forEach((r) => { body += `<div class="lx-rev"><span class="lx-rev-num">${f1(r.v)}</span>${App.stars.html(r.v)}</div>`; });
    return `<div class="lx-revlist">${body}</div>`;
  }
  const rows = (arr) => arr.map((v, i) => ({ v, i }));

  // ---------- Chart.js normalized bar chart (slides 3+) ----------
  const valueLabels = {
    id: 'lxValueLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart, meta = chart.getDatasetMeta(0);
      ctx.save(); ctx.font = '700 12px "Courier New",monospace'; ctx.fillStyle = '#000'; ctx.textAlign = 'center';
      meta.data.forEach((bar, i) => ctx.fillText(f1(chart.data.datasets[0].data[i]), bar.x, bar.y - 6));
      ctx.restore();
    },
  };
  function colorFor(v, i, o) {
    const sel = o.selected ? o.selected.has(i) : true;
    if (o.aid && o.tv != null) {
      const a = sel ? 1 : 0.28, rv = round1(v), rt = round1(o.tv);
      if (rv === rt) return `rgba(153,153,153,${a})`;                     // reads as the true value (to 1 dp) → gray
      return rv > rt ? `rgba(128,0,128,${a})` : `rgba(230,130,0,${a})`;   // above → purple, below → orange
    }
    if (o.dimUnselected) return sel ? '#111' : 'rgba(0,0,0,0.16)';
    return '#111';
  }
  function normBounds(values, o) {
    if (o.normalize === false) return { min: 0, max: 6 };
    let mn = Math.min(...values), mx = Math.max(...values), pad = 0.35;
    let lo = Math.max(0, mn - pad), hi = Math.min(6, mx + pad);
    if (hi - lo < 0.6) { lo = Math.max(0, lo - 0.4); hi = Math.min(6, hi + 0.4); }
    return { min: lo, max: hi };
  }
  // renders/updates a normalized bar chart inside `container`. opts: {selected,dimUnselected,aid,tv,onClick,normalize}
  function bars(container, values, opts) {
    opts = opts || {};
    const b = normBounds(values, opts);
    const colors = values.map((v, i) => colorFor(v, i, opts));
    container._onClick = opts.onClick || null;
    let chart = container._chart;
    if (!chart) {
      container.innerHTML = '<canvas></canvas>';
      chart = new Chart(container.querySelector('canvas'), {
        type: 'bar',
        data: { labels: values.map(() => ''), datasets: [{ data: values.slice(), backgroundColor: colors, categoryPercentage: 0.7, barPercentage: 0.9 }] },
        options: {
          animation: opts.animate ? { duration: 350, easing: 'easeOutQuart' } : false,
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 20 } },
          scales: { y: { min: b.min, max: b.max, display: false }, x: { ticks: { display: false }, grid: { display: false } } },
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          onClick: (e, els) => { if (container._onClick && els.length) container._onClick(els[0].index); },
        },
        plugins: [valueLabels],
      });
      container._chart = chart;
    } else {
      const prev = container._vals;
      const sameData = prev && prev.length === values.length && prev.every((x, i) => x === values[i]);
      const ds = chart.data.datasets[0];
      ds.data = values.slice(); ds.backgroundColor = colors;
      chart.data.labels = values.map(() => '');
      chart.options.scales.y.min = b.min; chart.options.scales.y.max = b.max;
      // selection/colour-only change (same numbers) → snap instantly; new set → animate the heights
      chart.update(opts.animate && !sameData ? undefined : 'none');
    }
    const cv = container.querySelector('canvas'); if (cv) cv.style.cursor = opts.clickable ? 'pointer' : 'default';
    container._vals = values.slice();
    return chart;
  }
  function killChart(container) { if (container && container._chart) { container._chart.destroy(); container._chart = null; } }

  // ---------- 0–6 line with numbers ON the bars ----------
  function line() {
    return `<div class="lx-line" id="lx-line">
      <div class="lx-band" hidden></div>
      <div class="lx-axis"></div>
      <div class="lx-mark lx-tv" hidden><span class="lx-tag below"><b class="lx-tag-num"></b><span class="lx-tag-lab">value</span></span></div>
      <div class="lx-mark lx-bidm" hidden><span class="lx-tag above"><span class="lx-tag-lab">bid</span><b class="lx-tag-num"></b></span></div>
      <div class="lx-mark lx-price" hidden><span class="lx-tag above"><span class="lx-tag-lab">price</span><b class="lx-tag-num"></b></span></div>
      <div class="lx-ends"><span>0</span><span>6</span></div>
    </div>`;
  }
  function setLine(root, o) {
    const q = (c) => root.querySelector(c);
    const band = q('.lx-band');
    if (o.band && o.tv != null) { const lo = clamp(o.tv - 1, 0, 6), hi = clamp(o.tv + 1, 0, 6); band.hidden = false; band.style.left = pct(lo) + '%'; band.style.width = (pct(hi) - pct(lo)) + '%'; }
    else band.hidden = true;
    const mark = (c, v, showTag) => {
      const m = q(c); if (v == null) { m.hidden = true; return; }
      m.hidden = false; m.style.left = pct(v) + '%';
      const tag = m.querySelector('.lx-tag');
      if (tag) { if (showTag === false) tag.style.display = 'none'; else { tag.style.display = ''; tag.querySelector('.lx-tag-num').textContent = f1(v); } }
    };
    mark('.lx-tv', o.tv, o.tvTag); mark('.lx-bidm', o.bid, o.bidTag); mark('.lx-price', o.price, o.priceTag);
  }

  // Neutral slate bracket + tracking caption drawn INSIDE an existing .lx-line
  // (worked-example slider phase). The bracket spans the gap between the bid and the
  // value; the caption (text authored by the caller) rides under the bracket's centre
  // and flips/moves with the bid. No zone fills, no dashed band. When bid == value the
  // bracket is hidden and the caption centres under the value mark. The caption's left is
  // clamped so its (translateX(-50%)) box never spills past the line's edges; a CSS media
  // query (<=430px) overrides left to centre it full-width and let it wrap.
  function setBracket(root, o) {
    let host = root.querySelector(':scope > .lx-brk');
    if (!host) {
      host = document.createElement('div'); host.className = 'lx-brk';
      host.innerHTML = '<div class="lx-zbracket" hidden></div><div class="lx-brk-cap" hidden></div>';
      root.appendChild(host);   // overlay; pointer-events none
    }
    const brk = host.querySelector('.lx-zbracket'), cap = host.querySelector('.lx-brk-cap');
    if (!o || o.tv == null || o.bid == null) { host.hidden = true; brk.hidden = true; cap.hidden = true; return; }
    host.hidden = false;
    const equal = round1(o.bid) === round1(o.tv);
    let center;
    if (equal) { brk.hidden = true; center = clamp(o.tv, 0, 6); }   // no bracket: caption sits under the value
    else {
      const lo = clamp(Math.min(o.bid, o.tv), 0, 6), hi = clamp(Math.max(o.bid, o.tv), 0, 6);
      brk.style.left = pct(lo) + '%'; brk.style.width = Math.max(0, pct(hi) - pct(lo)) + '%';
      brk.hidden = false; center = (lo + hi) / 2;   // bracket midpoint
    }
    if (o.caption == null) { cap.hidden = true; return; }
    cap.hidden = false; cap.textContent = o.caption;
    // track the bracket centre, clamped so the caption box stays inside the line's width
    let leftPct = pct(center);
    const w = host.clientWidth || root.clientWidth;
    if (w && cap.offsetWidth) {
      const halfPct = (cap.offsetWidth / 2 / w) * 100;
      leftPct = halfPct >= 50 ? 50 : Math.min(100 - halfPct, Math.max(halfPct, leftPct));   // too wide to fit → just centre it
    }
    cap.style.left = leftPct + '%';
  }

  return { pct, f1, product, reviewList, rows, bars, killChart, line, setLine, setBracket };
})();
