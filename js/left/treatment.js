// treatment.js — the SINGLE treatment-resolved TEXT seam + settings block.
// ---------------------------------------------------------------------------
// WHY THIS FILE EXISTS (port contract — see SELLER-SWITCH-DESIGN.md invariants):
//   1. Client stays dumb. Every treatment-VARYING user-facing string lives in
//      ONE data block (App.TEXT_VARIANTS) keyed by treatment. App.resolveText()
//      reads App.config.TREATMENT exactly ONCE and bakes a flat, already-chosen
//      map (App.text) that render/scene code reads by key via App.T('id').
//      Render code NEVER branches on treatment for TEXT.
//   2. At port time Kerem repoints that single read to the server's getTextList
//      and ships ONLY the resolved set across the wire (between-subjects
//      integrity — a participant never sees the other condition's framing).
//   3. Dynamic numbers/currency come from App.settings via ${...} interpolation,
//      never hardcoded in body prose (mirrors nodegame's ${settings.*}).
//
// DATA SHAPE: App.TEXT_VARIANTS = { key: { buyer, seller, kind } }.
//   - buyer / seller : the two variants of one user-facing string (HTML ok).
//   - kind           : a routing tag for the integration owner —
//                      'narrative' | 'directive' | 'info' | 'action-hint'.
//                      (In nodegame, narrative/info fold into a page's `main`;
//                       directive/action-hint are the gate-affordance layer.)
// Strings that are IDENTICAL across treatments are NOT here — they stay as
// single literals at their original site (the map proves which).
// Seller copy that was INVENTED or REIMAGINED (not a mechanical pronoun flip,
// not reused verbatim from nodegame) is marked with a /* REVIEW */ comment.
// ---------------------------------------------------------------------------
window.App = window.App || {};

// ---- settings (mirror nodegame game.settings.js; interpolated, never hardcoded) ----
App.settings = {
  NUM_OF_SELLER_TASKS: 5,
  NUM_OF_BUYER_TASKS: 5,
  NUM_OF_REPRESENTATIVE_TASKS: 2,
  currencySymbol: '£',
  exchangeRate: 5,            // £5 per star
  // Payment caps / per-round swing. These keep whatever the prototype CURRENTLY
  // displays (buyer "£10", seller "£25", "±£10" swing). They are moved here as a
  // single knob so the number is one decision, not scattered prose.
  // TODO(can): caps source-of-truth — settings say 17/32, text literals say 10/25; decide.
  MAX_BONUS_DISPLAY_BUYER: 10,
  MAX_BONUS_DISPLAY_SELLER: 25,
  PER_ROUND_SWING: 10,
};

// ${token} / ${settings.token} interpolation against App.settings (mirrors ${settings.*}).
App.interp = function (str) {
  if (typeof str !== 'string') return str;
  var s = App.settings || {};
  return str.replace(/\$\{\s*([^}]+?)\s*\}/g, function (m, expr) {
    expr = expr.replace(/^settings\./, '');
    return (s[expr] != null) ? String(s[expr]) : m;
  });
};

// ---- initial treatment from ?treatment=seller|buyer (default stays BUYER) ----
// config.js has already set App.config.TREATMENT = 'BUYER'; a URL param overrides it
// so coauthors can deep-link a condition. The dev dropdown overrides it at runtime.
(function () {
  try {
    var m = /[?&]treatment=(seller|buyer)/i.exec(location.search || '');
    if (m && App.config) App.config.TREATMENT = (m[1].toLowerCase() === 'seller') ? 'SELLER' : 'BUYER';
  } catch (e) {}
})();

