
const CIRC = { colWidth: 160, rowHeight: 70, marginX: 90, marginY: 40, GW: 64, GH: 36, NW: 42, NH: 26, BR: 4.5 }

function gateHasBubble(gt) { return gt === 'NAND' || gt === 'NOR' || gt === 'NOT' }

function outPoint(n) {
  const { GW, NW, BR } = CIRC
  if (n.kind === 'INPUT' || n.kind === 'DUMMY') return { x: n.x, y: n.y }
  if (n.kind === 'GATE') {
    const tip = n.x + (n.gateType === 'NOT' ? NW : GW)
    return { x: tip + (gateHasBubble(n.gateType) ? 2 * BR : 0), y: n.y }
  }
  return { x: n.x, y: n.y }
}

function inPoints(n) {
  const { GW, GH } = CIRC
  if (n.kind === 'INPUT') return []
  if (n.kind === 'DUMMY' || n.kind === 'OUTPUT') return [{ x: n.x, y: n.y }]
  if (n.gateType === 'NOT') return [{ x: n.x, y: n.y }]
  const top = n.y - GH / 2
  return [{ x: n.x, y: top + GH * 0.26 }, { x: n.x, y: top + GH * 0.74 }]
}

function drawGateNode(n) {
  const { GW, GH, NW, NH, BR } = CIRC
  if (n.gateType === 'NOT') {
    const x = n.x, y = n.y - NH / 2, w = NW, h = NH
    let out = `<path d="M ${x} ${y} L ${x + w} ${y + h / 2} L ${x} ${y + h} Z" fill="var(--panel)" stroke="var(--accent)" stroke-width="2"/>`
    out += `<circle cx="${x + w + BR}" cy="${y + h / 2}" r="${BR}" fill="var(--circuit-bg)" stroke="var(--accent)" stroke-width="2"/>`
    return out
  }
  const x = n.x, y = n.y - GH / 2, w = GW, h = GH, r = h / 2
  const isAndFamily = n.gateType === 'AND' || n.gateType === 'NAND'
  let d
  if (isAndFamily) {
    const flat = w - r
    d = `M ${x} ${y} h ${flat} a ${r} ${r} 0 0 1 0 ${h} h ${-flat} Z`
  } else {
    d = `M ${x} ${y} Q ${x + w * 0.55} ${y} ${x + w} ${y + h / 2} Q ${x + w * 0.55} ${y + h} ${x} ${y + h} Q ${x + w * 0.2} ${y + h / 2} ${x} ${y} Z`
  }
  let out = `<path d="${d}" fill="var(--panel)" stroke="var(--accent)" stroke-width="2"/>`
  if (n.gateType === 'XOR') {
    out += `<path d="M ${x - 6} ${y} q ${w * 0.2} ${h / 2} 0 ${h}" fill="none" stroke="var(--accent)" stroke-width="2"/>`
  }
  out += `<text x="${x + w * 0.16}" y="${n.y + 4}" fill="var(--text)" font-size="10.5" font-weight="700">${n.gateType}</text>`
  if (gateHasBubble(n.gateType)) {
    out += `<circle cx="${x + w + BR}" cy="${n.y}" r="${BR}" fill="var(--circuit-bg)" stroke="var(--accent)" stroke-width="2"/>`
  }
  return out
}

function escapeHtml(t) { return t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])) }

