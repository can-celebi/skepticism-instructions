# SELLER-SWITCH-MAP

Catalogue of every role-specific user-facing string in the BUYER instructions
prototype (`LIVE-left-proto`), with the change needed for a SELLER version.

Scope: `js/left/content.js` (SLIDES + INFO), `js/config.js` (DIRECTIVE, INFO),
`js/left/scenes.js` (inline leads/prompts/recaps/payoff/button labels). Ordered
by the `App.content.SLIDES` array.

Wording charter applied to every PROPOSED line: no em dashes, no bold-for-salience,
no emojis, short calm sentences. Agreed fixed close for the SELLER takeaway:
"You earn what the buyer bids minus your production cost."

Change-type key: IDENTICAL / REWORD / PERSPECTIVE FLIP / STRUCTURAL.

---

## Slide 1 — `product` (title: context)

| LOCATION | CURRENT (buyer) | TYPE | PROPOSED SELLER | NOTE |
|---|---|---|---|---|
| content.js `product` intro[0] | "Welcome to the main part of the experiment." | IDENTICAL | (unchanged) | |
| content.js `product` intro[1] | "You will now go through instructions on how to play the game, followed by a short quiz, and then the game itself." | IDENTICAL | (unchanged) | |
| content.js `product` steps[0] | "Think of a product you bought recently, one where you checked the online reviews first." | REWORD | "Think of a product you bought recently, one where the online reviews shaped what you were willing to pay." (REVIEW) | Buyer-relatable hook; could stay IDENTICAL since both roles buy things. Seller angle is weak. Flag. |
| content.js `product` steps[1] | "This experiment recreates a similar scenario as a game between a seller and a buyer." | IDENTICAL | (unchanged) | Names both roles neutrally. |
| content.js `product` steps[1] (commented) | `// "...the buyer's aim is to judge the product's true value."` | — | seller counterpart would be "the seller's aim is to choose which reviews to show" | Commented out; noted as relevant role material if restored. |
| content.js `product` steps[2] | `<span class="lx-buyer-line">You are the <strong>buyer</strong>.</span>` | PERSPECTIVE FLIP | `<span class="lx-buyer-line">You are the <strong>seller</strong>.</span>` | `<strong>` is pre-existing markup (not new bold-for-salience). Class name `lx-buyer-line` is CSS only. |

## Slide 2 — `two-panel` (title: overview)

| LOCATION | CURRENT | TYPE | PROPOSED SELLER | NOTE |
|---|---|---|---|---|
| content.js `two-panel` steps[0] | "In this game, the seller is randomly assigned a product whose true value lies between 1 and 5." | PERSPECTIVE FLIP | "In this game, you are randomly assigned a product whose true value lies between 1 and 5." | |
| content.js `two-panel` steps[1] | "As a buyer, you don't know the product's true value." | PERSPECTIVE FLIP | "As the seller, you can see the product's true value and all of its reviews." | Factual flip: the seller knows the value and sees every review. |
| content.js `two-panel` steps[2] | "All you can see are the reviews the seller chooses to show you." | PERSPECTIVE FLIP | "You see all 10 reviews and choose which ones to show the buyer." | Pairs with the right-panel visual titled "Reviews you see"; that label becomes "Reviews the buyer sees" (see stage note below). |
| content.js `two-panel` steps[3] | "The seller chooses which reviews to display to you." | PERSPECTIVE FLIP | "You choose which reviews to display to the buyer." | |
| content.js `two-panel` steps[4] | "You bid what you believe the product is worth based on the displayed reviews." | PERSPECTIVE FLIP | "The buyer bids what they believe the product is worth based on the reviews you display." | Seller never bids. |
| content.js `two-panel` steps[5] | "The seller earns more the `higher` you bid." | PERSPECTIVE FLIP | "You earn more the `higher` the buyer bids." | |
| content.js `two-panel` steps[6] | "You earn more the `closer` your bid is to the true value." | PERSPECTIVE FLIP | "The buyer earns more the `closer` their bid is to the true value." | Steps 5 and 6 together teach both incentives; keep both, just swap whose line is "you". |
| scenes.js `twoPanel.rotate` | box title "Reviews you see" | PERSPECTIVE FLIP | "Reviews the buyer sees" | Right-panel label built in `rotate()`. |

## Slide 3 — `reviews` (title: reviews)

