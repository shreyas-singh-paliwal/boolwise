import './TruthTableView.css';

/** vars: string[], rows: (0|1|'X')[], onToggle(index) */
export default function EditableTruthTable({ vars, rows, onToggle }) {
  return (
    <div className="scroll-x">
      <table className="tt">
        <thead>
          <tr>
            {vars.map(v => <th key={v}>{v}</th>)}
            <th>Out</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((out, i) => {
            const bits = vars.map((_, idx) => (i >> (vars.length - 1 - idx)) & 1);
            const cls = out === 1 ? 'v1' : out === 'X' ? 'vx' : 'v0';
            return (
              <tr key={i}>
                {bits.map((b, bi) => <td key={bi}>{b}</td>)}
                <td className={`outcell ${cls}`} onClick={() => onToggle(i)}>{out}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
