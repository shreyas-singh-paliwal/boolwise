import { useMemo } from 'react'
import { renderCircuitSVG } from '../lib/circuitGraph.js'
import './CircuitCanvas.css'

export default function CircuitCanvas({ nodes, outputId }) {
  const svg = useMemo(() => renderCircuitSVG(nodes, outputId), [nodes, outputId])
  return <div className="circuit-panel" dangerouslySetInnerHTML={{ __html: svg }} />
}
