// bridge.js — the nodegame PORT SEAM.
// In this standalone build these are console.log stubs so we can watch the browser console
// and verify the gate / recording events fire at the right moments. In the nodegame port each
// becomes real client<->logic traffic (see PORT-PIPELINE.md and the intro-2 template):
//   setup()   -> node.on.data('setup-instruction2-CLIENT', ...)  + page.jumpTo(lastFinishedPage)
//   visited() -> parent.node.emit('instruction-2-tracker-visited', slide.id)  (server writes
//                player.instructions.lastPageCompleted = slide.id — the reconnect anchor)
//   done()    -> parent.node.emit('instructions2-done-PLAYER', durationMs) + node.done()
window.App = window.App || {};

App.bridge = {
  setup() {
    console.log('[bridge] SETUP — would receive {textList, lastFinishedPage} from logic and jumpTo the last finished page');
  },
  // fired once, the first time a slide's gate opens (that slide is now "finished")
  visited(slide) {
    if (!slide) return;
    console.log(`[bridge] VISITED "${slide.id}" — gate passed; would emit instruction-2-tracker-visited("${slide.id}") → server records lastPageCompleted="${slide.id}"`);
  },
  // fired on the final "Done"
  done(durationMs) {
    console.log(`[bridge] DONE — instructions complete in ${durationMs} ms; would emit instructions2-done-PLAYER(${durationMs}) + node.done()`);
  },
};
