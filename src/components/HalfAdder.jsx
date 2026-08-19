import { CircuitCanvas } from '../../components/CircuitCanvas/CircuitCanvas.jsx'
import './HalfAdder.css'

const nodes = [
  { id: 'A', kind: 'INPUT', label: 'A', layer: 0, order: 0 },
  { id: 'B', kind: 'INPUT', label: 'B', layer: 0, order: 1 },
  { id: 'xor1', kind: 'GATE', gateType: 'XOR', inputs: ['A', 'B'], layer: 1, order: 0 },
  { id: 'and1', kind: 'GATE', gateType: 'AND', inputs: ['A', 'B'], layer: 1, order: 1 },
  { id: 'S', kind: 'OUTPUT', label: 'Sum', inputs: ['xor1'], layer: 2, order: 0 },
  { id: 'C', kind: 'OUTPUT', label: 'Carry', inputs: ['and1'], layer: 2, order: 1 }
]

export function HalfAdder() {
  return (
    <div className="arith-page">
      <h2>Half Adder</h2>
      <div className="arith-grid">
        <section className="card">
          <div className="card-header"><h3>Truth Table</h3></div>
          <div className="card-body">
            <table>
              <thead><tr><th>A</th><th>B</th><th>Sum</th><th>Carry</th></tr></thead>
              <tbody>
                <tr><td>0</td><td>0</td><td className="v0">0</td><td className="v0">0</td></tr>
                <tr><td>0</td><td>1</td><td className="v1">1</td><td className="v0">0</td></tr>
                <tr><td>1</td><td>0</td><td className="v1">1</td><td className="v0">0</td></tr>
                <tr><td>1</td><td>1</td><td className="v0">0</td><td className="v1">1</td></tr>
              </tbody>
            </table>
          </div>
        </section>
        <section className="card">
          <div className="card-header"><h3>Circuit</h3></div>
          <div className="card-body">
            <CircuitCanvas nodes={nodes} outputId="S" />
          </div>
        </section>
      </div>
      <section className="card expr-card">
        <div className="card-header"><h3>Boolean Expressions</h3></div>
        <div className="card-body">
          <div className="expr-row"><span className="expr-label">Sum</span><code className="expr">A ⊕ B</code></div>
          <div className="expr-row"><span className="expr-label">Carry</span><code className="expr">A · B</code></div>
        </div>
      </section>
    </div>
  )
}
