// src/components/LeftPanel.jsx

import { useState } from 'react'

export default function LeftPanel({ onNew, onAutoStep, onAutoRun, onReveal, isRunning }) {
  const [rows, setRows] = useState(5)
  const [cols, setCols] = useState(5)

  return (
    <div className="panel">
      <div className="panel-title">Environment Config</div>

      <div className="form-group">
        <label>Grid Rows (3–10)</label>
        <input
          type="number" min={3} max={10} value={rows}
          onChange={e => setRows(Math.min(10, Math.max(3, +e.target.value)))}
        />
      </div>

      <div className="form-group">
        <label>Grid Columns (3–10)</label>
        <input
          type="number" min={3} max={10} value={cols}
          onChange={e => setCols(Math.min(10, Math.max(3, +e.target.value)))}
        />
      </div>

      <button className="btn"       onClick={() => onNew(rows, cols)}>⚡ INITIALIZE AGENT</button>
      <button className="btn warn"  onClick={onAutoStep}>▶ AUTO STEP</button>
      <button className="btn gold"  onClick={onAutoRun}>
        {isRunning ? '⏹ STOP RUN' : '⚡⚡ AUTO RUN'}
      </button>
      <button className="btn danger" onClick={onReveal}>👁 REVEAL TRUTH</button>

      <hr className="divider" />

      <div className="panel-title">Legend</div>
      <div className="legend">
        <div className="legend-item"><div className="legend-dot ld-agent"  /> Agent (current position)</div>
        <div className="legend-item"><div className="legend-dot ld-safe"   /> Safe — KB proved ¬P ∧ ¬W</div>
        <div className="legend-item"><div className="legend-dot ld-visited"/> Visited (explored)</div>
        <div className="legend-item"><div className="legend-dot ld-unknown"/> Unknown (unvisited)</div>
        <div className="legend-item"><div className="legend-dot ld-danger" /> Confirmed Danger</div>
      </div>

      <hr className="divider" />

      <div className="panel-title">Knowledge Base Rules</div>
      <div className="kb-rules">
        <div className="rule-head">Breeze biconditional:</div>
        <div>B(r,c) ⟺ ⋁ P(neighbors)</div>
        <div className="rule-head">Stench biconditional:</div>
        <div>S(r,c) ⟺ ⋁ W(neighbors)</div>
        <div className="rule-head">Safety query (CNF):</div>
        <div>Prove ¬P(r,c) ∧ ¬W(r,c)</div>
        <div>via Resolution Refutation</div>
      </div>
    </div>
  )
}
