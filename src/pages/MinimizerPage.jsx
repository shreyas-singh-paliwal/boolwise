import { useState } from 'react';
import TabBar from '../components/TabBar';
import EditableTruthTable from '../components/EditableTruthTable';
import ExpressionForm from '../components/ExpressionForm';
import TermsForm from '../components/TermsForm';
import ResultsPanel from '../components/ResultsPanel';
import { truthFromExpression, truthFromTerms } from '../lib/parser';
import './MinimizerPage.css';

const MODES = [
  { id: 'truth', label: 'Truth Table' },
  { id: 'expr', label: 'Expression' },
  { id: 'terms', label: 'Minterms / Maxterms' },
];

function blankTruth(n) {
  return { vars: 'ABCDEF'.split('').slice(0, n), rows: new Array(2 ** n).fill(0) };
}

export default function MinimizerPage() {
  const [mode, setMode] = useState('expr');
  const [numVars, setNumVars] = useState(2);
  const [truth, setTruth] = useState(() => blankTruth(2));
  const [exprValue, setExprValue] = useState('');
  const [exprError, setExprError] = useState('');
  const [termsKind, setTermsKind] = useState('minterms');
  const [termsValue, setTermsValue] = useState('');
  const [dcValue, setDcValue] = useState('');
  const [termsError, setTermsError] = useState('');
  const [result, setResult] = useState(null); // {vars, rows} committed by "Minimize & Build Circuits"

  function handleVarCountChange(n) {
    setNumVars(n);
    setTruth(blankTruth(n));
  }
  function toggleCell(i) {
    setTruth(t => {
      const rows = t.rows.slice();
      const cur = rows[i];
      rows[i] = cur === 0 ? 1 : cur === 1 ? 'X' : 0;
      return { ...t, rows };
    });
  }

  function generate() {
    setExprError('');
    setTermsError('');
    if (mode === 'expr') {
      try {
        const r = truthFromExpression(exprValue, 0);
        setTruth(r);
        setNumVars(r.vars.length);
        setResult(r);
      } catch (e) {
        setExprError(e.message);
      }
      return;
    }
    if (mode === 'terms') {
      try {
        const r = truthFromTerms(termsKind, termsValue, dcValue, numVars);
        setTruth({ vars: r.vars, rows: r.rows });
        setNumVars(r.vars.length);
        setResult({ vars: r.vars, rows: r.rows });
      } catch (e) {
        setTermsError(e.message);
      }
      return;
    }
    setResult({ vars: truth.vars, rows: truth.rows });
  }

  return (
    <div>
      <section className="card">
        <TabBar tabs={MODES} active={mode} onChange={setMode} />

        <div className="field">
          <label htmlFor="numVars">Number of variables</label>
          <select id="numVars" value={numVars} onChange={e => handleVarCountChange(Number(e.target.value))}>
            {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {mode === 'expr' && <ExpressionForm value={exprValue} onChange={setExprValue} error={exprError} />}
        
        {mode === 'truth' && (
          <div>
            <p className="hint">Click a cell in the Out column to cycle 0 → 1 → X (don&apos;t care).</p>
            <EditableTruthTable vars={truth.vars} rows={truth.rows} onToggle={toggleCell} />
          </div>
        )}
        {mode === 'terms' && (
          <TermsForm
            kind={termsKind} onKindChange={setTermsKind}
            terms={termsValue} onTermsChange={setTermsValue}
            dc={dcValue} onDcChange={setDcValue}
            error={termsError}
          />
        )}

        <button className="primary" onClick={generate}>Minimize &amp; Build Circuits</button>
      </section>

      {result && <ResultsPanel vars={result.vars} rows={result.rows} />}
    </div>
  );
}