// Build graph from tree nodes (circuits.js format) with dedup
export function treeToGraph(root, mode = 'basic') {
  const nodes = []
  let idCounter = 0
  const newId = () => 'g' + (idCounter++)
  const inputCache = new Map()
  const gateCache = new Map()
  const depthOf = {}

  function addNode(props) {
    const n = Object.assign({ id: newId(), inputs: [] }, props)
    n.depth = (n.kind === 'GATE' && n.inputs.length)
      ? Math.max(...n.inputs.map(id => depthOf[id] || 0)) + 1
      : 0
    depthOf[n.id] = n.depth
    nodes.push(n)
    return n
  }

  function getInput(name) {
    if (!inputCache.has(name)) inputCache.set(name, addNode({ kind: 'INPUT', label: name }))
    return inputCache.get(name)
  }

  function getInverter(name, gt) {
    const key = name + '|' + gt
    if (!gateCache.has(key)) {
      const src = getInput(name)
      const g = gt === 'NOT'
        ? addNode({ kind: 'GATE', gateType: 'NOT', inputs: [src.id] })
        : addNode({ kind: 'GATE', gateType: gt, inputs: [src.id, src.id] })
      gateCache.set(key, g)
    }
    return gateCache.get(key)
  }

  const memo = new Map()
  function emit(node, comp = false) {
    const key = (comp ? '!' : '') + JSON.stringify(node)
    if (memo.has(key)) return memo.get(key)

    let result
    if (node.t === 'CONST') {
      const a = getInput('A')
      const na = addNode({ kind: 'GATE', gateType: 'NOT', inputs: [a.id] })
      if (mode === 'basic') {
        result = addNode({ kind: 'GATE', gateType: comp ? 'AND' : 'OR', inputs: [a.id, na.id] })
      } else {
        const zero = addNode({ kind: 'GATE', gateType: 'XOR', inputs: [a.id, a.id] })
        result = comp ? addNode({ kind: 'GATE', gateType: 'NOT', inputs: [zero.id] }) : zero
      }
    } else if (node.t === 'VAR') {
      const raw = getInput(node.name)
      const finalComp = comp ? !node.comp : node.comp
      result = finalComp ? getInverter(node.name, mode === 'nand' ? 'NAND' : mode === 'nor' ? 'NOR' : 'NOT') : raw
    } else if (node.t === 'NOT') {
      result = emit(node.a, !comp)
    } else if (node.t === 'AND' || node.t === 'OR') {
      const a = emit(node.a, false), b = emit(node.b, false)
      if (mode === 'simplified') {
        result = addNode({ kind: 'GATE', gateType: comp ? (node.t === 'AND' ? 'NAND' : 'NOR') : node.t, inputs: [a.id, b.id] })
      } else {
        result = addNode({ kind: 'GATE', gateType: node.t, inputs: [a.id, b.id] })
        if (comp) result = addNode({ kind: 'GATE', gateType: 'NOT', inputs: [result.id] })
      }
    } else {
      // NAND/NOR/XOR
      const a = emit(node.a, false), b = emit(node.b, false)
      result = addNode({ kind: 'GATE', gateType: node.t, inputs: [a.id, b.id] })
      if (comp) result = addNode({ kind: 'GATE', gateType: 'NOT', inputs: [result.id] })
    }
    memo.set(key, result)
    return result
  }

  const rootNode = emit(root, false)
  const output = addNode({ kind: 'OUTPUT', label: 'F', inputs: [rootNode.id] })
  return { nodes, outputId: output.id }
}

