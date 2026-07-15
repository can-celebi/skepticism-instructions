// content.js — the new left-column instruction script.
window.App = window.App || {};

App.content = {
  SLIDES: [
    // 1 — product
    {
      id: 'product', scene: 'product', title: 'context', gateDelayMs: 2000, okDelayMs: 2000, nextHint: 'click next to proceed',
      intro: [
        'Welcome to the main part of the experiment.',
        '<span class="lx-gap-lg"></span>You will now go through instructions on how to play the game, followed by a short quiz, and then the game itself.',
      ],
      steps: [
        { text: ['Think of a product you bought recently, where the reviews you saw decided how much you paid.'] },
        { text: ['This experiment recreates that as a game between a seller and a buyer.'] },
        { text: ['<span class="lx-buyer-line">You are the <strong>buyer</strong>.</span>'] },
      ],
    },
    // 2 — two-panel
    {
      id: 'two-panel', scene: 'twoPanel', title: 'overview', okDelayMs: 4000,
      steps: [
        { text: [
          "In this game, as a buyer, you don't know the product's true value.",
          '<span class="lx-gap"></span>All you can see are the reviews the seller chooses to show you.',
        ] },
        // archived: "Seller's task: …" / "Your task: …" (bold labels) — replaced with two plain sentences
        { text: [
          'The seller chooses which reviews to display to you.',
          'You, as the buyer, bid what you believe the product is worth based on the displayed reviews.',
        ] },
        { text: [
          '<span class="lx-hr"></span>',
          'The seller earns more the <span class="lx-key">higher</span> you bid.',
          '<span class="lx-wideline">You, as the buyer, earn more the <span class="lx-key">closer</span> your bid is to the true value.</span>',
        ] },
      ],
    },
    // 3 — reviews (normalized bars)
    {
      id: 'reviews', scene: 'reviews', title: 'reviews', manualGate: true,
      steps: [
        { text: [
          'The seller has <span class="lx-key">10 reviews</span> to show.',
          'Each review is close to the true value but can sometimes be farther off. <button class="lx-inline-info" data-info="reviewSpread" aria-label="more info">i</button> <span class="lx-inline-hint">please click the info button</span>',
        ] },
      ],
    },
    // 4 — disclosure
    {
      id: 'disclosure', scene: 'disclosure', title: 'displayed reviews', manualGate: true,
      steps: [
        { text: ['The seller can choose to show <span id="lx-w-none">none</span>, <span id="lx-w-some">some</span> or <span id="lx-w-all">all</span> of the 10 product reviews.'] },
      ],
    },
    // 5 — bid
    {
      id: 'bid', scene: 'bid', title: 'bid', manualGate: true,
      steps: [
        { text: [
          'You only see the reviews selected by the seller.',
          "Your goal is to bid the product's true value.",
        ] },
      ],
    },
    // 6 — price & trade (text + interactive price info box; earnings text folded in as part C)
    {
      id: 'price', scene: 'priceInfo', title: 'trade', manualGate: true,
      steps: [
        { text: [
          'After you make your <span class="lx-red">bid</span>, a <span class="lx-blue">sales price</span> is picked around the product\'s true value.',
          'A trade happens only if your <span class="lx-red">bid</span> is bigger than or equal to the <span class="lx-blue">price</span>. <button class="lx-inline-info" data-info="priceDemo" aria-label="more info">i</button> <span class="lx-inline-hint">please click the info button</span>',
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
    {
      id: 'examples-intro', title: 'examples',
      steps: [{ text: [
        "Let's consider 3 simple examples to understand:",
        '<span class="lx-gap-lg"></span>1. Overbidding / Overestimation of the true value',
        '<span class="lx-gap-lg"></span>2. Underbidding / Underestimation of the true value',
        '<span class="lx-gap-lg"></span>3. Optimal bid',
      ] }],
    },
    // 8–10 — bidding examples (step-by-step; final message revealed last)
    { id: 'ex-bid-1', scene: 'exBid', title: 'overbidding', manualGate: true,
      exCase: { tv: 2, bid: 4, price: 3, finalLines: ['You paid 3 for a product worth only 2.', 'Bidding above the true value risks overpaying.'] },
      steps: [{ text: ["The product's value is 2.", 'Your bid is <span class="lx-red" id="lx-exbidnum">4</span>.', 'The sales price ends up at <span class="lx-blue">3</span>.'] }] },
    { id: 'ex-bid-2', scene: 'exBid', title: 'underbidding', manualGate: true,
      exCase: { tv: 4, bid: 2, price: 3, finalLines: ['You skipped a product worth 4 that you could have bought for 3.', 'Bidding below the true value risks missing a good deal.'] },
      steps: [{ text: ["The product's value is 4.", 'Your bid is <span class="lx-red" id="lx-exbidnum">2</span>.', 'The sales price ends up at <span class="lx-blue">3</span>.'] }] },
    { id: 'ex-bid-3', scene: 'exBid', title: 'optimal bid', manualGate: true,
      exCase: { tv: 3, bid: 3, price: 2, finalLines: ['You paid 2 for a product worth 3.', 'Bidding the true value, you never overpay and never miss a deal.'], strategy: 'It is best to bid what you <span class="lx-key">believe</span> the true value is.' },
      steps: [{ text: ["The product's value is 3.", 'Your bid is <span class="lx-red" id="lx-exbidnum">3</span>.', 'The sales price ends up at <span class="lx-blue">2</span>.'] }] },
    // moral / lessons from the three examples — intro first, then each lesson behind its own OK
    {
      id: 'lessons', title: 'takeaway', okLabel: 'TELL ME',
      steps: [
        { text: ['What these three examples teach us:'] },
        { text: ['Bidding above the true value risks overpaying.'] },
        { text: ['Bidding below the true value risks missing a good deal.'] },
        { text: ['You never overpay and never miss a deal when you bid the true value.'] },
        { text: ['It is best to bid what you, as the buyer, <span class="lx-key">believe</span> the true value is.'] },
      ],
    },
    // (disclosure example slides commented out for now — restore when needed)
    // { id: 'ex-disp-1', scene: 'exDisp', title: 'Full disclosure', exDisp: { n: 10 }, steps: [{ text: ['The seller shows all 10 reviews...'] }] },
    // { id: 'ex-disp-2', scene: 'exDisp', title: 'Some disclosure', exDisp: { n: 5 }, steps: [{ text: ['The seller shows only some reviews...'] }] },
    // { id: 'ex-disp-3', scene: 'exDisp', title: 'Minimal disclosure', exDisp: { n: 2 }, steps: [{ text: ['The seller shows just a couple...'] }] },
    // 11–12 — informative
    {
      id: 'payment-overview', title: 'payment',
      steps: [{ text: [
        'You will play <span class="lx-key">5 main rounds</span> and <span class="lx-key">2 additional rounds</span> as a buyer.',
        'In each round you are matched with a different seller and decide how much to bid after seeing the reviews that seller shows you.',
        'At the end, <span class="lx-key">two</span> rounds are randomly selected for your bonus: one main round and one additional round.',
      ] }],
    },
    {
      id: 'bonus-payment', title: 'bonus', scene: 'finalNote', manualGate: true,
      steps: [{ text: [
        'Your bonus is the <span class="lx-key">sum of your earnings</span> from the two selected rounds.',
        'You may earn or lose stars in each round. Stars convert to money at <span class="lx-key">£5 per star</span>, and you can earn up to <span class="lx-key">£10</span> over the two rounds.',
        'If your total from this task is negative, the loss is deducted from your other bonus payments.',
      ] }],
    },
    // (practice rounds removed for now)
  ],

  INFO: {
    tradeRule: {
      title: 'When does a trade happen?',
      lines: [
        'A trade takes place when <span class="lx-red">bid</span> ≥ <span class="lx-blue">price</span>.',
        'If there is no trade, neither you nor the seller earns anything.',
      ],
    },
    priceDemo: {
      title: 'How the price is drawn',
      priceDemo: true,
      lines: [
        'The price is drawn at random within ±1 star of the true value: as low as 1 star below it, and as high as 1 star above it.',
        'That range is the <span class="lx-band-chip"></span> blue dashed area around the black true-value bar in the graph above.',
      ],
      hint: 'Move the slider to change the true value, or press the die to draw a price yourself.',
    },
    reviewSpread: {
      title: 'Reviews in detail',
      dist: true,
      lines: [
        'Each review is a noisy signal of the true value.',
        'Most reviews land close to it.',
        'Reviews far from the true value are rare.',
        'Formally, each review is drawn from a bell-shaped <b>normal distribution</b> centred on the true value (standard deviation 0.5).',
      ],
      hint: 'Use the slider to change the true value and watch the distribution shift.',
    },
  },
};
