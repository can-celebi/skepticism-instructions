// stars.js — renders a star rating in yellow with continuous (fractional) precision.
// Scale is App.config.STAR_MAX (6 here, so 0–6 maps 1:1 to the game's value range).
window.App = window.App || {};

App.stars = {
  // returns HTML: `max` stars, each filled proportionally to `value`
  html(value, max) {
    const n = max || (App.config && App.config.STAR_MAX) || 6;
    let out = '<span class="stars">';
    for (let i = 0; i < n; i++) {
      const fill = Math.max(0, Math.min(1, value - i)) * 100;
      out += `<span class="star">★<span class="star-fill" style="width:${fill}%">★</span></span>`;
    }
    return out + '</span>';
  },
};
