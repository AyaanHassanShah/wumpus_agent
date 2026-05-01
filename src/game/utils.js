// Game utility functions

export function getNeighbors(r, c, rows, cols) {
  const result = [];
  for (const [dr, dc] of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      result.push([nr, nc]);
    }
  }
  return result;
}

export function negate(literal) {
  return literal.startsWith("NOT_") ? literal.slice(4) : "NOT_" + literal;
}

export function bfsPath(start, goal, passable, rows, cols) {
  if (start[0] === goal[0] && start[1] === goal[1]) {
    return [start];
  }

  const queue = [[start]];
  const seen = new Set([`${start[0]},${start[1]}`]);

  while (queue.length > 0) {
    const path = queue.shift();
    const [cr, cc] = path[path.length - 1];

    for (const [nr, nc] of getNeighbors(cr, cc, rows, cols)) {
      if (nr === goal[0] && nc === goal[1]) {
        return [...path, [nr, nc]];
      }
      const key = `${nr},${nc}`;
      const inPassable = passable.some((p) => p[0] === nr && p[1] === nc);
      if (inPassable && !seen.has(key)) {
        seen.add(key);
        queue.push([...path, [nr, nc]]);
      }
    }
  }

  return [start, goal];
}
