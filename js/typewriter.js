// typewriter.js — reveals a slide's statements with a typewriter effect.
// Pure DOM only (no parent.* / no App.state) so it ports into the nodegame
// iframe byte-for-byte. Handles inline markup (<b>, <em>, dice icons) by mirroring
// the source node tree and typing text nodes char-by-char into the clones.
window.App = window.App || {};

App.typewriter = (function () {
  let gen = 0;               // generation token: bumping it cancels a running type
  const SPEED = 60;          // ms per character (spaces/structure advance instantly)

  // mirror srcNode's children into targetNode as an ORDERED op list.
  // Elements are inserted at type-time (an 'el' op), NOT during the build — otherwise
  // every element would be attached before the plain text that precedes it, scrambling
  // the order (e.g. "You are a <b>buyer</b>" → "buyerYou are a").
  function buildOps(srcNode, targetNode, ops) {
    srcNode.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        for (const ch of child.textContent) ops.push({ type: 'char', ch, parent: targetNode });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const clone = child.cloneNode(false); // tag + attrs, no children yet
        ops.push({ type: 'el', node: clone, parent: targetNode });
        buildOps(child, clone, ops);          // recurse → type the inner text too
      }
    });
  }

  // run(el, statements, onDone) → { skip(), cancel() }
  function run(el, statements, onDone) {
    const mine = ++gen;
    el.innerHTML = '';
    let finished = false;

    // build empty <p class="stmt"> shells that mirror each statement's structure
    const paras = statements.map((html) => {
      const src = document.createElement('div');
      src.innerHTML = html;
      const p = document.createElement('p');
      p.className = 'stmt';
      el.appendChild(p);
      return { src, p };
    });

    const fillAll = () => paras.forEach((o) => { o.p.innerHTML = o.src.innerHTML; });
    const finish = () => {
      if (finished) return;
      finished = true;
      el.classList.remove('typing');
      if (onDone) onDone();
    };

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { fillAll(); finish(); return { skip() {}, cancel() {} }; }

    // flatten every paragraph into one ordered op list
    const ops = [];
    paras.forEach((o) => buildOps(o.src, o.p, ops));

    el.classList.add('typing');
    let i = 0;
    function step() {
      if (mine !== gen) return;                 // cancelled / superseded
      if (i >= ops.length) { finish(); return; }
      const op = ops[i++];
      if (op.type === 'el') { op.parent.appendChild(op.node); step(); return; } // structural → instant
      op.parent.appendChild(document.createTextNode(op.ch));
      if (op.ch === ' ') step(); else setTimeout(step, SPEED);                   // spaces advance instantly
    }
    step();

    return {
      // finish instantly but keep the completed text
      skip() { if (finished || mine !== gen) return; gen++; fillAll(); finish(); },
      // abandon without firing onDone (caller is replacing the content)
      cancel() { if (mine === gen) gen++; finished = true; },
    };
  }

  return { run };
})();
