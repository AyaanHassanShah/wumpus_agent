// src/components/Grid.jsx

const ICONS = {
  agent:   '🤖',
  danger:  '💥',
  safe:    '✓',
  visited: '',
  unknown: '?',
}

function TruthOverlay({ truth, rows, cols, cellStates }) {
  // Returns a map of "r,c" → truth icon to overlay
  if (!truth) return {}
  const overlay = {}
  for (const [r, c] of truth.pits)    overlay[`${r},${c}`] = '🕳️'
  if (truth.wumpus) {
    const [r, c] = truth.wumpus;       overlay[`${r},${c}`] = '👹'
  }
  const [gr, gc] = truth.gold;         overlay[`${gr},${gc}`] = '🏆'
  return overlay
}

export default function Grid({ rows, cols, cellStates, alive, won, onMove, truth }) {
  if (!rows || !cols) return null

  const overlay   = TruthOverlay({ truth, rows, cols, cellStates })
  const showEnd   = !alive || won
  const endText   = !alive ? 'AGENT DEAD 💀' : 'GOLD FOUND! 🏆'
  const endCls    = !alive ? 'lose' : 'win'

  return (
    <div id="grid-container">
      <div
        id="grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 62px)` }}
      >
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const key    = `${r},${c}`
            const status = cellStates[key] ?? 'unknown'
            const icon   = overlay[key] ?? ICONS[status] ?? '?'

            return (
              <div
                key={key}
                className={`cell ${status}${overlay[key] && status !== 'agent' ? ' danger' : ''}`}
                onClick={() => onMove(r, c)}
              >
                <div className="cell-icon">{icon}</div>
                <div className="cell-coord">{r},{c}</div>
              </div>
            )
          })
        )}
      </div>

      {showEnd && (
        <div id="overlay-msg" className={`show ${endCls} pulsing`}>
          {endText}
        </div>
      )}
    </div>
  )
}
