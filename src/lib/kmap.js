/* kmap.js — Karnaugh map rendering. 5/6-variable maps are split into 2 or 4
   four-variable blocks (the standard textbook layout) instead of one
   oversized grid. */

function grayCode(bits) {
  const n = 2 ** bits;
  const seq = [];
  for (let i = 0; i < n; i++) seq.push(i ^ (i >> 1));
  return seq;
}
function bitsStr(v, bits) { return v.toString(2).padStart(bits, '0'); }

function kmapAxes(vars) {
  const n = vars.length;
  if (n === 2) return { rowVars: [vars[0]], colVars: [vars[1]] };
  if (n === 3) return { rowVars: [vars[0]], colVars: [vars[1], vars[2]] };
  return { rowVars: [vars[0], vars[1]], colVars: [vars[2], vars[3]] };
}

const GROUP_COLORS = ['#e03e3e', '#2383e2', '#0f7b6c', '#9f6b00', '#8b5cf6', '#db2777', '#0891b2', '#65a30d'];

function groupIdsForIndex(idx, vars, groups) {
  if (!groups) return [];
  const bits = {};
  vars.forEach((v, i) => { bits[v] = (idx >> (vars.length - 1 - i)) & 1; });
  const ids = [];
  groups.forEach((term, gi) => {
    const matches = term.every(lit => (lit.neg ? bits[lit.name] === 0 : bits[lit.name] === 1));
    if (matches) ids.push(gi);
  });
  return ids;
}

function renderKmapBlock(blockVars, rows, groups, baseIndex, fullVars) {
  const { rowVars, colVars } = kmapAxes(blockVars);
  const rowBits = rowVars.length, colBits = colVars.length;
  const rowGray = grayCode(rowBits), colGray = grayCode(colBits);

  let html = `<table class="kmap"><tr><th class="kmap-corner">${rowVars.join('')}\\${colVars.join('')}</th>`;
  colGray.forEach(c => (html += `<th>${bitsStr(c, colBits)}</th>`));
  html += '</tr>';

  rowGray.forEach(r => {
    html += `<tr><th>${bitsStr(r, rowBits)}</th>`;
    colGray.forEach(c => {
      const full = bitsStr(r, rowBits).split('').map(Number).concat(bitsStr(c, colBits).split('').map(Number));
      const subIdx = full.reduce((acc, b) => (acc << 1) | b, 0);
      const idx = baseIndex | subIdx;
      const val = rows[idx];
      const cls = val === 1 ? 'v1' : val === 'X' ? 'vx' : 'v0';
      const ids = groupIdsForIndex(idx, fullVars, groups);
      const style = ids.length
        ? ` style="box-shadow:${ids.map((gi, j) => `inset 0 0 0 ${2 + j * 3}px ${GROUP_COLORS[gi % GROUP_COLORS.length]}`).join(',')}"`
        : '';
      html += `<td class="kmapcell ${cls}"${style}>${val}</td>`;
    });
    html += '</tr>';
  });
  return html + '</table>';
}

export function renderKmap(vars, rows, groups) {
  const n = vars.length;
  if (n <= 4) return `<div class="kmap-split">${renderKmapBlock(vars, rows, groups, 0, vars)}</div>`;

  const splitVars = vars.slice(0, n - 4);
  const blockVars = vars.slice(n - 4);
  const combos = 2 ** splitVars.length;
  let html = '<div class="kmap-split">';
  for (let c = 0; c < combos; c++) {
    const label = splitVars.map((v, i) => `${v}=${(c >> (splitVars.length - 1 - i)) & 1}`).join(', ');
    const baseIndex = c << 4;
    html += `<div class="kmap-block"><div class="kmap-block-label">${label}</div>${renderKmapBlock(blockVars, rows, groups, baseIndex, vars)}</div>`;
  }
  return html + '</div>';
}
