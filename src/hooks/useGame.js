// src/hooks/useGame.js
// Pure React game state manager using local game logic

import { useState, useRef, useCallback } from "react";
import { WumpusGame } from "../game/wumpusGame.js";

const INITIAL_STATE = {
  gameId: null,
  rows: 0,
  cols: 0,
  agent: [0, 0],
  alive: true,
  won: false,
  percepts: [],
  cell_states: {},
  inference_steps: 0,
  last_steps: 0,
  visited_count: 0,
  log: [],
  message: "Configure grid and click INITIALIZE AGENT.",
  msgType: "info",
  was_safe_query: false,
  logEntries: [],
  truth: null,
};

export function useGame() {
  const [state, setState] = useState(INITIAL_STATE);
  const gameRef = useRef(null);
  const runRef = useRef(null);

  const applyState = useCallback((gameState, prevLogEntries = []) => {
    if (!gameState) return;

    const msgType = !gameState.alive
      ? "err"
      : gameState.won
        ? "ok"
        : gameState.was_safe_query
          ? "ok"
          : "info";

    const newEntry = gameState.message
      ? {
          text: gameState.message,
          cls: !gameState.alive
            ? "bad"
            : gameState.was_safe_query && gameState.message.includes("✓")
              ? "good"
              : "info",
        }
      : null;

    setState((prev) => ({
      ...prev,
      ...gameState,
      msgType,
      logEntries: newEntry
        ? [newEntry, ...prevLogEntries].slice(0, 50)
        : prevLogEntries,
    }));
  }, []);

  const stopRun = useCallback(() => {
    if (runRef.current) {
      clearInterval(runRef.current);
      runRef.current = null;
    }
  }, []);

  const newGame = useCallback(
    (rows, cols) => {
      stopRun();
      const game = new WumpusGame(rows, cols);
      gameRef.current = game;
      const gameId = Math.random().toString(36).slice(2, 10);

      setState({
        ...INITIAL_STATE,
        gameId,
        ...game.getState(),
        message:
          "Agent initialised at (0,0). Click a cell or use AUTO controls.",
      });
    },
    [stopRun],
  );

  const moveToCell = useCallback(
    (r, c, gameId, logEntries) => {
      if (!gameRef.current || gameId !== state.gameId) return;
      const result = gameRef.current.move(r, c);
      applyState(result, logEntries);
    },
    [state.gameId, applyState],
  );

  const autoStep = useCallback(
    (gameId, logEntries) => {
      if (!gameRef.current || gameId !== state.gameId) return;
      const result = gameRef.current.autoStep();
      applyState(result, logEntries);
      return result;
    },
    [state.gameId, applyState],
  );

  const startAutoRun = useCallback(
    (gameId) => {
      if (runRef.current) {
        stopRun();
        return false;
      }
      if (!gameRef.current || gameId !== state.gameId) return false;

      runRef.current = setInterval(() => {
        setState((prev) => {
          if (!gameRef.current) return prev;
          const result = gameRef.current.autoStep();
          const msgType = !result.alive
            ? "err"
            : result.won
              ? "ok"
              : result.was_safe_query
                ? "ok"
                : "info";
          const newEntry = result.message
            ? {
                text: result.message,
                cls: !result.alive
                  ? "bad"
                  : result.was_safe_query && result.message.includes("✓")
                    ? "good"
                    : "info",
              }
            : null;
          // Keep log limited to prevent memory bloat
          const logEntries = newEntry
            ? [newEntry, ...prev.logEntries].slice(0, 50)
            : prev.logEntries;

          if (!result.alive || result.won) {
            stopRun();
          }

          return { ...prev, ...result, msgType, logEntries };
        });
      }, 300); // Faster movement (was 700ms)

      return true;
    },
    [state.gameId, stopRun],
  );

  const revealTruth = useCallback(
    (gameId) => {
      if (!gameRef.current || gameId !== state.gameId) return;
      const truth = gameRef.current.revealTruth();
      setState((prev) => ({
        ...prev,
        truth,
        msgType: "warn",
        message: "Truth revealed — 🕳️ Pit  👹 Wumpus  🏆 Gold",
      }));
    },
    [state.gameId],
  );

  const isRunning = () => !!runRef.current;

  return {
    state,
    isRunning,
    newGame,
    moveToCell,
    autoStep,
    startAutoRun,
    stopRun,
    revealTruth,
  };
}
