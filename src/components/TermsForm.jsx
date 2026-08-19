import './FormControls.css';

export default function TermsForm({ kind, onKindChange, terms, onTermsChange, dc, onDcChange, error }) {
  const label = kind === 'minterms' ? "Minterm indices — Σm(" : 'Maxterm indices — ΠM(';
  return (
    <div>
      <fieldset className="term-kind">
        <label>
          <input type="radio" name="termKind" checked={kind === 'minterms'} onChange={() => onKindChange('minterms')} />
          Minterms
        </label>
        <label>
          <input type="radio" name="termKind" checked={kind === 'maxterms'} onChange={() => onKindChange('maxterms')} />
          Maxterms
        </label>
      </fieldset>
      <div className="field">
        <label htmlFor="termsInput">{label}</label>
        <input type="text" id="termsInput" placeholder="1, 3, 7" value={terms} onChange={e => onTermsChange(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="dcInput">Don&apos;t-care indices — d(</label>
        <input type="text" id="dcInput" placeholder="0, 2" value={dc} onChange={e => onDcChange(e.target.value)} />
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
