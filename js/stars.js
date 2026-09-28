// stars.js — renders a 0–6 star rating in yellow with fractional fill.
window.App = window.App || {};

App.stars = {
  // returns HTML: 6 empty stars, each filled proportionally to `value` (values can run up to 6)
  html(value) {
    let out = '<span class="stars">';
    for (let i = 0; i < 6; i++) {
      const fill = Math.max(0, Math.min(1, value - i)) * 100;
      out += `<span class="star">★<span class="star-fill" style="width:${fill}%">★</span></span>`;
    }
    return out + '</span>';
  },
};