| LOCATION | CURRENT | TYPE | PROPOSED SELLER | NOTE |
|---|---|---|---|---|
| content.js `reviews` steps[0].text[0] | "The seller has `10 reviews` to show." | PERSPECTIVE FLIP | "You have `10 reviews` to show." | |
| content.js `reviews` steps[0].text[1] | "Each review lands around the product's true value, usually within about a point of it, but can sometimes be farther off." | IDENTICAL | (unchanged) | Neutral mechanics. |
| content.js `reviews` steps[0].text[2] | "Click explore to see how the reviews are spread out." | IDENTICAL | (unchanged) | |
| content.js INFO `reviewSpread` (title + 3 lines + hint) | distribution explainer | IDENTICAL | (unchanged) | Entirely neutral. |

## Slide 4 — `disclosure` (title: displayed reviews)

| LOCATION | CURRENT | TYPE | PROPOSED SELLER | NOTE |
|---|---|---|---|---|
| content.js `disclosure` steps[0] | "The seller can choose to show `none`, `some` or `all` of the 10 product reviews." | PERSPECTIVE FLIP | "You can choose to show `none`, `some` or `all` of the 10 product reviews." | |
| scenes.js `disclosure.enter` | box title "Seller chooses from all 10 reviews" | PERSPECTIVE FLIP | "You choose from all 10 reviews" | |
| scenes.js `disclosure.enter` | picklegend "picked" / "not picked" | IDENTICAL | (unchanged) | |
| scenes.js `disclosure.enter` | cue "Click the bars to show them to the buyer" | IDENTICAL | (unchanged) | Already the seller's own action; works verbatim for a seller participant. |
| scenes.js `disclosure.enter` | box title "What the buyer sees: displayed reviews" | IDENTICAL | (unchanged) | |
| scenes.js `disclosure.paint` | empty note "The seller displays no reviews" | REWORD | "You display no reviews" | |
| scenes.js `disclosure` guideText | "Press the die for a new draw, or untick “auto” to go through them yourself." | IDENTICAL | (unchanged) | |

## Slide 5 — `bid` (title: bid) — mostly STRUCTURAL

| LOCATION | CURRENT | TYPE | PROPOSED SELLER | NOTE |
|---|---|---|---|---|
| content.js `bid` steps[0].text[0] | "You only see the reviews selected by the seller." | PERSPECTIVE FLIP | "The buyer only sees the reviews you select." | |
| content.js `bid` steps[0].text[1] | "Your goal is to bid the product's true value." | STRUCTURAL | (seller does not bid; needs human decision, see open questions) | Whole slide is a buyer "guess the true value and bid" drill. |
| scenes.js `buildBid` lead5sub | "The seller below is not representative of a real seller. During the game, a seller may show all, some or none of them." | STRUCTURAL | if kept: "The buyer below is not representative of a real buyer." (REVIEW) | Depends on what the seller does on this slide. |
| scenes.js `buildBid` "Displayed reviews" | box title | IDENTICAL | (unchanged) | |
| scenes.js `buildBid` leadText | "Below is an example of a seller who displayed all 10 reviews." | REWORD/STRUCTURAL | "Below is an example where you displayed all 10 reviews." | Only meaningful if slide is kept for seller. |
| scenes.js `buildBid` promptText | "Can you guess the product's true value?" | STRUCTURAL | (seller already knows the value; drill does not apply) | |
| scenes.js `buildBid` button | "Place your bid" | STRUCTURAL | (no bid for seller) | |
| scenes.js `buildBid` | "Your bid" label / "off by X" score | STRUCTURAL | (no bid for seller) | |
| scenes.js `buildBid` | "↺ try again" | IDENTICAL | (unchanged) | Generic control if any interaction survives. |
| scenes.js `guessFeedback` | "Perfect/Excellent/Great/Good/Fair/Poor/Terrible guess" | STRUCTURAL | (buyer-only) | Currently unused (score shows "off by"); buyer concept regardless. |

## Slide 6 — `price` (scene `priceInfo`, title: trade)

