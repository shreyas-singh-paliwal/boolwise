import { useMemo } from 'react';
import { minimize } from '../lib/qm';
import { buildBasicTree, toNand, toNor, countGates } from '../lib/circuits';
import { verifyAll } from '../lib/verify';
import TruthTableView from './TruthTableView';
import KmapView from './KmapView';
import CircuitDiagram from './CircuitDiagram';
import './ResultsPanel.css';

function litsToString(lits) {
  return lits.length ? lits.map(l => l.name + (l.neg ? "'" : '')).join('') : '1';
}
function litsToSum(lits) {
  return lits.length ? '(' + lits.map(l => l.name + (l.neg ? "'" : '')).join(' + ') + ')' : '';
}

/**
 * vars: string[], rows: (0|1|'X')[] — a single-output truth table.
 * title (optional): heading shown above this block (used when several of these
 * are stacked on the Circuit Library page, one per output bit).
 * compact (optional): hides K-map + canonical-terms sections, for denser pages.
 */
export default function ResultsPanel({ vars, rows, title, compact = false }) {
  const min = useMemo(() => minimize(rows, vars), [rows, vars]);
  const basicTree = useMemo(() => buildBasicTree(min.sopTerms), [min]);
  const nandTree = useMemo(() => toNand(basicTree), [basicTree]);
  const norTree = useMemo(() => toNor(basicTree), [basicTree]);
  const verification = useMemo(() => verifyAll(vars, rows, basicTree, nandTree, norTree), [vars, rows, basicTree, nandTree, norTree]);

  const sopText = min.sopTerms.length
    ? min.sopTerms.map(litsToString).join(' + ')
    : rows.every(r => r !== 1) ? '0' : '1';
  const posText = min.posTerms.length
    ? min.posTerms.map(litsToSum).join('')
    : rows.every(r => r !== 0) ? '1' : '0';

  const ones = [], zeros = [], dc = [];
  rows.forEach((v, i) => (v === 1 ? ones : v === 0 ? zeros : dc).push(i));
  const dcSuffix = dc.length ? ` + d(${dc.join(', ')})` : '';

  return (
    <section className="results-panel">
      {title && <h2 className="output-title">{title}</h2>}

      <div className={`verify-badge ${verification.ok ? 'ok' : 'bad'}`}>
        {verification.ok
          ? `✓ Verified — all ${verification.checked} input combinations agree across the original function, simplified SOP, NAND-only, and NOR-only circuits.`
          : `✗ Mismatch found on ${verification.mismatches.length} of ${verification.checked} input rows.`}
      </div>

      <section className="card">
        <h3>Minimized Forms</h3>
        <div className="two-col">
          <div><h4>SOP</h4><div className="expr-box">F = {sopText}</div></div>
          <div><h4>POS</h4><div className="expr-box">F = {posText}</div></div>
        </div>
      </section>

      {!compact && (
        <section className="card">
          <h3>Canonical Terms</h3>
          <div className="two-col">
            <div><h4>Minterm form</h4><div className="expr-box">F = Σm({ones.join(', ')}){dcSuffix}</div></div>
            <div><h4>Maxterm form</h4><div className="expr-box">F = ΠM({zeros.join(', ')}){dcSuffix}</div></div>
          </div>
        </section>
      )}

      <div className="split-row">
        <section className="card">
          <h3>Truth Table</h3>
          <TruthTableView vars={vars} rows={rows} />
        </section>
        {!compact && (
          <section className="card">
            <h3>Karnaugh Map</h3>
            <KmapView vars={vars} rows={rows} groups={min.sopTerms} />
          </section>
        )}
      </div>

      <section className="card">
        <h3>AND / OR / NOT Circuit</h3>
        <CircuitDiagram tree={basicTree} />
      </section>
      <section className="card">
        <h3>NAND-only Circuit</h3>
        <CircuitDiagram tree={nandTree} />
      </section>
      <section className="card">
        <h3>NOR-only Circuit</h3>
        <CircuitDiagram tree={norTree} />
      </section>
      <p className="hint">
        AND/OR/NOT: {countGates(basicTree)} gates · NAND-only: {countGates(nandTree)} gates · NOR-only: {countGates(norTree)} gates
      </p>
    </section>
  );
}
