// src/components/Header.jsx

export default function Header({ inferenceSteps, visitedCount, alive, won, gameId }) {
  const status = !gameId ? 'SETUP' : !alive ? 'DEAD' : won ? 'WON' : 'ACTIVE'

  return (
    <header>
      <div>
        <div className="logo">WUMPUS <span>LOGIC</span> AGENT</div>
        <div className="subtitle">
          Knowledge-Based Pathfinding &nbsp;·&nbsp; Propositional Resolution Refutation
        </div>
      </div>
      <div className="status-bar">
        <div className="stat">
          <span className="stat-label">Inference Steps</span>
          <span className="stat-val">{inferenceSteps}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Cells Visited</span>
          <span className="stat-val">{visitedCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Status</span>
          <span className="stat-val">{status}</span>
        </div>
      </div>
    </header>
  )
}
