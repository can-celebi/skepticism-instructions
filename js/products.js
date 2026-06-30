// products.js — 46 shoe images with quality ratings (0–5) from a vision workflow.
// The true value is now random; a shoe whose rating falls in the value's range
// is shown (so we see varied numbers with a matching product).
window.App = window.App || {};

App.PRODUCTS = [
  { file: 'img/products/gem1_r1c1.png', quality: 4.4 },
  { file: 'img/products/gem1_r1c2.png', quality: 4.2 },
  { file: 'img/products/gem1_r1c3.png', quality: 3.8 },
  { file: 'img/products/gem1_r2c1.png', quality: 4.3 },
  { file: 'img/products/gem1_r2c2.png', quality: 2.0 },
  { file: 'img/products/gem1_r2c3.png', quality: 2.8 },
  { file: 'img/products/gem1_r3c1.png', quality: 2.8 },
  { file: 'img/products/gem1_r3c2.png', quality: 4.5 },
  { file: 'img/products/gem1_r3c3.png', quality: 3.1 },
  { file: 'img/products/gem1_r4c1.png', quality: 3.6 },
  { file: 'img/products/gem1_r4c2.png', quality: 3.7 },
  { file: 'img/products/gem1_r4c3.png', quality: 3.5 },
  { file: 'img/products/gem2_r1c1.png', quality: 4.2 },
  { file: 'img/products/gem2_r1c2.png', quality: 2.2 },
  { file: 'img/products/gem2_r1c3.png', quality: 3.8 },
  { file: 'img/products/gem2_r2c1.png', quality: 3.2 },
  { file: 'img/products/gem2_r2c2.png', quality: 4.1 },
  { file: 'img/products/gem2_r2c3.png', quality: 1.8 },
  { file: 'img/products/gem2_r3c1.png', quality: 3.5 },
  { file: 'img/products/gem2_r3c2.png', quality: 4.2 },
  { file: 'img/products/gem2_r3c3.png', quality: 3.9 },
  { file: 'img/products/gem2_r4c1.png', quality: 1.5 },
  { file: 'img/products/gem2_r4c2.png', quality: 3.8 },
  { file: 'img/products/gem3_r1c1.png', quality: 3.8 },
  { file: 'img/products/gem3_r1c2.png', quality: 3.8 },
  { file: 'img/products/gem3_r1c3.png', quality: 2.7 },
  { file: 'img/products/gem3_r2c1.png', quality: 2.7 },
  { file: 'img/products/gem3_r2c2.png', quality: 4.2 },
  { file: 'img/products/gem3_r2c3.png', quality: 3.8 },
  { file: 'img/products/gem3_r3c1.png', quality: 3.8 },
  { file: 'img/products/gem3_r3c2.png', quality: 3.0 },
  { file: 'img/products/gem3_r3c3.png', quality: 4.3 },
  { file: 'img/products/gem3_r4c1.png', quality: 3.2 },
  { file: 'img/products/gem3_r4c2.png', quality: 4.2 },
  { file: 'img/products/gem3_r4c3.png', quality: 3.9 },
  { file: 'img/products/gem4_r1c1.png', quality: 4.1 },
  { file: 'img/products/gem4_r1c2.png', quality: 4.1 },
  { file: 'img/products/gem4_r1c3.png', quality: 3.8 },
  { file: 'img/products/gem4_r2c1.png', quality: 2.8 },
  { file: 'img/products/gem4_r2c2.png', quality: 3.8 },
  { file: 'img/products/gem4_r2c3.png', quality: 3.8 },
  { file: 'img/products/gem4_r3c1.png', quality: 3.6 },
  { file: 'img/products/gem4_r3c2.png', quality: 3.2 },
  { file: 'img/products/gem4_r3c3.png', quality: 3.8 },
  { file: 'img/products/gem4_r4c1.png', quality: 3.7 },
  { file: 'img/products/gem4_r4c2.png', quality: 3.8 },
  { file: 'img/products/gem4_r4c3.png', quality: 3.5 },
  { file: 'img/products2/n1_newshoes1_r1c1.png', quality: 4.2 },
  { file: 'img/products2/n1_newshoes1_r1c2.png', quality: 2.2 },
  { file: 'img/products2/n1_newshoes1_r1c3.png', quality: 3.8 },
  { file: 'img/products2/n1_newshoes1_r2c1.png', quality: 1.8 },
  { file: 'img/products2/n1_newshoes1_r2c2.png', quality: 4.3 },
  { file: 'img/products2/n1_newshoes1_r2c3.png', quality: 2.2 },
  { file: 'img/products2/n1_newshoes1_r3c1.png', quality: 3.8 },
  { file: 'img/products2/n1_newshoes1_r3c2.png', quality: 3.8 },
  { file: 'img/products2/n1_newshoes1_r3c3.png', quality: 4.2 },
  { file: 'img/products2/n1_newshoes1_r4c1.png', quality: 2.6 },
  { file: 'img/products2/n1_newshoes1_r4c2.png', quality: 4 },
  { file: 'img/products2/n1_newshoes1_r4c3.png', quality: 3.8 },
  { file: 'img/products2/n2_newshoes2_r1c1.png', quality: 4.2 },
  { file: 'img/products2/n2_newshoes2_r1c2.png', quality: 4.3 },
  { file: 'img/products2/n2_newshoes2_r1c3.png', quality: 4 },
  { file: 'img/products2/n2_newshoes2_r2c1.png', quality: 1.8 },
  { file: 'img/products2/n2_newshoes2_r2c2.png', quality: 4.3 },
  { file: 'img/products2/n2_newshoes2_r2c3.png', quality: 3.2 },
  { file: 'img/products2/n2_newshoes2_r3c1.png', quality: 1.8 },
  { file: 'img/products2/n2_newshoes2_r3c2.png', quality: 4.2 },
  { file: 'img/products2/n2_newshoes2_r3c3.png', quality: 4.3 },
  { file: 'img/products2/n2_newshoes2_r4c1.png', quality: 3.8 },
  { file: 'img/products2/n2_newshoes2_r4c2.png', quality: 1.8 },
  { file: 'img/products2/n2_newshoes2_r4c3.png', quality: 3.8 },
];

// pick a shoe whose rating is in the value's range (±0.5); else the nearest few
App.pickShoeForValue = function (value, prevFile) {
  const list = App.PRODUCTS.filter((p) => p.file !== prevFile);
  let pool = list.filter((p) => Math.abs(p.quality - value) <= 0.5);
  if (!pool.length) {
    const sorted = list.slice().sort((a, b) => Math.abs(a.quality - value) - Math.abs(b.quality - value));
    pool = sorted.slice(0, 3);
  }
  return pool[Math.floor(Math.random() * pool.length)].file;
};
