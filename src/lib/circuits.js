/* circuits.js — gate-level netlists.
   Node shapes: {t:'VAR',name} | {t:'CONST',v} | {t:'NOT'|'AND'|'OR'|'NAND'|'NOR', a, b}
   buildBasicTree() builds an AND/OR/NOT tree from minimized SOP terms, caching
   VAR/NOT-of-VAR nodes by name so every occurrence of a variable shares one
   source object (this is what makes the SVG renderer draw one input pin per
   variable, with wires fanning out, instead of repeating the variable).
   toNand()/toNor() rewrite that tree into an all-NAND / all-NOR DAG using the
   standard bubble-pushing identities, memoized by node identity so shared
   sub-nodes (like a shared inverter) stay shared after rewriting too. */

function andTree(nodes) { return nodes.reduce((a, b) => ({ t: 'AND', a, b })); }
function orTree(nodes) { return nodes.reduce((a, b) => ({ t: 'OR', a, b })); }

// export function buildBasicTree(sopTerms) {
//   if (sopTerms.length === 0) return { t: 'CONST', v: 0 };
//   const varCache = new Map();
//   const notCache = new Map();
//   function varNode(name) {
//     if (!varCache.has(name)) varCache.set(name, { t: 'VAR', name });
//     return varCache.get(name);
//   }
//   function notNode(name) {
//     if (!notCache.has(name)) notCache.set(name, { t: 'NOT', a: varNode(name) });
//     return notCache.get(name);
//   }
//   const productNodes = sopTerms.map(term => {
//     if (term.length === 0) return { t: 'CONST', v: 1 };
//     const lits = term.map(l => (l.neg ? notNode(l.name) : varNode(l.name)));
//     return andTree(lits);
//   });
//   return orTree(productNodes);
// }
export function buildBasicTree(sopTerms) {
  if (sopTerms.length === 0) return { t: 'CONST', v: 0 };
  const productNodes = sopTerms.map(term => {
    if (term.length === 0) return { t: 'CONST', v: 1 }; // covers everything
    const lits = term.map(l => l.neg ? { t: 'NOT', a: { t: 'VAR', name: l.name } } : { t: 'VAR', name: l.name });
    return andTree(lits);
  });
  return orTree(productNodes);
}

export function toNand(node, memo = new Map()) {
  if (memo.has(node)) return memo.get(node);
  let result;
  if (node.t === 'VAR' || node.t === 'CONST') result = node;
  else if (node.t === 'NOT') { const a = toNand(node.a, memo); result = { t: 'NAND', a, b: a }; }
  else if (node.t === 'AND') {
    const a = toNand(node.a, memo), b = toNand(node.b, memo);
    const n = { t: 'NAND', a, b };
    result = { t: 'NAND', a: n, b: n };
  } else if (node.t === 'OR') {
    const a = toNand(node.a, memo), b = toNand(node.b, memo);
    result = { t: 'NAND', a: { t: 'NAND', a, b: a }, b: { t: 'NAND', a: b, b } };
  } else throw new Error('toNand: unexpected node ' + node.t);
  memo.set(node, result);
  return result;
}

export function toNor(node, memo = new Map()) {
  if (memo.has(node)) return memo.get(node);
  let result;
  if (node.t === 'VAR' || node.t === 'CONST') result = node;
  else if (node.t === 'NOT') { const a = toNor(node.a, memo); result = { t: 'NOR', a, b: a }; }
  else if (node.t === 'OR') {
    const a = toNor(node.a, memo), b = toNor(node.b, memo);
    const n = { t: 'NOR', a, b };
    result = { t: 'NOR', a: n, b: n };
  } else if (node.t === 'AND') {
    const a = toNor(node.a, memo), b = toNor(node.b, memo);
    result = { t: 'NOR', a: { t: 'NOR', a, b: a }, b: { t: 'NOR', a: b, b } };
  } else throw new Error('toNor: unexpected node ' + node.t);
  memo.set(node, result);
  return result;
}

export function evalTree(node, env) {
  switch (node.t) {
    case 'VAR': return env[node.name];
    case 'CONST': return node.v;
    case 'NOT': return evalTree(node.a, env) ? 0 : 1;
    case 'AND': return (evalTree(node.a, env) && evalTree(node.b, env)) ? 1 : 0;
    case 'OR': return (evalTree(node.a, env) || evalTree(node.b, env)) ? 1 : 0;
    case 'NAND': return (evalTree(node.a, env) && evalTree(node.b, env)) ? 0 : 1;
    case 'NOR': return (evalTree(node.a, env) || evalTree(node.b, env)) ? 0 : 1;
    default: return 0;
  }
}

// Walk by object identity — a shared node (fan-out) is visited/counted once.
export function collectNodes(root) {
  const seen = new Set(), order = [];
  (function visit(n) {
    if (seen.has(n)) return;
    seen.add(n);
    if (n.a) visit(n.a);
    if (n.b) visit(n.b);
    order.push(n);
  })(root);
  return order;
}

export function countGates(node) {
  return collectNodes(node).filter(n => n.t !== 'VAR' && n.t !== 'CONST').length;
}
