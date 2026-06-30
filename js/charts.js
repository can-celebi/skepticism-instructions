// charts.js — Chart.js wrappers (buyer-screen styling: black bars, value labels).
// No app state here; callers pass values + colors.
window.App = window.App || {};

App.charts = (function () {
  const { COLOR } = App.config;

  // draws the numeric value above each bar (mirrors the seller screen plugin)
  const valueLabelPlugin = {
    id: 'valueLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      ctx.save();
      ctx.font = '700 14px "Courier New", monospace';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      meta.data.forEach((bar, i) => {
        const v = chart.data.datasets[0].data[i];
        ctx.fillText(Number(v).toFixed(1), bar.x, bar.y - 6);
      });
      ctx.restore();
    },
  };

  function barColor(value, trueValue, selected, reveal) {
    if (reveal) {
      const rv = App.util.round1(value), rtv = App.util.round1(trueValue);
      const a = selected ? 1 : 0.25;
      if (rv > rtv) return `rgba(${COLOR.above[0]},${COLOR.above[1]},${COLOR.above[2]},${a})`;  // above → purple
      if (rv < rtv) return `rgba(${COLOR.below[0]},${COLOR.below[1]},${COLOR.below[2]},${a})`;  // below → orange
      // equal to the true value → neutral (no special colour)
    }
    return selected ? COLOR.selected : COLOR.faded;
  }

  // colors for the seller's all-reviews chart, by current selection
  function allReviewColors(state) {
    const selectedSet = new Set(state.disclosed);
    return state.reviews.map((v, i) =>
      barColor(v, state.trueValue, selectedSet.has(i), state.revealColors));
  }

  function baseOptions() {
    return {
      animation: false,
      responsive: false,
      maintainAspectRatio: false,
      layout: { padding: { top: 22 } }, // room for value labels
      scales: {
        // no fixed min/max → Chart auto-scales to the data, so bar heights are
        // NORMALIZED to the sample (tallest bar always fills) regardless of the
        // absolute true value. Matches the original buyer/seller charts.
        y: { display: false },
        x: { ticks: { display: false }, grid: { display: false } },
      },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    };
  }

  // onIndexClick(index) fires for the nearest bar by x (forgiving — no exact-hit needed)
  function make(canvas, values, colors, onIndexClick) {
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: values.map(() => ''),
        datasets: [{ data: values, backgroundColor: colors, categoryPercentage: 0.8, barPercentage: 0.9 }],
      },
      options: baseOptions(),
      plugins: [valueLabelPlugin],
    });
    canvas.onclick = onIndexClick
      ? (e) => {
          const pts = chart.getElementsAtEventForMode(e, 'index', { intersect: false }, true);
          if (pts.length) onIndexClick(pts[0].index);
        }
      : null;
    return chart;
  }

  return { make, allReviewColors, barColor };
})();
