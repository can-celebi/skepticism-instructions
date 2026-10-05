# Coauthor feedback — "New version of the instructions"

Source: Gmail thread *New version of the instructions*, 30 Sep – 1 Oct 2026.
Can sent the BUYER instructions link (`?debug`) on 29 Sep; Christian (Koch) and
Stefan (Penczynski) replied. This file records their suggestions so we can go
over them. Page numbers below are the slide counter they saw in the live deck;
the scene name (in `js/left/scenes.js` / `content.js`) is given for precision.

Status legend: `[ ]` to do · `[x]` done · `[?]` open / needs a decision ·
`[discuss]` flagged for the Friday chat.

---

## Agreed text edits

- [ ] **p.2 (two-panel) — add a closing line.** Stefan: add at the end
  `"You won't even see nice pictures."`
  (plays on the product being abstract / no image shown).
  - **Can's expansion (2026-10-05):** add a final stage/step to slide 2, in a
    muted colour (gray, tentative), saying the shoe images are for instruction
    purposes only — something like: *"These shoe images are for instruction
    purposes only. During the task you won't see such images, only review
    scores."* (Supersedes / absorbs Stefan's shorter line; final wording TBD.)
    [to implement]

- [ ] **p.3 (reviews) — add an invitation after the spread sentence.** Christian:
  after `"... but can sometimes be farther off."` add something like
  `"Try it out below to get a feel for how the reviews behave."`

- [x] **p.6 (price) — tighten the bid-vs-price line. DONE 2026-10-05.** Christian (Stefan agrees):
  directly after `"... product's true value."` write
  `"Your bid never changes the price. It only decides whether you buy."`
  and **delete** the later line
  `"Remember: your bid never changes the price, only whether you buy the product or not."`

## Examples

- [ ] **Keep only 2 examples.** Stefan: "I like to have only 2 examples."
  (We currently have two example slides, ex-bid-1 / ex-bid-2 — confirm this is
  what he means and that we are not adding a third.)

- **Precaution for the confused-participant case.** Christian got confused and
  kept dragging the bid toward the *price* instead of the *true value*, and
  briefly suspected a bug. His suggestion: as a fallback, let participants click
  "next" anyway after some time.
  - **Can's decision (2026-10-05):** the timed-unlock fallback is probably not
    needed, because Christian's confusion was very specific (drag to price vs
    value). Instead, **indicate more clearly what the participant must do before
    the Next button appears.**
  - Ideas on the table:
    1. A countdown animation on the Next button itself (a ring / number counting
       down from 3 or 5) so people see there is a deliberate wait, not a bug.
    2. When the Next button is still inactive, hovering or clicking it shows a
       short line of text naming the step required right now ("drag the bid to
       the true value", etc.).
  - Open constraints to check: must still work on **mobile** (no hover there, so
    the inactive-button hint would need tap/press handling), and must not be
    over-engineered. [discuss / to spec]

## UX / implementation

- **Scroll to top of each new slide on "Next".** Stefan (confirmed twice —
  laptop, MS Edge): pressing "Next" does not always land at the top of the next
  slide; it is sometimes already scrolled down, which is confusing. Stefan notes
  the apparent OK-vs-Next distinction is that a new slide should start from the
  top. Can agrees this is just an implementation fix ("the page should scroll up
  with every new slide").
  - **Owner: the nodegame-integration session (Kerem), to handle at port time.**
    Reason: under nodegame the whole page is nested inside an iframe, so the
    scroll-to-top has to target the right document/viewport (parent DOM vs child
    DOM) — tricky and best solved once, in the real nodegame frame, not in the
    standalone prototype. Likely an auto-scroll-to-top at each page/step setup
    (check `player.js` for an existing helper first). Flagged to that session.

- **p.3 — explore button mandatory.** Stefan assumed it is (`"the explore button
  is mandatory, so this has been implemented already?"`), i.e. he expects/endorses
  it. **Can's decision (2026-10-05): make ALL explore buttons mandatory** (must be
  opened before advancing), slide 3 included. Neither coauthor objected; Stefan
  effectively asked for it. [to implement]
  - **Port implication (from Kerem):** making an explore button mandatory changes
    its gate contract on the nodegame side from `ifVisited` (banks on arrival) to
    `ifCompletionConditionMet` (banks only once the explore is opened/done). Mirror
    this in the per-slide gate list when the standalone change is final, so the
    tracker/CSV contract stays aligned.

- **Visual clutter = the `price_zones.png` illustration.** This is the "more
  illustration" Claude suggested; Christian's worry (PS #4) is that it could
  clutter the examples. See the "Attached illustration" section below. [discuss]

## Seller takeaway (for the SELLER side, to build next)

### Christian's draft (verbatim)

> The examples show one simple rule for buyers: bid what they believe the product is truly worth.
>
> But buyers don't see the true value. They have to estimate it from the reviews you show them.
>
> So the reviews you choose shape what your buyer believes, and how much they bid.
>
> And the higher your buyer bids, the more you earn.

Christian's own caveat (verbatim): *"Or is it too much steering (in the last two
sentences)??"*