export function renderCircuitSVG(nodes, outputId) {
  const map = new Map(nodes.map(n => [n.id, n]))

  // Compute layers
  nodes.forEach(n => {
    if (n.layer !== undefined) return
    if (n.kind === 'INPUT') n.layer = 0
    else n.layer = Math.max(...n.inputs.map(iid => map.get(iid).layer + 1))
  })

  // Expand long edges
  let dc = 0
  const dummies = []
  nodes.forEach(n => {
    if (!n.inputs || n.inputs.length === 0) return
    n.inputs = n.inputs.map(srcId => {
      let cur = map.get(srcId)
      while (n.layer - cur.layer > 1) {
        const d = { id: 'dum' + (dc++), kind: 'DUMMY', inputs: [cur.id], layer: cur.layer + 1 }
        dummies.push(d); map.set(d.id, d)
        cur = d
      }
      return cur.id
    })
  })
  nodes.push(...dummies)

  // Order within layers
  const byLayer = {}
  nodes.forEach(n => { (byLayer[n.layer] = byLayer[n.layer] || []).push(n) })
  Object.values(byLayer).forEach(arr => arr.forEach((n, i) => n.order = i))
  const consumers = new Map()
  nodes.forEach(n => {
    (n.inputs || []).forEach(iid => {
      if (!consumers.has(iid)) consumers.set(iid, [])
      consumers.get(iid).push(n.id)
    })
  })
  const layerKeys = Object.keys(byLayer).map(Number).sort((a, b) => a - b)
  for (let pass = 0; pass < 4; pass++) {
    const forward = pass % 2 === 0
    const order = forward ? layerKeys : layerKeys.slice().reverse()
    order.forEach(L => {
      const arr = byLayer[L]
      arr.forEach(n => {
        const refs = forward
          ? (n.inputs || []).map(iid => map.get(iid).order)
          : (consumers.get(n.id) || []).map(cid => map.get(cid).order)
        n._bary = refs.length ? refs.reduce((a, b) => a + b, 0) / refs.length : n.order
      })
      arr.sort((a, b) => a._bary - b._bary)
      arr.forEach((n, i) => n.order = i)
    })
  }

  // Assign coords
  Object.entries(byLayer).forEach(([L, arr]) => {
    arr.sort((a, b) => a.order - b.order)
    arr.forEach((n, i) => {
      n.x = CIRC.marginX + Number(L) * CIRC.colWidth
      n.y = CIRC.marginY + i * CIRC.rowHeight
    })
  })

  // Build wires
  let wireId = 0
  const wires = []
  nodes.forEach(n => {
    if (!n.inputs) return
    const pins = inPoints(n)
    n.inputs.forEach((srcId, idx) => {
      const src = map.get(srcId)
      const sp = outPoint(src)
      const dp = pins[idx] || pins[0]
      const straight = Math.abs(sp.y - dp.y) < 0.5
      const pts = straight
        ? [[sp.x, sp.y], [dp.x, sp.y]]
        : [[sp.x, sp.y], [(sp.x + dp.x) / 2, sp.y], [(sp.x + dp.x) / 2, dp.y], [dp.x, dp.y]]
      wires.push({ id: 'w' + (wireId++), points: pts, srcLayer: src.layer, netId: srcId })
    })
  })

  // Lane assignment
  const layerGroups = {}
  wires.filter(w => w.points.length === 4).forEach(w => {
    (layerGroups[w.srcLayer] = layerGroups[w.srcLayer] || []).push(w)
  })
  const junctions = []
  Object.values(layerGroups).forEach(layerWires => {
    const byNet = new Map()
    layerWires.forEach(w => {
      if (!byNet.has(w.netId)) byNet.set(w.netId, [])
      byNet.get(w.netId).push(w)
    })
    const netGroups = [...byNet.entries()].sort((a, b) => {
      const ay = Math.min(...a[1].map(w => w.points[0][1]))
      const by_ = Math.min(...b[1].map(w => w.points[0][1]))
      return ay - by_ || String(a[0]).localeCompare(String(b[0]))
    })
    const gapStart = Math.min(...layerWires.map(w => w.points[0][0]))
    const gapEnd = Math.max(...layerWires.map(w => w.points[3][0]))
    netGroups.forEach(([netId, netWires], i) => {
      const bx = gapStart + (i + 1) / (netGroups.length + 1) * (gapEnd - gapStart)
      netWires.forEach(w => { w.points[1][0] = bx; w.points[2][0] = bx })
      if (netWires.length > 1) {
        const ys = new Set()
        netWires.forEach(w => { ys.add(w.points[0][1]); ys.add(w.points[3][1]) })
        ys.forEach(y => junctions.push({ x: bx, y }))
      }
    })
  })

  // Segments for crossings
  const segs = []
  wires.forEach(w => {
    for (let i = 0; i < w.points.length - 1; i++) {
      const [x1, y1] = w.points[i], [x2, y2] = w.points[i + 1]
      if (y1 === y2) segs.push({ type: 'H', wireId: w.id, netId: w.netId, y: y1, x1: Math.min(x1, x2), x2: Math.max(x1, x2) })
      else segs.push({ type: 'V', wireId: w.id, netId: w.netId, x: x1, y1: Math.min(y1, y2), y2: Math.max(y1, y2) })
    }
  })

  function pathForWire(w) {
    let d = ''
    for (let i = 0; i < w.points.length - 1; i++) {
      const [x1, y1] = w.points[i], [x2, y2] = w.points[i + 1]
      if (d === '') d += `M ${x1} ${y1} `
      if (y1 === y2) {
        const xa = Math.min(x1, x2), xb = Math.max(x1, x2)
        const crosses = []
        segs.forEach(s => {
          if (s.netId === w.netId || s.type !== 'V') return
          if (s.x > xa + 3 && s.x < xb - 3 && y1 > s.y1 + 3 && y1 < s.y2 - 3) crosses.push(s.x)
        })
        const dir = x1 < x2 ? 1 : -1
        crosses.sort((p, q) => dir > 0 ? p - q : q - p)
        const hopR = 6
        crosses.forEach(cx => {
          const before = cx - dir * hopR, after = cx + dir * hopR
          d += `L ${before} ${y1} Q ${cx} ${y1 - 9} ${after} ${y1} `
        })
        d += `L ${x2} ${y2} `
      } else {
        d += `L ${x2} ${y2} `
      }
    }
    return d
  }

  const maxX = Math.max(...nodes.map(n => n.x)) + 140
  const maxY = Math.max(...nodes.map(n => n.y)) + 60
  let svg = `<svg viewBox="0 0 ${maxX} ${maxY}" width="100%" style="max-width:1000px;">`

  wires.forEach(w => { svg += `<path d="${pathForWire(w)}" fill="none" stroke="var(--wire)" stroke-width="1.6"/>` })
  junctions.forEach(j => { svg += `<circle cx="${j.x}" cy="${j.y}" r="2.6" fill="var(--wire)"/>` })

  nodes.forEach(n => {
    if (n.kind === 'GATE' || n.kind === 'OUTPUT') {
      inPoints(n).forEach(p => { svg += `<circle cx="${p.x}" cy="${p.y}" r="2" fill="var(--wire)"/>` })
    }
  })

  nodes.forEach(n => {
    if (n.kind === 'INPUT') {
      svg += `<text x="${n.x - 10}" y="${n.y + 4}" fill="var(--text)" font-size="13" text-anchor="end" font-weight="600">${escapeHtml(n.label)}</text>`
      svg += `<circle cx="${n.x}" cy="${n.y}" r="2.5" fill="var(--accent)"/>`
    } else if (n.kind === 'OUTPUT') {
      svg += `<text x="${n.x + 10}" y="${n.y + 4}" fill="var(--accent)" font-size="14" font-weight="700">${escapeHtml(n.label || 'F')}</text>`
    } else if (n.kind === 'GATE') {
      svg += drawGateNode(n)
    }
  })

  svg += `</svg>`
  return svg
}
