import { useMemo, useState } from 'react';
import TabBar from '../components/TabBar';
import TruthTableView from '../components/TruthTableView';
import ResultsPanel from '../components/ResultsPanel';
import CircuitCanvas from '../components/CircuitCanvas';
import { ALL_PRESETS } from '../lib/presets';
import './CircuitLibraryPage.css';

export default function CircuitLibraryPage() {
  // Presets are recomputed once (they don't depend on any input state).
  const presets = useMemo(() => ALL_PRESETS.map(fn => fn()), []);
  const [activeId, setActiveId] = useState(presets[0].id);
  const preset = presets.find(p => p.id === activeId);

  const tabs = presets.map(p => ({ id: p.id, label: p.title }));
  

  return (
    <div style={{paddingBottom: '10px'}}>
      <section className="card intro-card">
        <TabBar tabs={tabs} active={activeId} onChange={setActiveId} />
        <p className="hint">
          Inputs: {preset.inputs.join(', ')}. Every output bit below is minimized and built into
          AND/OR/NOT, NAND-only, and NOR-only circuits independently, then verified the same way
          as the main minimizer.
        </p>
      </section>

      <section className="card">
        <h2 className="combined-title">{preset.title} — combined truth table</h2>
        <TruthTableView
          vars={preset.inputs}
          rows={preset.outputs[0].rows}
          extraColumns={preset.outputs.slice(1)}
          primaryLabel={preset.outputs[0].name}
        />
        <p className="hint combined-note">
          
        </p>
      </section>
      
      {/* {preset.outputs.map(out => (
        <ResultsPanel
          key={out.name}
          vars={preset.inputs}
          rows={out.rows}
          title={`Output: ${out.name}`}
          compact
        />
      ))} */}
      <h3>Circuit Implementation</h3>
      <CircuitCanvas nodes={preset.nodes} />
      {
        activeId === 'half-adder' &&
        (
          <section className="card">
            <h3>Expression</h3>
            <div className="two-col">
              <div><h4>Sum</h4><div className="expr-box">S = A ⊕ B</div></div>
              <div><h4>Carry-out</h4><div className="expr-box">Cout = A·B</div></div>
            </div>
          </section>
        )
      }
      {
        activeId === 'full-adder' &&
        (
          <section className="card">
            <h3>Expression</h3>
            <div className="two-col">
              <div><h4>Sum</h4><div className="expr-box">S = A ⊕ B ⊕ Cin</div></div>
              <div><h4>Carry-out</h4><div className="expr-box">Cout = (A · B) + (Cin · (A ⊕ B))</div></div>
            </div>
          </section>
        )
      }
      {
        activeId === 'full-subtractor' &&
        (
          <section className="card">
            <h3>Expression</h3>
            <div className="two-col">
              <div><h4>Difference</h4><div className="expr-box">Diff = A ⊕ B ⊕ Bin</div></div>
              <div><h4>Borrow-out</h4><div className="expr-box">Bout = (A' · B) + (Bin · (A ⊕ B)')</div></div>
            </div>
          </section>
        )
      }
      {
        activeId === 'multiplier' &&
        (
          <section className="card">
            <h3>Expression</h3>
            <div className="two-col">
              <div><h4>P0</h4><div className="expr-box">P0 = A0 · B0</div></div>
              <div><h4>P1</h4><div className="expr-box">P1 = (A1 · B0) ⊕ (A0 · B1)</div></div>
              <div><h4>P2</h4><div className="expr-box">P2 = (A1 · B1) ⊕ ((A1 · B0) · (A0 · B1))</div></div>
              <div><h4>P3</h4><div className="expr-box">P3 = (A1 · B1) · ((A1 · B0) · (A0 · B1))</div></div>
            </div>
          </section>
        )
      }
    </div>
  );
}
