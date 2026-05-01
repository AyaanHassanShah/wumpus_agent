// src/App.jsx

import { useCallback, useState } from 'react'
import { useGame } from './hooks/useGame'
import Header      from './components/Header'
import LeftPanel   from './components/LeftPanel'
import Grid        from './components/Grid'
import RightPanel  from './components/RightPanel'
import MessageBox  from './components/MessageBox'

export default function App() {
  const {
    state, isRunning,
    newGame, moveToCell, autoStep,
    startAutoRun, stopRun, revealTruth,
  } = useGame()

  const [running, setRunning] = useState(false)

  const handleNew       = (r, c) => { setRunning(false); newGame(r, c) }

  const handleAutoStep  = () =>
    autoStep(state.gameId, state.logEntries)

  const handleAutoRun   = () => {
    if (running) { stopRun(); setRunning(false); return }
    const started = startAutoRun(state.gameId, () => state.logEntries)
    setRunning(started)
  }

  const handleMove = useCallback((r, c) => {
    moveToCell(r, c, state.gameId, state.logEntries)
  }, [state.gameId, state.logEntries, moveToCell])

  const handleReveal = () => revealTruth(state.gameId)

  return (
    <>
      <Header
        inferenceSteps={state.inference_steps}
        visitedCount={state.visited_count}
        alive={state.alive}
        won={state.won}
        gameId={state.gameId}
      />

      <main>
        <LeftPanel
          onNew={handleNew}
          onAutoStep={handleAutoStep}
          onAutoRun={handleAutoRun}
          onReveal={handleReveal}
          isRunning={running}
        />

        <div className="center-panel">
          <Grid
            rows={state.rows}
            cols={state.cols}
            cellStates={state.cell_states}
            alive={state.alive}
            won={state.won}
            onMove={handleMove}
            truth={state.truth}
          />
          <MessageBox message={state.message} type={state.msgType} />
        </div>

        <RightPanel
          percepts={state.percepts}
          inferenceSteps={state.inference_steps}
          lastSteps={state.last_steps}
          visitedCount={state.visited_count}
          agent={state.agent}
          logEntries={state.logEntries}
          kbLog={state.log}
        />
      </main>
    </>
  )
}
