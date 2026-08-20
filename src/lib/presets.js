/* presets.js — built-in multi-output circuits (adders, subtractors, multiplier).
   Each preset returns { id, title, inputs: ['A','B',...], outputs: [{name, rows}] }
   where `rows` is a normal single-output truth table (same shape parser.js
   produces), one per output bit — the rest of the pipeline (qm/circuits/
   render/verify) is reused unchanged, once per output. */
function truthTableFor(inputs, fn) {
  const n = inputs.length;
  const table = []; // table[i] = {A:bit,...}
  for (let i = 0; i < 2 ** n; i++) {
    const env = {};
    inputs.forEach((name, idx) => { env[name] = (i >> (n - 1 - idx)) & 1; });
    table.push(env);
  }
  return table;
}

function buildOutput(inputs, table, evalFn) {
  return table.map(env => evalFn(env));
}

const nodesHA = [
  { id: 'A', kind: 'INPUT', label: 'A', layer: 0, order: 0 },
  { id: 'B', kind: 'INPUT', label: 'B', layer: 0, order: 1 },
  { id: 'xor1', kind: 'GATE', gateType: 'XOR', inputs: ['A', 'B'], layer: 1, order: 0 },
  { id: 'and1', kind: 'GATE', gateType: 'AND', inputs: ['A', 'B'], layer: 1, order: 1 },
  { id: 'S', kind: 'OUTPUT', label: 'Sum', inputs: ['xor1'], layer: 2, order: 0 },
  { id: 'C', kind: 'OUTPUT', label: 'Carry', inputs: ['and1'], layer: 2, order: 1 }
]

const nodesFA = [
  { id: 'A', kind: 'INPUT', label: 'A', layer: 0, order: 0 },
  { id: 'B', kind: 'INPUT', label: 'B', layer: 0, order: 1 },
  { id: 'Cin', kind: 'INPUT', label: 'Cin', layer: 0, order: 2 },
  { id: 'xor1', kind: 'GATE', gateType: 'XOR', inputs: ['A', 'B'], layer: 1, order: 0 },
  { id: 'xor2', kind: 'GATE', gateType: 'XOR', inputs: ['xor1', 'Cin'], layer: 2, order: 0 },
  { id: 'and1', kind: 'GATE', gateType: 'AND', inputs: ['A', 'B'], layer: 1, order: 1 },
  { id: 'and2', kind: 'GATE', gateType: 'AND', inputs: ['Cin', 'xor1'], layer: 2, order: 1 },
  { id: 'or1', kind: 'GATE', gateType: 'OR', inputs: ['and1', 'and2'], layer: 3, order: 0 },
  { id: 'S', kind: 'OUTPUT', label: 'Sum', inputs: ['xor2'], layer: 4, order: 0 },
  { id: 'Cout', kind: 'OUTPUT', label: 'Cout', inputs: ['or1'], layer: 4, order: 1 }
]

const nodesM = [
  { id: 'A0', kind: 'INPUT', label: 'A0', layer: 0, order: 0 },
  { id: 'A1', kind: 'INPUT', label: 'A1', layer: 0, order: 1 },
  { id: 'B0', kind: 'INPUT', label: 'B0', layer: 0, order: 2 },
  { id: 'B1', kind: 'INPUT', label: 'B1', layer: 0, order: 3 },
  { id: 'and0', kind: 'GATE', gateType: 'AND', inputs: ['A0', 'B0'], layer: 1, order: 0 },
  { id: 'and1', kind: 'GATE', gateType: 'AND', inputs: ['A1', 'B0'], layer: 1, order: 1 },
  { id: 'and2', kind: 'GATE', gateType: 'AND', inputs: ['A0', 'B1'], layer: 1, order: 2 },
  { id: 'and3', kind: 'GATE', gateType: 'AND', inputs: ['A1', 'B1'], layer: 1, order: 3 },
  { id: 'xor1', kind: 'GATE', gateType: 'XOR', inputs: ['and1', 'and2'], layer: 2, order: 0 },
  { id: 'and4', kind: 'GATE', gateType: 'AND', inputs: ['and1', 'and2'], layer: 2, order: 1 },
  { id: 'xor2', kind: 'GATE', gateType: 'XOR', inputs: ['and4', 'and3'], layer: 3, order: 0 },
  { id: 'and5', kind: 'GATE', gateType: 'AND', inputs: ['and4', 'and3'], layer: 3, order: 1 },
  { id: 'P0', kind: 'OUTPUT', label: 'P0', inputs: ['and0'], layer: 4, order: 0 },
  { id: 'P1', kind: 'OUTPUT', label: 'P1', inputs: ['xor1'], layer: 4, order: 1 },
  { id: 'P2', kind: 'OUTPUT', label: 'P2', inputs: ['xor2'], layer: 4, order: 2 },
  { id: 'P3', kind: 'OUTPUT', label: 'P3', inputs: ['and5'], layer: 4, order: 3 }
]

