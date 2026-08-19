import './FormControls.css';

export default function ExpressionForm({ value, onChange, error }) {
  return (
    <div>
      <div className="field">
        <label htmlFor="exprInput">Boolean expression</label>
        <input
          type="text"
          id="exprInput"
          placeholder="e.g. A'B + AC' + BC"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
      <p className="hint">
        Variables A–F. NOT: <code>!A</code> or <code>A'</code>. AND: <code>AB</code> or{' '}
        <code>A.B</code>. OR: <code>A+B</code>. XOR: <code>A^B</code>. Parentheses allowed.
      </p>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
