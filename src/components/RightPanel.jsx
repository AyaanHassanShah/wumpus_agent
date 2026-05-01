// src/components/RightPanel.jsx

function PerceptBadges({ percepts }) {
  if (!percepts || percepts.length === 0)
    return <div className="badge none">NONE</div>
  return percepts.map(p => (
    <div key={p} className={`badge ${p.toLowerCase()}`}>{p.toUpperCase()}</div>
  ))
}

export default function RightPanel({
  percepts, inferenceSteps, lastSteps, visitedCount, agent, logEntries, kbLog
}) {
  return (
    <div className="panel">
      <div className="panel-title">Current Percepts</div>
      <div className="percept-badges">
        <PerceptBadges percepts={percepts} />
      </div>

      <hr className="divider" />

      <div className="panel-title">Metrics Dashboard</div>
      <div className="metrics-grid">
        <div className="metric-box">
          <span className="stat-label">Total Inferences</span>
          <span className="stat-val">{inferenceSteps}</span>
        </div>
        <div className="metric-box">
          <span className="stat-label">Last Query Steps</span>
          <span className="stat-val">{lastSteps}</span>
        </div>
        <div className="metric-box">
          <span className="stat-label">Cells Visited</span>
          <span className="stat-val">{visitedCount}</span>
        </div>
        <div className="metric-box">
          <span className="stat-label">Agent Position</span>
          <span className="stat-val">{JSON.stringify(agent)}</span>
        </div>
      </div>

      <hr className="divider" />

      <div className="panel-title">Resolution Log</div>
      <div id="log">
        {logEntries.length === 0
          ? <span style={{ color: 'var(--dim)' }}>Awaiting KB queries…</span>
          : logEntries.map((entry, i) => (
              <div key={i} className={`entry ${entry.cls}`}>› {entry.text}</div>
            ))
        }
      </div>

      <hr className="divider" />

      <div className="panel-title">Last KB Proof Trace</div>
      <div className="kb-proof">
        {kbLog && kbLog.length > 0
          ? kbLog.map((line, i) => <div key={i}>{line}</div>)
          : 'No proof run yet.'
        }
      </div>
    </div>
  )
}
