import { useMemo } from 'react';
import { renderKmap } from '../lib/kmap';
import './KmapView.css';

/** vars, rows, groups (optional literal terms to highlight) — markup is generated
 *  by lib/kmap.js from pure data (no user HTML), so dangerouslySetInnerHTML is safe. */
export default function KmapView({ vars, rows, groups }) {
  const html = useMemo(() => renderKmap(vars, rows, groups), [vars, rows, groups]);
  return <div className="scroll-x" dangerouslySetInnerHTML={{ __html: html }} />;
}