| LOCATION | CURRENT | TYPE | PROPOSED SELLER | NOTE |
|---|---|---|---|---|
| content.js `price` steps[0].text[0] | "After you `bid`, a `sales price` is picked around the product's true value." | PERSPECTIVE FLIP | "After the buyer `bids`, a `sales price` is picked around the product's true value." | |
| content.js `price` steps[0] | "Click explore to see how the price is drawn." | IDENTICAL | (unchanged) | |
| content.js `price` stage2 head | "Your `bid` is the maximum `price` you are willing to pay:" | PERSPECTIVE FLIP | "The buyer's `bid` is the maximum `price` they are willing to pay:" | |
| content.js `price` stage2 cond yes | "If the `price` is at or below your `bid`, you buy the product automatically." | PERSPECTIVE FLIP | "If the `price` is at or below the buyer's `bid`, the buyer buys the product automatically." | |
| content.js `price` stage2 cond no | "If the `price` is above your `bid`, you don't buy the product." | PERSPECTIVE FLIP | "If the `price` is above the buyer's `bid`, the buyer does not buy the product." | |
| content.js `price` stage2 tags | "trade happens" / "no trade" | IDENTICAL | (unchanged) | |
| content.js `price` stage2 | "Click explore to see when a trade happens." | IDENTICAL | (unchanged) | |
| content.js INFO `priceDemoB` lines | "The true value is fixed here. Change your `bid` and observe when a trade happens." / "A trade happens only when your `bid` is at or above the `price`." | PERSPECTIVE FLIP | "The true value is fixed here. Change the buyer's `bid` and observe when a trade happens." / "A trade happens only when the buyer's `bid` is at or above the `price`." | hint "Move the bid..." describes the interactive slider; if kept for seller it is the buyer's bid, label accordingly. |
| content.js INFO `priceDemoA` (title/lines/hint) | "How the price is drawn" etc. | IDENTICAL | (unchanged) | Neutral. |
| scenes.js `priceInfo.revealC` earnLines[0] | "When you buy, you earn the true value minus the `price`." | PERSPECTIVE FLIP | "When the buyer buys, they earn the true value minus the `price`." | Default part-C text (overridable). |
| scenes.js `priceInfo.revealC` earnLines[1] | "The seller earns your `bid` minus the production cost." | PERSPECTIVE FLIP | "You earn the buyer's `bid` minus your production cost." | Very close to the agreed takeaway close; keep consistent. |
| scenes.js `priceInfo.revealC` noTrade[0] | "If there is no trade, neither you nor the seller earns anything." | PERSPECTIVE FLIP | "If there is no trade, neither you nor the buyer earns anything." | |
| scenes.js `priceInfo.revealC` noTrade[1] | "`Remember:` your `bid` never changes the `price`, only whether you buy the product or not." | PERSPECTIVE FLIP | "`Remember:` the buyer's `bid` never changes the `price`, only whether they buy the product or not." | |

## Slide 7 — `examples-intro` (title: examples)

| LOCATION | CURRENT | TYPE | PROPOSED SELLER | NOTE |
|---|---|---|---|---|
| content.js `examples-intro` steps[0] line 1 | "Let's consider 2 simple examples to understand:" | IDENTICAL | (unchanged) | Wrapper is neutral; the two examples below are buyer concepts. |
| content.js `examples-intro` line 2 | "1. Overbidding / Overestimation of the true value" | STRUCTURAL | (buyer concept; seller analogue is a design choice) | |
| content.js `examples-intro` line 3 | "2. Underbidding / Underestimation of the true value" | STRUCTURAL | (as above) | |

## Slides `ex-bid-1` / `ex-bid-2` (overbidding / underbidding) — STRUCTURAL