### Stefan's comment on it (verbatim)

> On the seller draft: I feel one could replace the last two sentences with a
> matter-of-fact sentence that the seller earnings depend on the bid. "You earn
> what the buyer bids minus your production cost." The second sentence may
> already highlight enough the role of the reviews shown.

Christian's reply (verbatim): *"I would also be happy with Stefan's replacement
proposal for the seller takeaway. What do you think, Can?!"*

### Resulting draft (both coauthors favour; pending Can)

Keep Christian's first two lines; replace the last two with Stefan's close:

> The examples show one simple rule for buyers: bid what they believe the product is truly worth.
> But buyers don't see the true value. They have to estimate it from the reviews you show them.
> You earn what the buyer bids minus your production cost.

(Dropped as too much steering: *"So the reviews you choose shape what your buyer
believes, and how much they bid."* / *"And the higher your buyer bids, the more
you earn."*)

---

## Attached illustration — `price_zones.png` (saved to `img/`)

Christian attached one image (the "more illustration" Claude had proposed). It is
a 3-panel number-line figure for the bid-vs-value examples:

- **Panel 1 — Overbid: value 2, bid 4.** Number line with `value` marked (black)
  and `bid` far to the right (red). A green block sits left of value ("price below
  value: good deal"), a pink/hatched block sits just right of value, bracketed
  "you'd buy at a loss here".
- **Panel 2 — Underbid: value 4, bid 3.3.** `bid` (red) left of `value` (black);
  green block then a hatched overlap then pink block; bracket under the hatched
  overlap reads "you'd miss these good deals".
- **Panel 3 — Bid = value 3.** `bid = value` aligned; green block left, pink block
  right, no hatching; caption "you buy exactly the good deals, nothing else".
- **Legend:** green = "price below value: good deal"; pink = "price above value:
  loss"; hatched = "bid gets it wrong".

Assessment (for the discussion): the figure is clear and on-message — it makes the
"bid = value is the sweet spot" point visually, and the hatched "bid gets it wrong"
zone is a nice touch. The risk Christian flags is real: our example slides already
show value/bid/price on a line plus the payoff calc, so dropping this in as-is
would duplicate the number line and add a legend + three stacked panels. Options:
(a) skip it, (b) use a single reduced version (just the "bid = value" panel) as a
summary, or (c) fold its colour logic (green good-deal / pink loss zones) into the
existing example line instead of adding a separate figure. [discuss Oct 6]

---

## Meeting this week

- **Tue 6 Oct 2026, 14:30–15:30 (Vienna), Microsoft Teams** — calendar event
  titled **"FWF"**, organiser Stefan Penczynski, attendees Can + Christian +
  Stefan. This is the only all-three meeting on the calendar this week.
  (Title suggests an FWF grant focus; Christian's email also floated "a chat on
  Friday" — that would have been Fri 2 Oct, already past, so the Oct 6 call is the
  live one. Confirm with them whether the instructions get discussed there.)
- Teams join link + passcode are in the calendar invite.

## Meta / next steps

- Christian: instructions look "almost trial ready"; after last adjustments, the
  next step is to produce the seller/buyer counterpart.
- Christian in Vienna; a chat was planned for **Friday** (discuss the `[discuss]`
  and `[?]` items there).
