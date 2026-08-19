import { useMemo } from 'react';
import { renderCircuitSVG } from '../lib/render';
import './CircuitDiagram.css';

/** tree: netlist tree from lib/circuits.js. Markup is generated purely from that
 *  data (no user HTML), so dangerouslySetInnerHTML is safe. */
export default function CircuitDiagram({ tree }) {
  const html = useMemo(() => renderCircuitSVG(tree), [tree]);
  return <div className="scroll-x circuit-diagram" dangerouslySetInnerHTML={{ __html: html }} />;
}
