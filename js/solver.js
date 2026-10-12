// 华容道核心逻辑：棋盘 4 列 x 5 行，曹操(2x2) 移到底部中央出口即胜利
// 状态串编码（20 字符）：A/a 曹操，H/h 横将，V/v 竖将，S 小兵，. 空位
export const COLS = 4;
export const ROWS = 5;
export const GOAL_INDEX = 13; // 曹操左上角位于第 4 行第 2 列

export const SIZE = {
  C: { w: 2, h: 2 },
  H: { w: 2, h: 1 },
  V: { w: 1, h: 2 },
  S: { w: 1, h: 1 }
};

const HEAD = { A: 'C', H: 'H', V: 'V', S: 'S' };

export const DIRS = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 }
};

export function parseState(state) {
  const pieces = [];
  for (let i = 0; i < state.length; i++) {
    const type = HEAD[state[i]];
    if (type) pieces.push({ type, r: Math.floor(i / COLS), c: i % COLS });
  }
  return pieces;
}

export function serialize(pieces) {
  const cells = new Array(COLS * ROWS).fill('.');
  for (const p of pieces) {
    const { w, h } = SIZE[p.type];
    for (let dr = 0; dr < h; dr++) {
      for (let dc = 0; dc < w; dc++) {
        const idx = (p.r + dr) * COLS + p.c + dc;
        let ch;
        if (p.type === 'C') ch = dr === 0 && dc === 0 ? 'A' : 'a';
        else if (p.type === 'H') ch = dc === 0 ? 'H' : 'h';
        else if (p.type === 'V') ch = dr === 0 ? 'V' : 'v';
        else ch = 'S';
        cells[idx] = ch;
      }
    }
  }
  return cells.join('');
}

export function buildGrid(pieces) {
  const grid = new Array(COLS * ROWS).fill(-1);
  pieces.forEach((p, id) => {
    const { w, h } = SIZE[p.type];
    for (let dr = 0; dr < h; dr++) {
      for (let dc = 0; dc < w; dc++) grid[(p.r + dr) * COLS + p.c + dc] = id;
    }
  });
  return grid;
}

// 判断某棋子能否朝某方向移动 dist 格
export function canMove(pieces, grid, id, dir, dist = 1) {
  const p = pieces[id];
  const { w, h } = SIZE[p.type];
  const { dr, dc } = DIRS[dir];
  const nr = p.r + dr * dist;
  const nc = p.c + dc * dist;
  if (nr < 0 || nc < 0 || nr + h > ROWS || nc + w > COLS) return false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const occ = grid[(nr + y) * COLS + nc + x];
      if (occ !== -1 && occ !== id) return false;
    }
  }
  if (dist === 2) return canMove(pieces, grid, id, dir, 1);
  return true;
}

// 一次“移动”= 一个棋子沿直线滑动 1 或 2 格
export function nextStates(state) {
  const pieces = parseState(state);
  const grid = buildGrid(pieces);
  const result = [];
  pieces.forEach((p, id) => {
    for (const dir of Object.keys(DIRS)) {
      for (let dist = 1; dist <= 2; dist++) {
        if (!canMove(pieces, grid, id, dir, dist)) break;
        const moved = pieces.map((q, i) => (i === id ? { ...q, r: q.r + DIRS[dir].dr * dist, c: q.c + DIRS[dir].dc * dist } : q));
        result.push({ state: serialize(moved), from: p.r * COLS + p.c, dir, dist });
      }
    }
  });
  return result;
}

export function isGoal(state) {
  return state[GOAL_INDEX] === 'A';
}

// BFS 求最优解，返回移动序列；无解返回 null
export function solve(start, maxStates = 400000) {
  if (isGoal(start)) return [];
  const prev = new Map([[start, null]]);
  const queue = [start];
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    for (const mv of nextStates(cur)) {
      if (prev.has(mv.state)) continue;
      prev.set(mv.state, { parent: cur, move: mv });
      if (isGoal(mv.state)) {
        const path = [];
        let s = mv.state;
        while (prev.get(s)) {
          const node = prev.get(s);
          path.unshift(node.move);
          s = node.parent;
        }
        return path;
      }
      if (prev.size > maxStates) return null;
      queue.push(mv.state);
    }
  }
  return null;
}
