// content.js — the new left-column instruction script.
// Treatment-VARYING user-facing strings are pulled from the single text seam via
// App.T('key') (see treatment.js). Strings IDENTICAL across treatments stay as
// literals here. App.content.build() repopulates SLIDES/INFO IN PLACE (same array
// references, so stage.js's captured `const SLIDES = App.content.SLIDES` stays
// valid) — the dev dropdown calls it to re-resolve text when treatment changes.
window.App = window.App || {};

App.content = { SLIDES: [], INFO: {} };

App.content.build = function () {
  var T = App.T;   // the single resolver read; never branch on treatment for TEXT here

  var SLIDES = [
    // 1 — product
    {
      id: 'product', scene: 'product', title: 'context', gateDelayMs: 2000, okDelayMs: 2000, nextHint: 'click next to proceed',
      intro: [
        'Welcome to the main part of the experiment.',
        '<span class="lx-gap-lg"></span>You will now go through instructions on how to play the game, followed by a short quiz, and then the game itself.',
      ],
      steps: [
        { text: [T('product.hook')] },
        { text: [
          'This experiment recreates a similar scenario as a game between a seller and a buyer.',
          // "<span class=\"lx-gap\"></span>Only here, the buyer's aim is to judge the product's true value.",
        ] },
        { text: [T('product.role')] },
      ],
    },
    // 2 — two-panel
    {
      id: 'two-panel', scene: 'twoPanel', title: 'overview', belowFrom: 3,   // segments 1-3 above the example image, rest below it
      steps: [
        { text: [T('twoPanel.0')] },
        { text: [T('twoPanel.1')] },
        { text: [T('twoPanel.2')] },   // the example image appears here (twoPanel onStep)
        { text: [T('twoPanel.4')] },
        { text: [T('twoPanel.5')] },
        { text: [T('twoPanel.6')] },
      ],
    },
    // 3 — reviews (normalized bars)
    {
      id: 'reviews', scene: 'reviews', title: 'reviews', manualGate: true,
      steps: [
        { text: [
          T('reviews.have'),
          "Each review lands around the product's true value, usually within about a point of it, but can sometimes be farther off.",
          '<span class="lx-explore-wrap" id="lx-explore-wrap">Click <button class="lx-explore-btn" data-info="reviewSpread">explore</button> to see how the reviews are spread out.</span><button class="lx-inline-info lx-reopen" id="lx-reopen" data-info="reviewSpread" aria-label="more info" hidden>i</button>',
        ] },
      ],
    },
    // 4 — disclosure
    {
      id: 'disclosure', scene: 'disclosure', title: 'displayed reviews', manualGate: true,
      steps: [
        { text: [T('disclosure.showNoneSomeAll')] },
        { text: [''] },   // OK → graph 2 (what the buyer sees)
        { text: [''] },   // OK → the die / tick controls
      ],
    },
    // 5 — bid
    {
      id: 'bid', scene: 'bid', title: 'bid', manualGate: true,
      steps: [
        { text: [
          T('bid.intro0'),
          T('bid.intro1'),
        ] },
        { text: [''] },   // OK here → the example (lead + reviews) begins (see the bid scene's onStepsDone)
      ],
    },
    // 6 — price & trade (text + interactive price info box; earnings text folded in as part C)
    {
      id: 'price', scene: 'priceInfo', title: 'trade', manualGate: true,
      steps: [
        { text: [
          T('price.afterBid'),
          T('price.bidNoChange'),
          "<span class=\"lx-explore-wrap\" id=\"lx-expwrap-a\">Click <button class=\"lx-explore-btn\" data-info=\"priceDemoA\">explore</button> to see how the price is drawn.</span><button class=\"lx-inline-info lx-reopen\" data-info=\"priceDemoA\" aria-label=\"more info\" hidden>i</button>",
          // stage 2 — hidden until the stage-1 (priceDemoA) box is explored + closed (see priceInfo scene)
          "<span class=\"lx-s6-stage2\" id=\"lx-s6-stage2\" style=\"display:none\">" + T('price.bidMaxHead') +
            "<span class=\"lx-conds\">" +
              "<span class=\"lx-cond yes\"><span class=\"lx-cond-txt\">" + T('price.condYes') + "</span><span class=\"lx-cond-tag\">trade happens</span></span>" +
              "<span class=\"lx-cond no\"><span class=\"lx-cond-txt\">" + T('price.condNo') + "</span><span class=\"lx-cond-tag\">no trade</span></span>" +
            "</span>" +
            "<span class=\"lx-explore-wrap\" id=\"lx-expwrap-b\">Click <button class=\"lx-explore-btn\" data-info=\"priceDemoB\">explore</button> to see when a trade happens.</span><button class=\"lx-inline-info lx-reopen\" data-info=\"priceDemoB\" aria-label=\"more info\" hidden>i</button>" +
          "</span>",
        ] },
      ],
    },
    // 7 — earnings: BENCHED. Its text is now shown as part C of slide 6 (priceInfo scene);
    // the graphical earnings interface returns later as a new, more complex slide.
    // {
    //   id: 'earnings', scene: 'earnings', title: 'payoff', manualGate: true,
    //   steps: [ { text: [
    //     '<span class="lx-mini-title">When a trade takes place</span> <button class="lx-inline-info" data-info="tradeRule" aria-label="more info">i</button>',
    //     'You earn the true value minus the <span class="lx-blue">price</span>.',
    //     'The seller earns your <span class="lx-red">bid</span> minus the production cost.',
    //   ] } ],
    // },
    // 7 — segue into the examples
    // STUB: the over/underbidding examples are a buyer concept. Their seller analogue
    // (a disclosure lesson) is an OPEN design question (SELLER-SWITCH-MAP open #2), so the
    // examples slides below stay buyer-framed for BOTH treatments for now. /* REVIEW: seller examples TBD */
    {
      id: 'examples-intro', title: 'examples',
      steps: [{ text: [
        "Let's consider 2 simple examples to understand:",
        '<span class="lx-gap-lg"></span>1. Overbidding / Overestimation of the true value',
        '<span class="lx-gap-lg"></span>2. Underbidding / Underestimation of the true value',
      ] }],
    },
    // 8–10 — bidding examples (step-by-step; final message revealed last)
    // examples are OK-gated: each step is one click (the exBid scene reveals its matching visual on each). steps 3-5 carry no text; they reveal payoff+calc, recap, advice.
    // NOTE: the payoff cell + calc lines inside the exBid scene are ALREADY TREATMENT-aware
    // (behavior, not text) and auto-show the seller payoff — do not route those through the seam.
    { id: 'ex-bid-1', scene: 'exBid', title: 'overbidding', manualGate: true, stepsInMain: true,
      exCase: { tv: 2, bid: 4, price: 3, gateOnTrueValue: true, gateDoneText: 'Bidding the true value sometimes means no trade, and rightly so, since trading here would have left you worse off.', finalLines: ['You paid 3 for a product worth only 2.', 'Bidding above the true value risks overpaying.'] },
      steps: [
        { text: ["The product's value is 2."] },
        { text: ['Your bid is <span class="lx-red" id="lx-exbidnum">4</span>. <span id="lx-exbidqual">You overbid.</span>'] },
        { text: ['The sales price ends up at <span class="lx-blue">3</span>.'] },
        { text: [''] }, { text: [''] }, { text: [''] }, { text: [''] },
      ] },
    { id: 'ex-bid-2', scene: 'exBid', title: 'underbidding', manualGate: true, stepsInMain: true,
      exCase: { tv: 4, bid: 2, price: 3, gateOnTrueValue: true, gateDoneText: 'Bidding the true value, you never miss a good deal.', finalLines: ['You skipped a product worth 4 that you could have bought for 3.', 'Bidding below the true value risks missing a good deal.'] },
      steps: [
        { text: ["The product's value is 4."] },
        { text: ['Your bid is <span class="lx-red" id="lx-exbidnum">2</span>. <span id="lx-exbidqual">You underbid.</span>'] },
        { text: ['The sales price ends up at <span class="lx-blue">3</span>.'] },
        { text: [''] }, { text: [''] }, { text: [''] }, { text: [''] },
      ] },
    // ex-bid-3 (optimal bid) — PARKED for now (kept, not deleted): after 2 examples we jump to the takeaway.
    // { id: 'ex-bid-3', scene: 'exBid', title: 'optimal bid', manualGate: true,
    //   exCase: { tv: 3, bid: 3, price: 2, finalLines: ['You paid 2 for a product worth 3.', 'Bidding the true value, you never overpay and never miss a deal.'], strategy: 'It is best to bid what you <span class="lx-key">believe</span> the true value is.' },
    //   steps: [{ text: ["The product's value is 3.", 'Your bid is <span class="lx-red" id="lx-exbidnum">3</span>.', 'The sales price ends up at <span class="lx-blue">2</span>.'] }] },
    // moral / lessons from the examples — each statement behind its own OK
    {
      id: 'lessons', title: 'takeaway',
      // Treatment-dependent length: seller takeaway is 5 lines (ends on lessons.4),
      // buyer takeaway is 6 lines. Built from App.config.TREATMENT at build() time.
      steps: ((App.config.TREATMENT === 'SELLER')
        ? ['lessons.0', 'lessons.1', 'lessons.2', 'lessons.3', 'lessons.4']
        : ['lessons.0', 'lessons.1', 'lessons.2', 'lessons.3', 'lessons.4', 'lessons.5']
      ).map(function (k) { return { text: [T(k)] }; }),
    },
    // (disclosure example slides commented out for now — restore when needed)
    // { id: 'ex-disp-1', scene: 'exDisp', title: 'Full disclosure', exDisp: { n: 10 }, steps: [{ text: ['The seller shows all 10 reviews...'] }] },
    // { id: 'ex-disp-2', scene: 'exDisp', title: 'Some disclosure', exDisp: { n: 5 }, steps: [{ text: ['The seller shows only some reviews...'] }] },
    // { id: 'ex-disp-3', scene: 'exDisp', title: 'Minimal disclosure', exDisp: { n: 2 }, steps: [{ text: ['The seller shows just a couple...'] }] },
    // 12 — strategy market (interactive payoff history) — TAKEN OUT OF THE DECK (code kept; the `market` scene in scenes.js is untouched, just unused). Re-enable by uncommenting.
    // {
    //   id: 'strategy-market', title: 'strategy', scene: 'market', manualGate: true, stepsInMain: true,
    //   steps: [
    //     { text: ["<span class=\"lx-mk-lead\">Below, each round's payoff for the buyer and the seller is recorded and shown in the graph, along with the average payoff across rounds and the average rate of trade across rounds. Each round's outcome depends on the true value, the bid, and a price that is randomly drawn.</span>"] },
    //   ],
    // },
    // 13–14 — informative
    {
      id: 'payment-overview', title: 'payment',
      steps: [{ text: [
        T('payment.0'),
        T('payment.1'),
        T('payment.2'),
      ] }],
    },
    {
      id: 'bonus-payment', title: 'bonus', scene: 'finalNote', manualGate: true,
      steps: [{ text: [
        T('bonus.0'),
        T('bonus.1'),
        T('bonus.2'),
      ] }],
    },
    // (practice rounds removed for now)
    // ---- debug-only (never in the normal Back/Next order; reachable via the DEBUG jump menu) ----
    // 6 old — the previous slide-6 phrasing, kept for comparison
    {
      id: 'price-old', scene: 'priceInfo', title: 'trade (6 old)', manualGate: true, debugOnly: true,
      steps: [{ text: [
        T('priceOld.0'),
        T('priceOld.1'),
      ] }],
      partC: {
        header: 'WHEN A TRADE TAKES PLACE',
        earn: [T('priceOld.earn0'), T('price.earn1')],
        noTrade: [T('price.noTrade0')],
      },
    },
  ];

  var INFO = {
    tradeRule: {
      title: 'When does a trade happen?',
      lines: [
        'A trade takes place when <span class="lx-red">bid</span> ≥ <span class="lx-blue">price</span>.',
        T('info.tradeRule.1'),
      ],
    },
    priceDemo: {   // full box — kept for the archived old-6 (debug-only) slide
      title: 'How the price is drawn',
      priceDemo: true,
      lines: [
        'The price is drawn at random within ±1 star of the true value.',
        'That range is the <span class="lx-band-chip"></span> blue dashed area around the black true-value bar in the graph below.',
      ],
      hint: 'Move the slider to change the true value, or press the die to draw a price yourself.',
    },
    // slide 6 stage 1: how the price is drawn around the true value (no bid, no trade)
    priceDemoA: {
      title: 'How the price is drawn',
      priceDemo: true, pdVariant: 'A',
      lines: [
        'The <span class="lx-blue">price</span> is drawn at random within ±1 star of the true value.',
        'That range is the <span class="lx-band-chip"></span> blue dashed area around the black true-value bar below.',
      ],
      hint: 'Move the true value, or press the die to draw a price yourself.',
    },
    // slide 6 stage 2: move the bid and watch the trade flip (true value fixed at 3)
    priceDemoB: {
      title: 'When does a trade happen?',
      priceDemo: true, pdVariant: 'B',
      lines: [
        T('info.priceDemoB.0'),
        T('info.priceDemoB.1'),
      ],
      hint: 'Move the bid, or press the die to draw a new price.',
    },
    reviewSpread: {
      title: 'Reviews in detail',
      dist: true,
      lines: [
        'The curve below shows how likely each review is: the taller it stands, the more reviews land there.',
        'It peaks at the true value, so most reviews sit close to it and fade toward the edges.',
        'The <span class="lx-band-chip"></span> dashed lines mark one point below and above the true value — nearly every review falls between them.',
      ],
      hint: 'Use the slider to move the true value and watch the curve shift with it.',
    },
  };

  // repopulate IN PLACE so captured references (stage.js `const SLIDES`) stay valid
  App.content.SLIDES.length = 0;
  Array.prototype.push.apply(App.content.SLIDES, SLIDES);
  Object.keys(App.content.INFO).forEach(function (k) { delete App.content.INFO[k]; });
  Object.keys(INFO).forEach(function (k) { App.content.INFO[k] = INFO[k]; });
  return App.content;
};

App.content.build();
