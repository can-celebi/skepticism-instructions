// config.js — constants, 9-slide model, per-slide conditions + directives, utils.
window.App = window.App || {};

App.config = {
  SIGMA: 0.5,
  REVIEW_COUNT: 10,
  BOUNDS: { min: 0, max: 6 },
  TV_RANGE: { min: 1, max: 5 },
  PRICE_BAND: 1.0,
  PROD_COST_OFFSET: 0.3,

  N_SLIDES: 13,

  // small inline dice icons used inside directive text (match the controls)
  DICE_IMG: "<img src='./img/dice.png' alt='dice' class='dice-inline'>",
  BLUE_DICE_IMG: "<span class='dice-blue-inline' aria-label='blue dice'></span>",

  // bar colors: solid black by default; color-helper tints above/below the value
  COLOR: {
    selected: 'black',
    faded: 'rgba(0,0,0,0.15)',
    above: [128, 0, 128],   // purple — review ≥ true value
    below: [255, 165, 0],   // orange — review < true value
  },

  // Per-slide required action. 'visited' = completes on arrival; otherwise the
  // user must perform the action ON that slide before Next unlocks.
  //   roll = click the dice · disclose = select ≥1 review · buyer = switch to Buyer · submit = submit a bid
  CONDITION: {
    1: 'visited',   // Roles
    2: 'roll',      // True value
    3: 'roll',      // Reviews
    4: 'disclose',  // Disclosure
    5: 'predict',   // Buyer's view — two-round predict-the-value (completed in submitBid)
    6: 'price',     // Price tutorial — draw the price once
    7: 'price',     // Trade tutorial — draw the price once (extension of slide 6)
    8: 'submit',    // Best strategy / free play — make one bid
    9: 'example',   // Example — bid (step through all)
    10: 'example',  // Example — reviews (step through all)
    11: 'visited',  // Payment overview (single column)
    12: 'visited',  // Bonus payment (single column)
    13: 'visited',  // End of instructions (single column)
  },

  // The purple "what to do" directive shown above the nav while pending.
  // (filled in after DICE_IMG is defined, below)
  DIRECTIVE: null,

  // Right-panel features appear once the CURRENT slide reaches these numbers.
  MIN_SLIDE: {
    value: 2,       // true-value display + dice
    reviews: 3,     // the 10-review chart + lock/color
    disclose: 4,    // disclosed chart + click-to-select
    toggle: 5,      // Seller / Buyer toggle
    bid: 5,         // bid slider + Submit (buyer)
    priceGraph: 7,  // the price number-line appears in the payoff
  },

  // info text shown on the LEFT panel when an ⓘ is clicked
  INFO: {
    graph: {
      title: 'How to read this graph',
      lines: [
        '<b>Black line</b> — the product’s true value.',
        '<b>Gray area</b> — where the sales price can land: anywhere within ±1.0 of the true value, all equally likely.',
        '<b>Red line</b> — the buyer’s bid.',
        '<b>Blue line</b> — the sales price drawn this time. Use the blue dice to draw a new one.',
        'A trade happens only when the blue price is at or below the red bid.',
      ],
    },
    payoff: {
      title: 'How payoffs are calculated',
      lines: [
        'The sales price is randomly determined within ±1.0 of the true value.',
        'A trade happens only if the buyer’s bid is at least the sales price.',
        '<b>Buyer</b> earns: true value − sales price.',
        '<b>Seller</b> earns: bid − (true value − 0.3).',
        'If there is no trade, neither the buyer nor the seller earns anything.',
      ],
    },
    lock: {
      title: 'Lock value',
      lines: ['Keeps the true value fixed and re-rolls only the reviews, so you can compare different review samples for the same product.'],
    },
    color: {
      title: 'Color helper',
      lines: ['Tints reviews above the value purple and below the value orange — a teaching aid only, not shown in the actual game.'],
    },
  },
};

App.config.DIRECTIVE = {
  2: `Use ${App.config.DICE_IMG} to draw the product's value.`,
  3: `Use ${App.config.DICE_IMG} to generate a sample of reviews.`,
  4: 'Click a review bar to disclose it to the buyer.',
  // slide 5 directive depends on the two-round step
  5: (s) => (
    s.s5 === 'rerandom' ? `Click the ${App.config.DICE_IMG} for a new seller disclosure, then bid again.`
    : s.s5 === 'bid2' ? 'Now set your bid and press Submit again.'
    : 'Set your bid, then press Submit.'
  ),
  6: `Move your bid, then press the ${App.config.BLUE_DICE_IMG} to draw the price.`,
  7: `Set your bid, then press the ${App.config.BLUE_DICE_IMG} to draw the price and see the payoffs.`,
  8: 'Place a bid and press Submit to see the outcome.',
  9: 'Step through all the examples to continue.',
  10: 'Step through all the examples to continue.',
};

App.util = {
  round1: (x) => Math.round(x * 10) / 10,
  clamp: (x, lo, hi) => Math.max(lo, Math.min(hi, x)),
  rand: (lo, hi) => lo + Math.random() * (hi - lo),
  mean: (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null),
};

// ---- typing-animation toggle ----
// When OFF, both typewriters reveal all text at once and still fire their onDone,
// so every gate / reveal / flow step is preserved (only the char-by-char delay is
// skipped; the staged setTimeout reveals are unaffected). Turn OFF via any of:
//   - set App.config.typeAnimation = false below (ships the deck with typing off)
//   - add ?notype (or ?instant) to the URL   e.g. .../skepticism-instructions/?notype
//   - the OS "reduce motion" accessibility setting
App.config.TREATMENT = 'BUYER';    // 'BUYER' or 'SELLER' — drives which single payoff ("Your payoff") is shown in the examples
App.config.typeAnimation = false;  // DEFAULT: main instructional text is not typed (fades in); accent lines still type. Set true to type the main text again.
App.config.instantRevealMs = 600;  // with typing OFF, wait this long before firing onDone (keeps the OK/gate reveal smooth instead of instant)
App.reduceMotion = function () {
  try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
};
// scope: 'main' = the big slide-body instructional text; 'accent' = the small contextual lines
// (lead, guess prompt, recap, market note...). The ?notype/flag toggle skips ONLY the main text;
// accent lines keep typing. OS reduce-motion makes everything instant (accessibility).
App.noType = function (scope) {
  if (App.reduceMotion()) return true;
  var off = false;
  try { off = /\b(notype|instant)\b/.test(location.search); } catch (e) {}
  off = off || App.config.typeAnimation === false;
  return off && scope !== 'accent';
};
// delay before onDone when text is shown instantly. 0 under OS reduce-motion (accessibility wants
// no motion/waiting); otherwise a short settle beat so buttons/gates don't pop in abruptly.
App.revealDelay = function () { return App.reduceMotion() ? 0 : (App.config.instantRevealMs || 0); };
