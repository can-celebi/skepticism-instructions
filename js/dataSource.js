// dataSource.js — THE PORT SEAM.
// This is the ONLY module that knows where slide text / scenarios come from and
// where decisions go. Everything else (state/sandbox/slides/charts) is agnostic.
//
// ┌───────────────────────────────────────────────────────────────────────────┐
// │ NODEGAME PORT (later, in nodegame-test-1):                                  │
// │  - getSlides()        -> use the server `textList` delivered to the iframe  │
// │  - newScenario()      -> optionally pull a server-sampled datapoint         │
// │  - computeSalesPrice() -> keep local, or take from server                   │
// │  - persistState()/onDecision() -> parent.node.emit('seller-decision'|       │
// │                                    'buyer-decision', payload)               │
// │  - init()             -> parent.node.on.data('...-CLIENT', cb) instead of   │
// │                          the synchronous mock callbacks below               │
// │  No changes needed in state.js / sandbox.js / slides.js / charts.js.        │
// └───────────────────────────────────────────────────────────────────────────┘
window.App = window.App || {};

App.dataSource = (function () {
  // ---- MOCK slide text (shape identical to the live instructions textList) ----
  // 9 slides. `main` is an ARRAY of statements (each rendered on its own line).
  // `extra` (one line each) is the "more detail" content shown in the right-side
  // overlay. Text is faithful to the live game (instruction2_text.js, BUYER).
  const SLIDES = [
    {
      id: 'roles',
      title: 'Welcome',
      main: [
        'Think of a product you recently bought — one where you looked at its reviews, and those reviews shaped your decision.',
        'This experiment is a game that recreates that kind of situation.',
        'You are a <strong>buyer</strong>.',
      ],
      extra: [],
    },
    {
      id: 'true-value',
      title: 'True value',
      main: [
        'The true value of the product is randomly determined — the seller cannot influence or choose it.',
        'The true value can be any number between 1.0 and 5.0 stars.',
      ],
      extra: [],
    },
    {
      id: 'reviews',
      title: 'Reviews',
      main: [
        'The seller knows the product’s true value but cannot tell it to the buyer directly.',
        'Instead, the seller has 10 product reviews.',
        'Each review is often close to the true value but can sometimes be farther off, either higher or lower.',
      ],
      extra: [],
    },
    {
      id: 'disclosure',
      title: 'Disclosing reviews',
      main: [
        'The seller chooses which of the 10 product reviews to show to the buyer.',
        'The seller can choose to show <strong>none</strong>, <strong>some</strong>, or <strong>all</strong> of the 10 product reviews.',
      ],
      extra: [],
    },
    {
      id: 'buyer-view',
      title: 'The buyer’s view',
      main: [
        'As a buyer, you see only the reviews the seller chose to show — never the true value.',
        '<strong>Goal</strong>',
        'As a buyer, your goal is to correctly predict the true value of the good based on the reviews the seller shows you.',
      ],
      extra: [],
    },
    {
      id: 'price',
      title: 'How the price is determined',
      main: [
        'After you bid, a <strong>sales price</strong> is drawn at random — close to the true value, anywhere within <span class="gray-cue">±1.0 of it</span>.',
        'On the right: the <b style="color:#000">black</b> line is the true value, your <b style="color:#dc3545">bid</b> is red, and the price can land anywhere in the <span class="gray-cue">gray band</span>.',
      ],
      tutorial: 'price',
      extra: [],
    },
    {
      id: 'trade-bid',
      title: 'Trade',
      tutorial: 'trade',
      main: [
        'A <strong>trade happens only if your bid is at least the sales price</strong>&nbsp;&nbsp;(bid ≥ price).',
        '<strong>If a trade takes place:</strong> you (the buyer) earn the true value minus the sales price; the seller earns your bid minus the production cost.',
        '<strong>If there is no trade:</strong> neither of you earns anything.',
      ],
      extra: [
        'The production cost of a product is its true value minus 0.3, so the seller earns bid − (true value − 0.3) when a trade happens.',
        'You (the buyer) earn true value − sales price.',
      ],
    },
    {
      id: 'goals',
      title: 'Best strategy',
      main: [
        '<strong>Buyer:</strong> bid what they think the true value of the product is.',
        '<strong>Seller:</strong> get the buyer to bid as high as possible.',
      ],
      extra: [
        '<b>Why the buyer should bid the true value:</b>',
        'A trade happens only if the bid is at least the sales price, and the buyer pays the sales price (not the bid).',
        'The sales price is randomly drawn within ±1.0 of the true value.',
        'So bidding the true value means the buyer buys whenever the price is below the value (a gain), and skips it whenever the price is above the value (avoiding a loss).',
        '<b>Why the seller wants a high bid:</b>',
        'The seller earns the buyer’s bid minus the production cost.',
        'So the higher the buyer bids, the more the seller earns.',
      ],
    },
    {
      id: 'example-bid',
      title: 'Example — how the bid works',
      main: [
        'Here the true value is shown to make the idea clear. <em>In the real rounds you will not see the true value.</em>',
        'Step through three cases (the true value is fixed at 3.0):',
      ],
      example: 'bid',
      cases: [
        { tv: 3.0, bid: 5.0, price: 4.0, label: 'Bid too high', note: 'Your bid (5.0) is above the price (4.0), so you buy. But the product is worth only 3.0 — you pay more than it is worth.' },
        { tv: 3.0, bid: 1.0, price: 2.0, label: 'Bid too low', note: 'Your bid (1.0) is below the price (2.0), so you do not buy. But the product is worth 3.0 — buying at 2.0 would have been profitable.' },
        { tv: 3.0, bid: 3.0, price: 2.5, label: 'Bid close to the true value', note: 'Bidding the true value (3.0), you buy when the price is below the value and skip it when it is above — never overpaying, never missing a good deal.' },
      ],
      extra: [
        'Takeaway: the bid should reflect what you think the product is truly worth. Too high risks overpaying; too low risks missing profitable purchases.',
      ],
    },
    {
      id: 'example-reviews',
      title: 'Example — forming an estimate',
      main: [
        'In the real rounds you will not see the true value. You see only the reviews the seller chose to show, and use them to estimate the product’s worth.',
        'The seller can disclose more or fewer reviews:',
      ],
      example: 'reviews',
      cases: [
        { kind: 'Full disclosure', n: 10, note: 'The seller shows all 10 reviews — you see the full picture and can estimate well.' },
        { kind: 'Medium disclosure', n: 5, note: 'The seller shows several reviews — you estimate from a partial picture.' },
        { kind: 'Minimal disclosure', n: 2, note: 'The seller shows only a few reviews — you have little to go on.' },
      ],
      extra: [
        'Takeaway: as the buyer, your goal is to estimate the true value as accurately as possible. The seller’s goal is different — the seller benefits from a higher bid.',
      ],
    },
    {
      id: 'payment-overview',
      title: 'Payment overview',
      single: true,
      main: [
        'You will play <strong>5 main rounds</strong> and <strong>2 additional rounds</strong> as a buyer.',
        'In each round:',
        '• You will be randomly matched with a <strong>different seller</strong>.',
        '• You will decide how much to bid for the product after observing the reviews presented by that seller.',
        '• The sellers’ decisions (displayed reviews) were collected in a previous experiment, and those sellers will also be paid a bonus based on your decision.',
        'At the end of the experiment, <strong>two</strong> rounds will be randomly selected for your bonus payment:',
        '• one from the <strong>main</strong> rounds,',
        '• one from the <strong>additional</strong> rounds.',
      ],
      extra: [],
    },
    {
      id: 'bonus-payment',
      title: 'Bonus payment',
      single: true,
      main: [
        'Your bonus payment from this task is the <strong>sum of your earnings</strong> from the two selected rounds.',
        'You may <strong>earn or lose</strong> stars in each round, and your bonus is determined by the total number of stars you earn or lose across the two selected rounds.',
        'There will be other tasks where you can earn more bonus payment.',
        'If your payoff from this task is negative (i.e. in total you lose money), this loss will be deducted from your other bonus payments.',
        'Your payoff in stars is converted to Pounds at a rate of <strong>£5 per star</strong>.',
        'You can earn or lose up to <strong>10 Pounds</strong> in each round.',
      ],
      extra: [],
    },
    {
      id: 'outro',
      title: 'End of instructions',
      single: true,
      main: [
        'You are done with the instructions!',
        'You will now take a short quiz on your understanding of the game, then play <strong>7 rounds</strong> (5 main + 2 additional) of this game as a buyer.',
        'You can use the <strong>Back</strong> button to go back to any section and review the instructions.',
        'When you are ready, press <strong>Done</strong>.',
      ],
      extra: [],
    },
  ];

  // ---- MOCK scenario generation: random value + a shoe matching its range ----
  function newScenario({ lockValue, prevTrueValue, prevProduct } = {}) {
    const trueValue = lockValue && prevTrueValue != null ? prevTrueValue : App.rng.randomTrueValue();
    const product = lockValue && prevProduct != null ? prevProduct : App.pickShoeForValue(trueValue, prevProduct);
    const reviews = App.rng.generateReviews(trueValue);
    const disclosedAuto = App.rng.autoDiscloseIndices(reviews, trueValue);
    return { trueValue, reviews, disclosedAuto, product };
  }

  function computeSalesPrice(trueValue) {
    return App.rng.salesPrice(trueValue);
  }

  // ---- MOCK outbound (nodegame: node.emit) ----
  function persistState(partial) {
    console.log('[dataSource.persistState]', partial);
  }
  function onDecision(payload) {
    console.log('[dataSource.onDecision]', payload);
  }

  // ---- progress persistence (nodegame: lastPageCompleted tracker) ----
  // Records the furthest COMPLETED slide so a reload/reconnect resumes there.
  // Progress is a JSON object (the resume anchor). It is logged on every update
  // and, in nodegame, will be emitted to player.js → logic.js to update the
  // player object so a reconnect can restore from it.
  const PROGRESS_KEY = 'reimg-progress';
  function saveProgress(progress) {
    try { sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch (e) { /* ignore */ }
    console.log('[dataSource.saveProgress] progress =', progress);
    // NODEGAME: parent.node.emit('instruction-progress-PLAYER', progress)
    //           → player.js forwards → logic.js sets player.instructions.progress
  }
  function getProgress() {
    try {
      // ?reset in the URL clears saved progress (handy while iterating)
      if (location.search.indexOf('reset') !== -1) { sessionStorage.removeItem(PROGRESS_KEY); return null; }
      const raw = sessionStorage.getItem(PROGRESS_KEY);
      return raw ? JSON.parse(raw) : null; // null = empty → start from the beginning
    } catch (e) { return null; }
    // NODEGAME: comes back as player.instructions.progress in the setup payload
  }

  // ---- MOCK inbound wiring (nodegame: node.on.data) ----
  function init({ onSlides, onScenario, onResume }) {
    const saved = getProgress(); // capture BEFORE the first render overwrites it
    onSlides(SLIDES.slice());
    onScenario(newScenario({ lockValue: false }));
    onResume(saved); // null = fresh start; object = resume at lastCompletedSlide
  }

  return {
    getSlides: () => SLIDES.slice(),
    newScenario, computeSalesPrice, persistState, onDecision,
    saveProgress, getProgress, init,
  };
})();
