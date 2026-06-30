// stars.js — renders a 1–5 star rating in yellow with half-star precision.
window.App = window.App || {};

App.stars = {
  // returns HTML: 5 stars, each filled proportionally to `value`
  html(value) {
    let out = '<span class="stars">';
    for (let i = 0; i < 5; i++) {
      const fill = Math.max(0, Math.min(1, value - i)) * 100;
      out += `<span class="star">★<span class="star-fill" style="width:${fill}%">★</span></span>`;
    }
    return out + '</span>';
  },
};
