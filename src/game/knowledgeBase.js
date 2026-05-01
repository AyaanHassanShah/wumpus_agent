// Knowledge Base - Resolution-based inference engine
import { negate, getNeighbors } from "./utils.js";

class Clause {
  constructor(literals) {
    this.literals = new Set(literals);
    this._hash = null; // Cache hash for O(1) access
  }

  equals(other) {
    if (this.literals.size !== other.literals.size) return false;
    for (const lit of this.literals) {
      if (!other.literals.has(lit)) return false;
    }
    return true;
  }

  hash() {
    if (!this._hash) {
      this._hash = Array.from(this.literals).sort().join("|");
    }
    return this._hash;
  }

  isTautology() {
    for (const lit of this.literals) {
      if (this.literals.has(negate(lit))) {
        return true;
      }
    }
    return false;
  }

  isEmpty() {
    return this.literals.size === 0;
  }

  toString() {
    return "{" + Array.from(this.literals).sort().join(", ") + "}";
  }
}

function resolve(c1, c2) {
  const resolvents = [];
  for (const lit of c1.literals) {
    const neg = negate(lit);
    if (c2.literals.has(neg)) {
      const merged = new Set([...c1.literals, ...c2.literals]);
      merged.delete(lit);
      merged.delete(neg);
      const newClause = new Clause(merged);
      if (!newClause.isTautology()) {
        resolvents.push(newClause);
      }
    }
  }
  return resolvents;
}

export class KnowledgeBase {
  static MAX_STEPS = 2000; // Reduced from 5000 for faster queries

  constructor() {
    this.clauses = [];
    this.clauseHashes = new Set(); // O(1) hash lookup
    this.inference_steps = 0;
  }

  tell(clauses) {
    for (const clause of clauses) {
      if (!clause.isTautology()) {
        const hash = clause.hash();
        if (!this.clauseHashes.has(hash)) {
          this.clauses.push(clause);
          this.clauseHashes.add(hash);
        }
      }
    }
  }

  tellFact(literal) {
    const clause = new Clause([literal]);
    const hash = clause.hash();
    if (!this.clauseHashes.has(hash)) {
      this.clauses.push(clause);
      this.clauseHashes.add(hash);
    }
  }

  ask(queryLiterals) {
    let steps = 0;
    const negated = queryLiterals.map((lit) => new Clause([negate(lit)]));
    const working = [...this.clauses, ...negated];
    const seen = new Set(working.map((c) => c.hash()));
    let workingStartIdx = this.clauses.length;

    while (true) {
      const newClausesList = [];
      const workingLen = working.length;

      for (let i = workingStartIdx; i < workingLen; i++) {
        for (let j = 0; j < workingLen; j++) {
          if (i === j) continue;
          const resolvents = resolve(working[i], working[j]);
          steps++;

          for (const r of resolvents) {
            if (r.isEmpty()) {
              return [true, steps, []];
            }
            const rHash = r.hash();
            if (!seen.has(rHash)) {
              newClausesList.push(r);
              seen.add(rHash);
            }
          }
          if (steps > KnowledgeBase.MAX_STEPS) {
            return [false, steps, []];
          }
        }
      }

      if (newClausesList.length === 0) {
        this.inference_steps += steps;
        return [false, steps, []];
      }

      workingStartIdx = working.length;
      working.push(...newClausesList);
    }
  }

  addBreezeRule(r, c, rows, cols) {
    const neighbors = getNeighbors(r, c, rows, cols);
    const pitLits = neighbors.map(([nr, nc]) => `P_${nr}_${nc}`);
    const b = `B_${r}_${c}`;

    if (pitLits.length > 0) {
      this.tell([new Clause([negate(b), ...pitLits])]);
    }

    for (const p of pitLits) {
      this.tell([new Clause([negate(p), b])]);
    }
  }

  addStenchRule(r, c, rows, cols) {
    const neighbors = getNeighbors(r, c, rows, cols);
    const wLits = neighbors.map(([nr, nc]) => `W_${nr}_${nc}`);
    const s = `S_${r}_${c}`;

    if (wLits.length > 0) {
      this.tell([new Clause([negate(s), ...wLits])]);
    }

    for (const w of wLits) {
      this.tell([new Clause([negate(w), s])]);
    }
  }

  addNoBreeze(r, c, rows, cols) {
    const neighbors = getNeighbors(r, c, rows, cols);
    for (const [nr, nc] of neighbors) {
      this.tellFact(`NOT_P_${nr}_${nc}`);
    }
  }

  addNoStench(r, c, rows, cols) {
    const neighbors = getNeighbors(r, c, rows, cols);
    for (const [nr, nc] of neighbors) {
      this.tellFact(`NOT_W_${nr}_${nc}`);
    }
  }
}
