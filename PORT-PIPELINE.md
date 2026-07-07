# Nodegame data pipeline — how recording works in games/skepticism

(How the real experiment sets data to memory, so the instructions port connects cleanly.)

## Three JS contexts (not two)
1. **Browser / iframe** — `public/js/**` page code. Times with `START_TIME = Date.now()`,
   talks up via `parent.node.emit('<stage>-done-PLAYER', payload)` and receives pushes
   via `node.on.data('...-PLAYER', …)`.
2. **Player client** — `game/client_types/player.js` + `canClient/*.js`. **This is where
   `node.set()` is called** = the write into server memory. `player.js` `stager.require`s
   every canClient step file.
3. **Logic / server** — `logic.js` + `canServer/**`. Owns `node.game.memory` and each
   `memoryCsv` writer; talks to the client via `node.say('<evt>', player.id, data)` (down)
   and `node.on.data('<evt>-LOGIC', …)` (up).

## Pure client-capture stage (the archetype — task-reflection)
1. Browser: `node.emit('task-reflection-done-PLAYER', payload)` (`public/js/task-reflection/main.js:288`).
2. Player client: `canClient/task-reflection.js:17` — `node.on(... , m => { node.set({…}); node.done(); })`.
   One `node.set({...})` = **one memory item** (auto-stamped player/stage/timestamp/session).
3. Logic: `memoryToCsv.taskReflection(memory)` registered once in `setOnInit` (`logic.js:226`).
4. Writer: `memoryCsv.js:1355` — `memory.view('taskReflectionDuration').save('task-reflection.csv',
   { header:[…], keepUpdated:true })`. `view(field)` = live view of items carrying that anchor
   field; `.save(keepUpdated:true)` rewrites the CSV on every matching insert.
   **One `node.set` on the anchor field ⇒ one CSV row.** Missing header fields → `NA`.
   A pure-capture stage needs **no** canServer file.

## The "loop in logic, send back" pattern (it exists)
- **(A) buyer/seller task loop** — client `node.say('request-buyer-task-LOGIC', 'SERVER', taskId)`
  → logic indexes `player.info.decisions[activeTaskId-1]` and `node.say('buyer-task', player.id, d)`
  back (`canServer/other/buyer.js:8`) → browser renders, user bids → client computes payoffs and
  `node.set({...})` (final record) **and** `node.say('record-bid-in-player-object-LOGIC', …)` so
  logic mutates `player.info.decisions[idx]` → loop increments task id (`game-buyer.js:143`).
- **(B) logic computes an aggregate, client sets on receipt** — bonus payment: client
  `node.say('get-bonus-payment-LOGIC')` → logic `node.say('bonus-payment-PLAYER', id, player.bonusPayment)`
  → client `node.set({ bonusPayment… })` (`exit-main.js:25`). Same idiom for experiment duration,
  postV order, gameType.

So `node.set` always executes on the **player client**, but the *values* may be computed by logic
and shipped down. **The instructions stage is pure client-capture (flavor of task-reflection) — no
logic loop needed.**

## Adding the instructions writer (intro2-left) — the convention
1. `game.stages.js` — `.stage('intro2-left')` + add to the `stager.skip([...])` list.
2. `player.js` — `stager.require(__dirname, 'canClient', 'intro2-left.js')`.
3. `canClient/intro2-left.js` — `stager.extendStep('intro2-left', { frame:'intro2-left.htm',
   init(){ node.on('intro2-left-done-PLAYER', m => { node.set({ …fields… }); node.done(); }); } })`.
4. `canServer/memoryCsv.js` — `intro2Left(memory){ memory.view('intro2LeftDuration')
   .save('intro2-left.csv', { header:[…], keepUpdated:true }); }`.
5. `logic.js` — `memoryToCsv.intro2Left(memory);` in the memory block.
6. `public/intro2-left.htm` + `public/js/…` firing `parent.node.emit('intro2-left-done-PLAYER', dump)`.
   (Naming: event `<stage>-done-PLAYER`; anchor `<stageCamel>Duration`; CSV `<stage>.csv`.)

## CSV escaping gotcha (decides the packed-string format)
NDDB (`node_modules/NDDB/lib/formats/csv.js`) wraps every **string** cell in `"..."` (so **commas
are safe**), but escapes JSON-style (`\"`, not RFC-4180 `""`). **R's `read.csv`/`readr` mis-parse any
packed string containing a literal `"`.** Numbers are written raw/unquoted.
→ **Use pipe-delimited packed strings with no commas/quotes/newlines** (exactly like
`keystroke_taskReflection_rule`). Reads cleanly with `read.csv` + `strsplit(x, "\\|")`. If JSON is
unavoidable, restrict to numeric arrays (catcher-style). This validates the tracking design's
`instr2_events` / `instr2_perSlide` packed format.

## What "ready to connect" means for the prototype
- Keep exactly **one** completion handoff: at the final Done, call `App.dataSource.submit(dump)`.
- `dump` = flat scalars + the two pipe-delimited packed strings (no commas).
- Port swaps only `dataSource.submit`'s body to
  `parent.node.emit('intro2-left-done-PLAYER', dump); parent.node.done();`
  and adds the `canClient/intro2-left.js` `node.set` + the `memoryCsv.intro2Left` writer.
  Everything else in the prototype is pure DOM and copies over unchanged.