const nodesHS = [
  { id: 'A', kind: 'INPUT', label: 'A', layer: 0, order: 0 },
  { id: 'B', kind: 'INPUT', label: 'B', layer: 0, order: 1 },

  { id: 'xor1', kind: 'GATE', gateType: 'XOR', inputs: ['A', 'B'], layer: 1, order: 0 },

  { id: 'not1', kind: 'GATE', gateType: 'NOT', inputs: ['A'], layer: 1, order: 1 },
  { id: 'and1', kind: 'GATE', gateType: 'AND', inputs: ['not1', 'B'], layer: 2, order: 0 },

  { id: 'D', kind: 'OUTPUT', label: 'Diff', inputs: ['xor1'], layer: 3, order: 0 },
  { id: 'Bout', kind: 'OUTPUT', label: 'Bout', inputs: ['and1'], layer: 3, order: 1 }
];

const nodesFS = [
  { id: 'A', kind: 'INPUT', label: 'A', layer: 0, order: 0 },
  { id: 'B', kind: 'INPUT', label: 'B', layer: 0, order: 1 },
  { id: 'Bin', kind: 'INPUT', label: 'Bin', layer: 0, order: 2 },
  { id: 'xor1', kind: 'GATE', gateType: 'XOR', inputs: ['A', 'B'], layer: 1, order: 0 },
  { id: 'xor2', kind: 'GATE', gateType: 'XOR', inputs: ['xor1', 'Bin'], layer: 2, order: 0 },
  { id: 'not1', kind: 'GATE', gateType: 'NOT', inputs: ['A'], layer: 1, order: 1 },
  { id: 'and1', kind: 'GATE', gateType: 'AND', inputs: ['not1', 'B'], layer: 2, order: 1 },
  { id: 'not2', kind: 'GATE', gateType: 'NOT', inputs: ['xor1'], layer: 2, order: 2 },
  { id: 'and2', kind: 'GATE', gateType: 'AND', inputs: ['Bin', 'not2'], layer: 3, order: 0 },
  { id: 'or1', kind: 'GATE', gateType: 'OR', inputs: ['and1', 'and2'], layer: 4, order: 0 },
  { id: 'D', kind: 'OUTPUT', label: 'Diff', inputs: ['xor2'], layer: 5, order: 0 },
  { id: 'Bout', kind: 'OUTPUT', label: 'Bout', inputs: ['or1'], layer: 5, order: 1 }
]

export function halfAdder() {
  const inputs = ['A', 'B'];
  const table = truthTableFor(inputs, () => {});
  return {
    id: 'half-adder', title: 'Half Adder', inputs,
    outputs: [
      { name: 'Sum', rows: buildOutput(inputs, table, e => e.A ^ e.B) },
      { name: 'Cout', rows: buildOutput(inputs, table, e => e.A & e.B) },
    ],
    nodes: nodesHA,
  };
}

export function fullAdder() {
  const inputs = ['A', 'B', 'Cin'];
  const table = truthTableFor(inputs, () => {});
  return {
    id: 'full-adder', title: 'Full Adder', inputs,
    outputs: [
      { name: 'Sum', rows: buildOutput(inputs, table, e => e.A ^ e.B ^ e.Cin) },
      { name: 'Cout', rows: buildOutput(inputs, table, e => (e.A & e.B) | (e.Cin & (e.A ^ e.B))) },
    ],
    nodes: nodesFA,
  };
}

export function halfSubtractor() {
  const inputs = ['A', 'B'];
  const table = truthTableFor(inputs, () => {});
  return {
    id: 'half-subtractor', title: 'Half Subtractor', inputs,
    outputs: [
      { name: 'Diff', rows: buildOutput(inputs, table, e => e.A ^ e.B) },
      { name: 'Borrow', rows: buildOutput(inputs, table, e => (1 - e.A) & e.B) },
    ],
    nodes: nodesHS,
  };
}

export function fullSubtractor() {
  const inputs = ['A', 'B', 'Bin'];
  const table = truthTableFor(inputs, () => {});
  return {
    id: 'full-subtractor', title: 'Full Subtractor', inputs,
    outputs: [
      { name: 'Diff', rows: buildOutput(inputs, table, e => e.A ^ e.B ^ e.Bin) },
      {
        name: 'Bout',
        rows: buildOutput(inputs, table, e => ((1 - e.A) & e.B) | ((1 - e.A) & e.Bin) | (e.B & e.Bin)),
      },
    ],
    nodes: nodesFS,
  };
}

/** 2-bit x 2-bit binary multiplier: A = A1A0, B = B1B0, Product P3P2P1P0 = A*B. */
export function multiplier2x2() {
  const inputs = ['A1', 'A0', 'B1', 'B0'];
  const table = truthTableFor(inputs, () => {});
  const product = env => {
    const a = (env.A1 << 1) | env.A0;
    const b = (env.B1 << 1) | env.B0;
    return a * b; // 0..9, fits in 4 bits
  };
  return {
    id: 'multiplier', title: '2-bit × 2-bit Multiplier', inputs,
    outputs: [0, 1, 2, 3].map(bit => ({
      name: `P${bit}`,
      rows: buildOutput(inputs, table, e => (product(e) >> bit) & 1),
    })),
    nodes: nodesM,
  };
}

export const ALL_PRESETS = [halfAdder, fullAdder, halfSubtractor,fullSubtractor, multiplier2x2];
