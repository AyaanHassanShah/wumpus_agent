// Main Wumpus Game Logic
import { getNeighbors, bfsPath } from "./utils.js";
import { KnowledgeBase } from "./knowledgeBase.js";

export class WumpusGame {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.reset();
  }

  reset() {
    this.kb = new KnowledgeBase();
    this.visited = new Set();
    this.safeCells = new Set();
    this.confirmedDanger = new Set();
    this.perceptsLog = [];
    this.agentPos = [0, 0];
    this.alive = true;
    this.won = false;
    this.goldCollected = false;

    this._placeHazards();
    this.safeCells.add("0,0");
    this._visit(0, 0);
  }

  _placeHazards() {
    const candidates = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!(r === 0 && c === 0)) {
          candidates.push([r, c]);
        }
      }
    }

    // Shuffle candidates
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    const nPits = Math.max(1, Math.floor((this.rows * this.cols) / 6));
    this.pits = new Set(
      candidates.slice(0, nPits).map((p) => `${p[0]},${p[1]}`),
    );
    this.wumpus = candidates.length > nPits ? candidates[nPits] : null;
    this.gold =
      candidates.length > nPits + 1
        ? candidates[nPits + 1]
        : [this.rows - 1, this.cols - 1];
  }

  _visit(r, c) {
    this.visited.add(`${r},${c}`);
    this.safeCells.add(`${r},${c}`);
    const percepts = [];

    // Check for breeze
    const hasBreeze = getNeighbors(r, c, this.rows, this.cols).some(
      ([pr, pc]) => this.pits.has(`${pr},${pc}`),
    );

    if (hasBreeze) {
      percepts.push("Breeze");
      this.kb.tellFact(`B_${r}_${c}`);
      this.kb.addBreezeRule(r, c, this.rows, this.cols);
    } else {
      this.kb.tellFact(`NOT_B_${r}_${c}`);
      this.kb.addNoBreeze(r, c, this.rows, this.cols);
    }

    // Check for stench
    const hasStench =
      this.wumpus &&
      getNeighbors(r, c, this.rows, this.cols).some(
        ([wr, wc]) => this.wumpus[0] === wr && this.wumpus[1] === wc,
      );

    if (hasStench) {
      percepts.push("Stench");
      this.kb.tellFact(`S_${r}_${c}`);
      this.kb.addStenchRule(r, c, this.rows, this.cols);
    } else {
      this.kb.tellFact(`NOT_S_${r}_${c}`);
      this.kb.addNoStench(r, c, this.rows, this.cols);
    }

    // Check for gold
    if (r === this.gold[0] && c === this.gold[1] && !this.goldCollected) {
      percepts.push("Glitter");
      this.goldCollected = true;
      this.won = true;
    }

    this.kb.tellFact(`VISITED_${r}_${c}`);
    this.perceptsLog = percepts;
    return percepts;
  }

  querySafe(r, c) {
    const [noPit, s1, l1] = this.kb.ask([`NOT_P_${r}_${c}`]);
    const [noWumpus, s2, l2] = this.kb.ask([`NOT_W_${r}_${c}`]);
    return [noPit && noWumpus, s1 + s2, l1.concat(l2)];
  }

  move(r, c) {
    if (!this.alive || this.won) {
      return this._state("Game already over.");
    }

    const neighbors = getNeighbors(...this.agentPos, this.rows, this.cols);
    if (!neighbors.some(([nr, nc]) => nr === r && nc === c)) {
      return this._state("Invalid move: cell is not adjacent.");
    }

    const [isSafe, steps, log] = this.querySafe(r, c);
    this.agentPos = [r, c];

    if (
      this.pits.has(`${r},${c}`) ||
      (this.wumpus && this.wumpus[0] === r && this.wumpus[1] === c)
    ) {
      this.alive = false;
      this.confirmedDanger.add(`${r},${c}`);
      const hazard = this.pits.has(`${r},${c}`) ? "pit" : "Wumpus";
      return this._state(
        `Agent stepped into a ${hazard}! 💀`,
        steps,
        log,
        isSafe,
      );
    }

    this._visit(r, c);
    return this._state(`Moved to (${r},${c}).`, steps, log, isSafe);
  }

  autoStep() {
    if (!this.alive || this.won) {
      return this._state("Game over.");
    }

    const [r, c] = this.agentPos;
    const neighbors = getNeighbors(r, c, this.rows, this.cols);
    const unvisitedNb = neighbors.filter(
      ([nr, nc]) => !this.visited.has(`${nr},${nc}`),
    );

    // Priority 1: KB-proven safe unvisited neighbor
    for (const [nr, nc] of unvisitedNb) {
      const [isSafe] = this.querySafe(nr, nc);
      if (isSafe) {
        this.agentPos = [nr, nc];
        this._visit(nr, nc);
        return this._state(
          `Auto-moved to (${nr},${nc}) — KB proved safe ✓`,
          1,
          [],
          true,
        );
      }
    }

    // Priority 2: Brave move (faster than frontier search)
    const candidates = unvisitedNb.filter(
      ([nr, nc]) => !this.confirmedDanger.has(`${nr},${nc}`),
    );

    if (candidates.length > 0) {
      const [nr, nc] = candidates[0];
      this.agentPos = [nr, nc];
      if (
        this.pits.has(`${nr},${nc}`) ||
        (this.wumpus && this.wumpus[0] === nr && this.wumpus[1] === nc)
      ) {
        this.alive = false;
        this.confirmedDanger.add(`${nr},${nc}`);
        return this._state(
          `Brave move to (${nr},${nc}) — danger! 💀`,
          0,
          [],
          false,
        );
      }
      this._visit(nr, nc);
      return this._state(
        `Brave move to (${nr},${nc}) — KB uncertain.`,
        0,
        [],
        false,
      );
    }

    // Priority 3: Backtrack
    const visitedNb = neighbors.filter(([nr, nc]) =>
      this.visited.has(`${nr},${nc}`),
    );
    if (visitedNb.length > 0) {
      const [nr, nc] = visitedNb[0];
      this.agentPos = [nr, nc];
      return this._state(`Backtracked to (${nr},${nc}).`, 0, [], false);
    }

    return this._state("No moves available — stuck.", 0, [], false);
  }

  _cellStatus() {
    const status = {};
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const key = `${row},${col}`;
        if (this.confirmedDanger.has(key)) {
          status[key] = "danger";
        } else if (this.agentPos[0] === row && this.agentPos[1] === col) {
          status[key] = "agent";
        } else if (this.visited.has(key)) {
          status[key] = "visited";
        } else if (this.safeCells.has(key)) {
          status[key] = "safe";
        } else {
          status[key] = "unknown";
        }
      }
    }
    return status;
  }

  _state(message = "", lastSteps = 0, log = null, wasSafeQuery = false) {
    return {
      rows: this.rows,
      cols: this.cols,
      agent: [...this.agentPos],
      alive: this.alive,
      won: this.won,
      gold_collected: this.goldCollected,
      percepts: this.perceptsLog,
      cell_states: this._cellStatus(),
      inference_steps: this.kb.inference_steps,
      last_steps: lastSteps,
      visited_count: this.visited.size,
      log: log || [],
      message,
      was_safe_query: wasSafeQuery,
    };
  }

  getState() {
    return this._state();
  }

  revealTruth() {
    return {
      pits: Array.from(this.pits).map((p) => p.split(",").map(Number)),
      wumpus: this.wumpus,
      gold: this.gold,
    };
  }
}