| LOCATION | CURRENT | TYPE | PROPOSED SELLER | NOTE |
|---|---|---|---|---|
| content.js `ex-bid-1` exCase.gateDoneText | "Bidding the true value sometimes means no trade, and rightly so, since trading here would have left you worse off." | STRUCTURAL | (buyer drill) | |
| content.js `ex-bid-1` finalLines | "You paid 3 for a product worth only 2." / "Bidding above the true value risks overpaying." | STRUCTURAL | (buyer drill) | |
| content.js `ex-bid-1` steps | "The product's value is 2." | IDENTICAL | (unchanged) | |
| content.js `ex-bid-1` steps | "Your bid is `4`. You overbid." | STRUCTURAL | (no seller bid) | |
| content.js `ex-bid-1` steps | "The sales price ends up at `3`." | IDENTICAL | (unchanged) | |
| content.js `ex-bid-2` exCase.gateDoneText | "Bidding the true value, you never miss a good deal." | STRUCTURAL | (buyer drill) | |
| content.js `ex-bid-2` finalLines | "You skipped a product worth 4 that you could have bought for 3." / "Bidding below the true value risks missing a good deal." | STRUCTURAL | (buyer drill) | |
| content.js `ex-bid-2` steps | "The product's value is 4." | IDENTICAL | (unchanged) | |
| content.js `ex-bid-2` steps | "Your bid is `2`. You underbid." | STRUCTURAL | (no seller bid) | |
| content.js `ex-bid-2` steps | "The sales price ends up at `3`." | IDENTICAL | (unchanged) | |
| scenes.js `exBid` hints | "set your bid to the true value" / "use the slider to change the bid" | STRUCTURAL | (buyer bid slider) | |
| scenes.js `exBid` recapFor | "You paid X for a product worth Y." / "You avoided overpaying..." / "You missed a deal..." | STRUCTURAL | (buyer outcomes) | |
| scenes.js `exBid` pfHtml | "Your payoff `<b>`" | IDENTICAL (auto) | (no change) | Already keys on `App.config.TREATMENT` via `isBuyer`; sets `config.TREATMENT='SELLER'` and it shows the seller payoff automatically. |
| scenes.js `exBid` calcStmts | "You: value − price = ..." / "Seller: bid − (value − 0.3) = ..." / "Buyer: value − price = ..." / "production cost = value − 0.3" | IDENTICAL (auto) | (no change) | `isBuyer` swaps "You"/"Seller"/"Buyer"; under SELLER, "You: bid − (value − 0.3)" renders. |
| scenes.js `exBid` | "No trade, so both earn `0`." | IDENTICAL | (unchanged) | |

## Slide `lessons` (title: takeaway) — STRUCTURAL, ends with fixed line

| LOCATION | CURRENT | TYPE | PROPOSED SELLER | NOTE |
|---|---|---|---|---|
| content.js `lessons` steps[0] | "The examples show one simple rule: bid what you believe the product is truly worth." | STRUCTURAL | (seller does not bid) | Whole slide rewritten for seller voice; see proposed block below. |
| content.js `lessons` steps[1] | "Bid above it and you risk overpaying; bid below it and you risk missing a good deal." | STRUCTURAL | | |
| content.js `lessons` steps[2] | "But there's a catch. You don't see the true value." | STRUCTURAL | (seller does see the true value) | |
| content.js `lessons` steps[3] | "You have to estimate it from the reviews you are shown." | STRUCTURAL | | |
| content.js `lessons` steps[4] | "And those reviews are chosen by the seller who earns more when you bid higher." | PERSPECTIVE FLIP | "You choose which reviews to show, and you earn more when the buyer bids higher." | |
| content.js `lessons` steps[5] | "So the real challenge isn't the bidding rule. It's judging the true value from evidence someone else selected." | STRUCTURAL | (see proposed block) | Must end on the agreed fixed close. |

Proposed SELLER takeaway block (REVIEW; human to approve the arc):
1. "You know the true value and you see all 10 reviews."
2. "The buyer sees only the reviews you choose to show."
3. "The buyer bids what they believe the product is worth, and you earn more the higher they bid."
4. "So the real challenge is choosing which reviews to show. You earn what the buyer bids minus your production cost."

(Last sentence is the agreed exact close: "You earn what the buyer bids minus your production cost.")

## Slide `payment-overview` (title: payment)

| LOCATION | CURRENT | TYPE | PROPOSED SELLER | NOTE |
|---|---|---|---|---|
| content.js `payment-overview` steps[0] | "You will play `5 main rounds` and `2 additional rounds` as a buyer." | PERSPECTIVE FLIP | "You will play `5 main rounds` and `2 additional rounds` as a seller." | |
| content.js `payment-overview` steps[1] | "In each round you are matched with a different seller and decide how much to bid after seeing the reviews that seller shows you." | PERSPECTIVE FLIP | "In each round you are matched with a different buyer and decide which reviews to show them." | |
| content.js `payment-overview` steps[2] | "At the end, `two` rounds are randomly selected for your bonus: one main round and one additional round." | IDENTICAL | (unchanged) | |

## Slide `bonus-payment` (scene `finalNote`, title: bonus)