// ---- the one treatment-keyed TEXT block ----
App.TEXT_VARIANTS = {
  // ===== Slide 1: product =====
  // Same hook for both: in real life people are buyers, not sellers, so the
  // "think of a product you bought" framing holds even in the seller treatment
  // (we already establish "you are the seller" elsewhere).
  'product.hook': { kind: 'narrative',
    buyer: 'Think of a product you bought recently, one where you checked the online reviews first.',
    seller: 'Think of a product you bought recently, one where you checked the online reviews first.' },
  'product.role': { kind: 'narrative',   // <strong> here is pre-existing markup, not new bold-for-salience
    buyer: '<span class="lx-buyer-line">You are the <strong>buyer</strong>.</span>',
    seller: '<span class="lx-buyer-line">You are the <strong>seller</strong>.</span>' },

  // ===== Slide 2: two-panel overview =====
  'twoPanel.0': { kind: 'narrative',
    buyer: 'In this game, the seller is randomly assigned to a product whose true value lies between 1 and 5.',
    seller: 'In this game, you are randomly assigned to a product whose true value lies between 1 and 5.' },
  'twoPanel.1': { kind: 'narrative',
    buyer: "As a buyer, you don't know the product's true value.",
    seller: "As the seller, you know the product's true value and all of its reviews." },
  'twoPanel.2': { kind: 'narrative',
    buyer: 'You only see the reviews the seller chooses to show you.',
    seller: 'You choose which ones to show the buyer.' },
  // twoPanel.3 removed: it was redundant with twoPanel.2 in both treatments.
  // Seller-only line, shown BELOW the graphic; the buyer states this as twoPanel.1.
  'twoPanel.buyerBlind': { kind: 'narrative',
    buyer: 'The buyer does not know the value of the product.',
    seller: 'The buyer does not know the value of the product.' },
  'twoPanel.4': { kind: 'narrative',
    buyer: 'You bid what you believe the product is worth based on the reviews the seller chooses to show you.',
    seller: 'The buyer bids what they believe the product is worth based on the reviews you choose to display.' },
  'twoPanel.5': { kind: 'narrative',
    buyer: 'The seller earns more the <span class="lx-key">higher</span> you bid.',
    seller: 'You earn more the <span class="lx-key">higher</span> the buyer bids.' },
  'twoPanel.6': { kind: 'narrative',
    buyer: '<span class="lx-wideline">You earn more the <span class="lx-key">closer</span> your bid is to the true value.</span>',
    seller: '<span class="lx-wideline">The buyer earns more the <span class="lx-key">closer</span> their bid is to the true value.</span>' },
  'twoPanel.boxTitle': { kind: 'narrative',   // right-panel label built in the twoPanel scene
    buyer: 'Reviews you see',
    seller: 'Reviews the buyer sees' },

  // ===== Slide 3: reviews =====
  'reviews.have': { kind: 'narrative',
    buyer: 'The seller has <span class="lx-key">10 reviews</span> to show.',
    seller: 'You have <span class="lx-key">10 reviews</span> to show.' },

  // ===== Slide 4: disclosure =====
  'disclosure.showNoneSomeAll': { kind: 'narrative',
    buyer: 'The seller can choose to show <span id="lx-w-none">none</span>, <span id="lx-w-some">some</span> or <span id="lx-w-all">all</span> of the 10 product reviews.',
    seller: 'You can choose to show <span id="lx-w-none">none</span>, <span id="lx-w-some">some</span> or <span id="lx-w-all">all</span> of the 10 product reviews.' },
  'disclosure.chooseTitle': { kind: 'narrative',
    buyer: 'Seller chooses from all 10 reviews',
    seller: 'You choose from all 10 reviews' },
  'disclosure.emptyNote': { kind: 'narrative',
    buyer: 'The seller displays no reviews',
    seller: 'You display no reviews' },

  // ===== Slide 5: bid =====
  // Per the design doc this slide is KEPT for sellers but fully REIMAGINED in the
  // seller's voice: the seller steps into the buyer's shoes to see how disclosed
  // reviews move the buyer's guess and bid. It stays the BUYER's decision.
  'bid.intro0': { kind: 'narrative',
    buyer: 'You only see the reviews selected by the seller.',
    seller: 'The buyer only sees the reviews you select.' /* REVIEW */ },
  'bid.intro1': { kind: 'narrative',
    buyer: "Your goal is to bid the product's true value.",
    seller: "Step into the buyer's shoes: their goal is to guess the product's true value from those reviews." /* REVIEW */ },
  'bid.leadText': { kind: 'narrative',
    buyer: 'Below is an example of a seller who displayed all 10 reviews.',
    seller: 'Below is an example where you displayed all 10 reviews.' /* REVIEW */ },
  'bid.leadSub': { kind: 'narrative',
    buyer: 'The seller below is not representative of a real seller. During the game, a seller may show all, some or none of them.',
    seller: 'This is only an example. During the game you may show all, some or none of your reviews.' /* REVIEW */ },
  'bid.prompt': { kind: 'narrative',
    buyer: "Can you guess the product's true value?",
    seller: 'From these reviews, what would the buyer guess?' /* REVIEW */ },
  'bid.button': { kind: 'directive',
    buyer: 'Place your bid',
    seller: "Place the buyer's bid" /* REVIEW */ },
  'bid.yourBidLabel': { kind: 'narrative',
    buyer: 'Your bid',
    seller: "The buyer's bid" /* REVIEW */ },

  // ===== Slide 6: price / trade =====
  'price.afterBid': { kind: 'narrative',
    buyer: "After you <span class=\"lx-red\">bid</span>, a <span class=\"lx-blue\">sales price</span> is picked around the product's true value.",
    seller: "After the buyer <span class=\"lx-red\">bids</span>, a <span class=\"lx-blue\">sales price</span> is picked around the product's true value." },
  // Coauthor edit (Christian, Stefan agreed): state this directly after the
  // true-value sentence; replaces the deleted "Remember..." line (price.noTrade1).
  'price.bidNoChange': { kind: 'narrative',
    buyer: 'Your <span class="lx-red">bid</span> never changes the <span class="lx-blue">price</span>. It only decides whether you buy.',
    seller: "The buyer's <span class=\"lx-red\">bid</span> never changes the <span class=\"lx-blue\">price</span>. It only decides whether they buy." },
  'price.bidMaxHead': { kind: 'narrative',
    buyer: 'Your <span class="lx-red">bid</span> is the maximum <span class="lx-blue">price</span> you are willing to pay:',
    seller: "The buyer's <span class=\"lx-red\">bid</span> is the maximum <span class=\"lx-blue\">price</span> they are willing to pay:" },
  'price.condYes': { kind: 'narrative',
    buyer: 'If the <span class="lx-blue">price</span> is at or below your <span class="lx-red">bid</span>, you buy the product automatically.',
    seller: "If the <span class=\"lx-blue\">price</span> is at or below the buyer's <span class=\"lx-red\">bid</span>, the buyer buys the product automatically." },
  'price.condNo': { kind: 'narrative',
    buyer: "If the <span class=\"lx-blue\">price</span> is above your <span class=\"lx-red\">bid</span>, you don't buy the product.",
    seller: "If the <span class=\"lx-blue\">price</span> is above the buyer's <span class=\"lx-red\">bid</span>, the buyer does not buy the product." },
  // Slide 6 part C (earnings) — flips; wording mirrors the real textList_seller payoff lines.
  'price.earn0': { kind: 'narrative',
    buyer: 'When you buy, you earn the true value minus the <span class="lx-blue">price</span>.',
    seller: 'When the buyer buys, they earn the true value minus the <span class="lx-blue">price</span>.' },
  'price.earn1': { kind: 'narrative',
    buyer: 'The seller earns your <span class="lx-red">bid</span> minus a fixed production cost.',
    seller: "You earn the buyer's <span class=\"lx-red\">bid</span> minus a fixed production cost." },
  'price.noTrade0': { kind: 'narrative',
    buyer: 'If there is no trade, neither you nor the seller earns anything.',
    seller: 'If there is no trade, neither you nor the buyer earns anything.' },
  // price.noTrade1 removed: the "Remember..." restatement was replaced by
  // price.bidNoChange, shown up front after the true-value sentence (coauthor edit).

  // ===== Slide: lessons / takeaway =====
  // Seller arc = Can's 5-line version (2026-10-05). NOTE: it ends on the earning
  // line, NOT Stefan's agreed close; it also re-introduces the steering Stefan had
  // trimmed. Deliberate per Can. The buyer arc keeps its own 6 lines, so the slide
  // is 5 steps for the seller and 6 for the buyer (built in content.js by treatment).
  'lessons.0': { kind: 'narrative',
    buyer: 'The examples show one simple rule: bid what you <span class="lx-key">believe</span> the product is truly worth.',
    seller: 'The examples show one simple rule for buyers: bid what they <span class="lx-key">believe</span> the product is truly worth.' },
  'lessons.1': { kind: 'narrative',
    buyer: 'Bid above it and you risk overpaying; bid below it and you risk missing a good deal.',
    seller: "But buyers don't see the true value. They have to estimate it from the reviews you choose to show them." },
  'lessons.2': { kind: 'narrative',
    buyer: "But there's a catch. You don't see the true value.",
    seller: 'The buyer\'s beliefs determine how much they bid.' },
  'lessons.3': { kind: 'narrative',
    buyer: 'You have to estimate it from the reviews you are shown.',
    seller: 'And the reviews you choose to show affect what the buyer believes.' },
  'lessons.4': { kind: 'narrative',
    buyer: 'And those reviews are chosen by the seller who earns more when you bid higher.',
    seller: 'The higher the buyer bids, the more you earn.' },
  // lessons.5 seller is NOT rendered today (seller arc is 5 lines, ends on lessons.4).
  // Stefan's agreed close is kept here so re-adding it is just appending lessons.5
  // to the seller step list in content.js.
  'lessons.5': { kind: 'narrative',
    buyer: "So the real challenge isn't the bidding rule. It's judging the true value from evidence someone else selected.",
    seller: 'You earn what the buyer bids minus a fixed production cost.' /* parked: Stefan's agreed close, unused in the current 5-line seller arc */ },

  // ===== Slide: payment-overview =====
  // Structurally different per the design doc (NOT a pronoun swap): seller plays
  // NUM_OF_SELLER_TASKS rounds, ONE round picked; buyer plays main+representative,
  // TWO rounds picked.
  'payment.0': { kind: 'narrative',
    buyer: 'You will play <span class="lx-key">${NUM_OF_BUYER_TASKS} main rounds</span> and <span class="lx-key">${NUM_OF_REPRESENTATIVE_TASKS} additional rounds</span> as a buyer.',
    seller: 'You will play <span class="lx-key">${NUM_OF_SELLER_TASKS} rounds</span> as a seller.' /* REVIEW */ },
  'payment.1': { kind: 'narrative',
    buyer: 'In each round you are matched with a different seller and decide how much to bid after seeing the reviews that seller shows you.',
    seller: 'In each round you are matched with a different buyer and decide which of your reviews to show them.' /* REVIEW */ },
  'payment.2': { kind: 'narrative',
    buyer: 'At the end, <span class="lx-key">two</span> rounds are randomly selected for your bonus: one main round and one additional round.',
    seller: 'At the end, <span class="lx-key">one</span> round is randomly selected for your bonus.' /* REVIEW */ },

  // ===== Slide: bonus-payment =====
  // Seller is earn-only with a possible two-week delay (depends on a real buyer in
  // a follow-up study); buyer can earn or lose with losses deducted elsewhere.
  'bonus.0': { kind: 'narrative',
    buyer: 'Your bonus is the <span class="lx-key">sum of your earnings</span> from the two selected rounds.',
    seller: 'Your bonus is <span class="lx-key">your earnings</span> from the selected round.' /* REVIEW */ },
  'bonus.1': { kind: 'narrative',
    buyer: 'You may earn or lose stars in each round. Stars convert to money at <span class="lx-key">${currencySymbol}${exchangeRate} per star</span>, and you can earn up to <span class="lx-key">${currencySymbol}${MAX_BONUS_DISPLAY_BUYER}</span> over the two rounds.',
    seller: 'You earn stars in the selected round. Stars convert to money at <span class="lx-key">${currencySymbol}${exchangeRate} per star</span>, and you can earn up to <span class="lx-key">${currencySymbol}${MAX_BONUS_DISPLAY_SELLER}</span>.' /* REVIEW */ },
  'bonus.2': { kind: 'narrative',
    buyer: 'If your total from this task is negative, the loss is deducted from your other bonus payments.',
    seller: "Your bonus depends on a real buyer's decision in a follow-up study, so it may take up to two weeks to arrive." /* REVIEW */ },

  // ===== Left-panel INFO boxes (treatment-varying only) =====
  'info.priceDemoB.0': { kind: 'info',
    buyer: 'The true value is fixed here. Change your <span class="lx-red">bid</span> and observe when a trade happens.',
    seller: "The true value is fixed here. Change the buyer's <span class=\"lx-red\">bid</span> and observe when a trade happens." },
  'info.priceDemoB.1': { kind: 'info',
    buyer: 'A trade happens only when your <span class="lx-red">bid</span> is at or above the <span class="lx-blue">price</span>.',
    seller: "A trade happens only when the buyer's <span class=\"lx-red\">bid</span> is at or above the <span class=\"lx-blue\">price</span>." },
  'info.tradeRule.1': { kind: 'info',   // debug-only slide's info box, but cheap to flip
    buyer: 'If there is no trade, neither you nor the seller earns anything.',
    seller: 'If there is no trade, neither you nor the buyer earns anything.' },

  // ===== Debug-only "price-old" archive slide (reachable only via DEBUG jump) =====
  'priceOld.0': { kind: 'narrative',
    buyer: "After you make your <span class=\"lx-red\">bid</span>, a <span class=\"lx-blue\">sales price</span> is picked around the product's true value.",
    seller: "After the buyer makes their <span class=\"lx-red\">bid</span>, a <span class=\"lx-blue\">sales price</span> is picked around the product's true value." },
  'priceOld.1': { kind: 'narrative',
    buyer: 'A trade happens only if your <span class="lx-red">bid</span> is bigger than or equal to the <span class="lx-blue">price</span>. <button class="lx-inline-info" data-info="priceDemo" aria-label="more info">i</button> <span class="lx-inline-hint">please click the info button</span>',
    seller: "A trade happens only if the buyer's <span class=\"lx-red\">bid</span> is bigger than or equal to the <span class=\"lx-blue\">price</span>. <button class=\"lx-inline-info\" data-info=\"priceDemo\" aria-label=\"more info\">i</button> <span class=\"lx-inline-hint\">please click the info button</span>" },
  'priceOld.earn0': { kind: 'narrative',
    buyer: 'You earn the true value minus the <span class="lx-blue">price</span>.',
    seller: 'The buyer earns the true value minus the <span class="lx-blue">price</span>.' },

  // ===== Gate-affordance action hints (the Next-button layer in stage.js) =====
  // These are treatment-varying TEXT too; tagged 'action-hint' so the integration
  // owner routes them with the directive layer rather than into page `main`.
  // hint.bid removed: the bid slider and its button are self-explanatory, and the
  // hint was appearing before those controls were revealed on slide 5.
  'hint.exbid': { kind: 'action-hint',
    buyer: 'To continue: set your bid to the true value.',
    seller: 'To continue: set your bid to the true value.' /* REVIEW: seller version TBD — examples are an open design question */ },
};

// ---- THE single resolver: one read of App.config.TREATMENT, bakes the flat set ----
App.resolveText = function () {
  var tr = (App.config && App.config.TREATMENT === 'SELLER') ? 'seller' : 'buyer';   // <-- SINGLE read for TEXT (port seam: repoint to server getTextList)
  var out = {}, V = App.TEXT_VARIANTS, key, variant, raw;
  for (key in V) {
    if (!Object.prototype.hasOwnProperty.call(V, key)) continue;
    variant = V[key];
    raw = (variant[tr] != null) ? variant[tr] : variant.buyer;   // fall back to buyer if a seller variant is missing
    out[key] = App.interp(raw);
  }
  App.text = out;
  return out;
};

// resolve a single already-chosen string by key (render/scene code uses ONLY this)
App.T = function (key) {
  if (!App.text) App.resolveText();
  var v = App.text[key];
  if (v == null) { try { console.warn('[treatment] missing text key:', key); } catch (e) {} return ''; }
  return v;
};

// bake the set now so content.js (built at load) can read App.text immediately
App.resolveText();
