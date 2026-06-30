// rng.js — pure scenario generation. No DOM. Mirrors the live game's math.
window.App = window.App || {};

App.rng = (function () {
  const { SIGMA, REVIEW_COUNT, BOUNDS, TV_RANGE, PRICE_BAND } = App.config;
  const { round1, clamp, rand } = App.util;

  // Box-Muller standard normal
  function stdNormal() {
    const u1 = Math.random(), u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  function randomTrueValue() {
    return round1(rand(TV_RANGE.min, TV_RANGE.max));
  }

  // 10 reviews ~ Normal(trueValue, SIGMA), clamped, 1dp, sorted ascending
  function generateReviews(trueValue) {
    const out = [];
    for (let i = 0; i < REVIEW_COUNT; i++) {
      const val = trueValue + stdNormal() * SIGMA;
      out.push(round1(clamp(val, BOUNDS.min, BOUNDS.max)));
    }
    return out.sort((a, b) => a - b);
  }

  // Sales price ~ Uniform(tv−1, tv+1), clamped, 1dp
  function salesPrice(trueValue) {
    const raw = trueValue + (2 * Math.random() - 1) * PRICE_BAND;
    return round1(clamp(raw, BOUNDS.min, BOUNDS.max));
  }

  // Cherry-pick default: indices of reviews ≥ trueValue.
  // Fallback: the single highest review (so a buyer auto-view is never empty).
  function autoDiscloseIndices(reviews, trueValue) {
    const idx = reviews.map((r, i) => (r >= trueValue ? i : -1)).filter((i) => i >= 0);
    if (idx.length) return idx;
    let hi = 0;
    reviews.forEach((r, i) => { if (r > reviews[hi]) hi = i; });
    return [hi];
  }

  return { randomTrueValue, generateReviews, salesPrice, autoDiscloseIndices };
})();