| LOCATION | CURRENT | TYPE | PROPOSED SELLER | NOTE |
|---|---|---|---|---|
| content.js `bonus-payment` steps[0] | "Your bonus is the `sum of your earnings` from the two selected rounds." | IDENTICAL | (unchanged) | |
| content.js `bonus-payment` steps[1] | "You may earn or lose stars in each round. Stars convert to money at `£5 per star`, and you can earn up to `£10` over the two rounds." | IDENTICAL | (unchanged) | Verify £ caps: real game uses `MAX_BONUS_PAYMENT_SELLER` which may differ from the buyer figure. Flag the numbers, not the voice. |
| content.js `bonus-payment` steps[2] | "If your total from this task is negative, the loss is deducted from your other bonus payments." | IDENTICAL | (unchanged) | Sellers can also go negative (bid < cost). |
| scenes.js `finalNote` L1/L2/L3 | "You are done with the instructions, next is a quiz." / "You can use the back button and review the instructions." / "When you are ready click the Done button to proceed." | IDENTICAL | (unchanged) | |

## Debug-only / benched (not in normal Back/Next order) — noted for completeness

| LOCATION | CURRENT | TYPE | PROPOSED SELLER | NOTE |
|---|---|---|---|---|
| content.js `price-old` (debugOnly) steps | "After you make your `bid`, a `sales price` is picked..." / "A trade happens only if your `bid` is bigger than or equal to the `price`." | PERSPECTIVE FLIP | swap "you/your bid" → "the buyer/the buyer's bid" | Reachable only via DEBUG jump menu. |
| content.js `price-old` partC | "WHEN A TRADE TAKES PLACE" / "You earn the true value minus the `price`." / "The seller earns your `bid` minus the production cost." / "If there is no trade, neither you nor the seller earns anything." | PERSPECTIVE FLIP | mirror the Slide 6 part-C seller rewrites | Debug archive of old slide 6. |
| content.js INFO `tradeRule` | "A trade takes place when `bid` ≥ `price`." / "If there is no trade, neither you nor the seller earns anything." | PERSPECTIVE FLIP | line 2 → "...neither you nor the buyer earns anything." | Line 1 neutral. |
| content.js INFO `priceDemo` (debug full box) | "How the price is drawn" etc. | IDENTICAL | (unchanged) | |
| content.js (commented) `ex-disp-1/2/3` | "The seller shows all 10 reviews..." etc. | — | seller versions would be "You show..." | Disclosure-example slides commented out; relevant seller material if restored. |
| content.js (commented) `strategy-market` lead + scenes.js `market` | "...each round's payoff for the buyer and the seller is recorded..." and `EXAMPLES` ("Assume you bid below the true value...") | STRUCTURAL | buyer-bid framed | Slide commented out of deck; `market` scene code live but unused. Heavily buyer-bid framed if revived. |

## `js/config.js` — DIRECTIVE (purple "what to do" prompts)

IMPORTANT caveat: `config.CONDITION`, `config.DIRECTIVE` and `config.MIN_SLIDE` are
keyed to an OLDER 13-slide model whose numbering does NOT line up with the current
`content.js` SLIDES order (e.g. DIRECTIVE 5 talks about a predict/bid step; current
slide 5 is the bid drill but the toggle it references is not rendered). Treat the
numbers as the legacy map; a human should confirm which directives are still wired.

| LOCATION | CURRENT | TYPE | PROPOSED SELLER | NOTE |
|---|---|---|---|---|
| config.js DIRECTIVE 2 | "Use [dice] to draw the product's value." | IDENTICAL | (unchanged) | |
| config.js DIRECTIVE 3 | "Use [dice] to generate a sample of reviews." | IDENTICAL | (unchanged) | |
| config.js DIRECTIVE 4 | "Click a review bar to disclose it to the buyer." | IDENTICAL | (unchanged) | Already the seller's action. |
| config.js DIRECTIVE 5 (fn) | "Click the [dice] for a new seller disclosure, then bid again." / "Now set your bid and press Submit again." / "Set your bid, then press Submit." | STRUCTURAL | (buyer bid flow) | |
| config.js DIRECTIVE 6 | "Move your bid, then press the [blue dice] to draw the price." | STRUCTURAL/FLIP | if kept: "Press the [blue dice] to draw the price." | Seller sets no bid. |
| config.js DIRECTIVE 7 | "Set your bid, then press the [blue dice] to draw the price and see the payoffs." | STRUCTURAL | | |
| config.js DIRECTIVE 8 | "Place a bid and press Submit to see the outcome." | STRUCTURAL | | |
| config.js DIRECTIVE 9 / 10 | "Step through all the examples to continue." | IDENTICAL | (unchanged) | |

