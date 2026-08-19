import './TruthTableView.css';

/** vars: string[], rows: (0|1|'X')[] — read-only display, optionally with extra output columns. */
export default function TruthTableView({ vars, rows, extraColumns, primaryLabel = 'F' }) {
  // extraColumns (optional): [{ name, rows }] — draws additional output columns
  // alongside the primary one, e.g. for showing Sum + Cout together.
  return (
    <div className="scroll-x">
      <table className="tt">
        <thead>
          <tr>
            {vars.map(v => <th key={v}>{v}</th>)}
            <th>{primaryLabel}</th>
            {extraColumns?.map(c => <th key={c.name}>{c.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((out, i) => {
            const bits = vars.map((_, idx) => (i >> (vars.length - 1 - idx)) & 1);
            const cls = out === 1 ? 'v1' : out === 'X' ? 'vx' : 'v0';
            return (
              <tr key={i}>
                {bits.map((b, bi) => <td key={bi}>{b}</td>)}
                <td className={cls}>{out}</td>
                {extraColumns?.map(c => {
                  const v = c.rows[i];
                  const ccls = v === 1 ? 'v1' : v === 'X' ? 'vx' : 'v0';
                  return <td key={c.name} className={ccls}>{v}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