## `js/config.js` — INFO (left-panel info boxes)

| LOCATION | CURRENT | TYPE | PROPOSED SELLER | NOTE |
|---|---|---|---|---|
| config.js INFO `graph` | "Red line — the buyer's bid." / "A trade happens only when the blue price is at or below the red bid." etc. | IDENTICAL | (unchanged) | Uses buyer/seller as neutral graph labels; correct for both. |
| config.js INFO `payoff` | "Buyer earns: true value − sales price." / "Seller earns: bid − (true value − 0.3)." / "If there is no trade, neither the buyer nor the seller earns anything." | IDENTICAL | (unchanged) | States both roles neutrally; valid verbatim for a seller. |
| config.js INFO `lock` | "Keeps the true value fixed..." | IDENTICAL | (unchanged) | |
| config.js INFO `color` | "Tints reviews above the value purple and below the value orange..." | IDENTICAL | (unchanged) | |

---

## Summary 1 — Reuse-from-nodegame

Strings where we should prefer the EXISTING seller wording from
`game/client_types/canServer/other/instruction2_text.js` (`textList_seller`)
rather than inventing a fresh rewrite. Flagged counterparts:

- Slide 2 overview (steps[0]–[6]): the "randomly assigned a product / true value
  1–5 / you choose which reviews to show / buyer bids / you earn more the higher
  the buyer bids" sequence — canonical seller framing lives in `textList_seller`.
- Slide 4 disclosure (steps[0] "show none/some/all") — seller's core action
  sentence almost certainly has a direct counterpart.
- Slide 6 part C payoff lines (`priceInfo.revealC` earnLines/noTrade) — the
  seller payoff/trade-rule phrasing should match the real game verbatim,
  including the production-cost wording.
- Slide 6 trade rule (stage2 "bid is the max price the buyer will pay",
  yes/no trade conditions) — mirror the game's seller-side trade explanation.
- Slide `lessons` takeaway block — align the seller's "what you do / how you
  earn" arc with `textList_seller`, keeping the agreed fixed close.
- Slide `payment-overview` steps[0]–[1] ("play as a seller / matched with a
  different buyer / choose which reviews to show") — match the game's wording.

## Summary 2 — Open questions for human / coauthor review

These are design decisions, not mechanical rewrites:

1. **Slide 5 (`bid`) entire purpose.** Buyer version is a "guess the true value
   then bid" drill. The seller does not bid and already knows the value. Decide
   what the seller DOES here: a disclosure-choice practice? a "see how your
   disclosure moves the buyer's bid" interaction? Or drop the slide for sellers.
   This cascades to the `buildBid` lead/prompt/button/score strings and DIRECTIVE 5.

2. **Examples (`examples-intro`, `ex-bid-1`, `ex-bid-2`, and the `exBid` recap/
   advice/gate text).** Over/underbidding are buyer lessons. The seller analogue
   is a disclosure lesson (show-all vs cherry-pick and how it moves the bid).
   Note the payoff cells and calc lines are ALREADY `TREATMENT`-aware and will
   auto-show the seller payoff; only the surrounding narrative needs redesign.

3. **`lessons` takeaway arc.** Needs a genuine seller-voice rewrite (proposed
   block above), ending exactly on "You earn what the buyer bids minus your
   production cost." Confirm the arc.

4. **The Buyer/Seller toggle (`config.MIN_SLIDE.toggle: 5`, CONDITION 5
   "switch to Buyer").** Referenced in config but NOT rendered by the current
   `content.js`/`scenes.js` slide 5. Confirm whether the toggle is benched or
   must be revived, and what it should read for a seller.

5. **Slide 6 interactive bid slider (`priceDemoB`, part C, DIRECTIVE 6/7).**
   For a seller, is the bid shown as the buyer's (observe-only) or removed? The
   string flips assume "the buyer's bid"; confirm the seller still manipulates a
   slider at all.

6. **Bonus £ caps on `bonus-payment` steps[1].** Voice is identical, but confirm
   the star-to-£ cap for sellers (`MAX_BONUS_PAYMENT_SELLER`) matches the £10 shown.
