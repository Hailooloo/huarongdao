// 关卡生成器：node tools/gen-levels.mjs
// 随机布局 -> BFS 遍历连通分量 -> 多源 BFS 求每个状态到终局的最少步数 -> 按难度挑选
import { writeFileSync } from 'node:fs';
import { parseState, serialize, buildGrid, nextStates, isGoal, solve, SIZE, COLS, ROWS } from '../js/solver.js';

let seed = 20261012;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

function randomLayout() {
  const combos = [[4, 1, 4], [3, 2, 4], [2, 3, 4], [1, 4, 4], [5, 0, 4], [4, 1, 4], [3, 2, 4]];
  const [v, h, s] = pick(combos);
  for (let tries = 0; tries < 200; tries++) {
    const pieces = [];
    const grid = new Array(COLS * ROWS).fill(-1);
    const place = (type) => {
      const { w, h: ph } = SIZE[type];
      const spots = [];
      for (let r = 0; r + ph <= ROWS; r++) {
        for (let c = 0; c + w <= COLS; c++) {
          let ok = true;
          for (let y = 0; y < ph && ok; y++) for (let x = 0; x < w; x++) if (grid[(r + y) * COLS + c + x] !== -1) { ok = false; break; }
          if (ok) spots.push([r, c]);
        }
      }
      if (!spots.length) return false;
      const [r, c] = pick(spots);
      const id = pieces.length;
      pieces.push({ type, r, c });
      for (let y = 0; y < ph; y++) for (let x = 0; x < w; x++) grid[(r + y) * COLS + c + x] = id;
      return true;
    };
    const order = ['C', ...Array(v).fill('V'), ...Array(h).fill('H'), ...Array(s).fill('S')];
    if (order.every(place)) {
      const st = serialize(pieces);
      if (!isGoal(st)) return st;
    }
  }
  return null;
}

const SHAPE = { A: [2, 2], H: [2, 1], V: [1, 2], S: [1, 1] };
const LOWER = { A: 'a', H: 'h', V: 'v', S: 'S' };
function fastNext(state) {
  const out = [];
  const cells = state.split('');
  for (let i = 0; i < 20; i++) {
    const ch = cells[i];
    const shape = SHAPE[ch];
    if (!shape) continue;
    const [w, h] = shape;
    const r0 = (i / 4) | 0;
    const c0 = i % 4;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      for (let dist = 1; dist <= 2; dist++) {
        const nr = r0 + dr * dist;
        const nc = c0 + dc * dist;
        if (nr < 0 || nc < 0 || nr + h > 5 || nc + w > 4) break;
        let ok = true;
        for (let y = 0; y < h && ok; y++) {
          for (let x = 0; x < w; x++) {
            const rr = nr + y;
            const cc = nc + x;
            const inside = rr >= r0 && rr < r0 + h && cc >= c0 && cc < c0 + w;
            if (!inside && cells[rr * 4 + cc] !== '.') { ok = false; break; }
          }
        }
        if (!ok) break;
        const nxt = cells.slice();
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) nxt[(r0 + y) * 4 + c0 + x] = '.';
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) nxt[(nr + y) * 4 + nc + x] = y === 0 && x === 0 ? ch : LOWER[ch];
        out.push(nxt.join(''));
      }
    }
  }
  return out;
}

function analyze(start) {
  const seen = new Set([start]);
  const list = [start];
  let key = start;
  for (let i = 0; i < list.length; i++) {
    for (const n of fastNext(list[i])) if (!seen.has(n)) { seen.add(n); list.push(n); if (n < key) key = n; }
    if (list.length > 260000) return null;
  }
  const dist = new Map();
  const q = [];
  for (const s of list) if (isGoal(s)) { dist.set(s, 0); q.push(s); }
  if (!q.length) return null;
  for (let i = 0; i < q.length; i++) {
    const d = dist.get(q[i]);
    for (const n of fastNext(q[i])) if (!dist.has(n)) { dist.set(n, d + 1); q.push(n); }
  }
  dist.key = key;
  return dist;
}

const TIERS = [
  { key: 'easy', count: 25, min: 3, max: 30 },
  { key: 'normal', count: 25, min: 31, max: 60 },
  { key: 'hard', count: 25, min: 61, max: 130 }
];
const CLASSIC = { state: 'VAaVvaavVHhVvSSvS..S', name: '横刀立马' };

const buckets = {};
TIERS.forEach((t) => (buckets[t.key] = new Map()));
const used = new Set();
let comps = 0;
const startTime = Date.now();
const full = () => TIERS.every((t) => buckets[t.key].size >= t.count);
for (let iter = 0; iter < 20000 && !full() && Date.now() - startTime < 720000; iter++) {
  const st = randomLayout();
  if (!st) continue;
  const dist = analyze(st);
  if (!dist || used.has(dist.key)) continue;
  used.add(dist.key);
  comps++;
  const byD = new Map();
  for (const [s, d] of dist) {
    if (!byD.has(d)) byD.set(d, []);
    byD.get(d).push(s);
  }
  for (const t of TIERS) {
    const cand = [];
    for (let d = t.min; d <= t.max; d++) if (byD.has(d) && !buckets[t.key].has(d)) cand.push(d);
    for (let k = 0; k < 5 && cand.length; k++) {
      const d = cand.splice(Math.floor(rand() * cand.length), 1)[0];
      buckets[t.key].set(d, [pick(byD.get(d))]);
    }
  }
  if (comps % 10 === 0) console.log('comps', comps, TIERS.map((t) => buckets[t.key].size).join('/'), Math.round((Date.now() - startTime) / 1000) + 's');
}

const result = {};
for (const t of TIERS) {
  const pool = [];
  [...buckets[t.key].keys()].sort((a, b) => a - b).forEach((d) => buckets[t.key].get(d).forEach((s) => pool.push({ state: s, optimal: d })));
  const chosen = [];
  for (let i = 0; i < t.count && pool.length; i++) {
    const idx = Math.round((i * (pool.length - 1)) / Math.max(1, t.count - 1));
    chosen.push(pool[idx]);
  }
  const uniq = [...new Map(chosen.map((c) => [c.state, c])).values()];
  result[t.key] = uniq;
  console.log(t.key, uniq.length, uniq.map((c) => c.optimal).join(','));
}
const classicPath = solve(CLASSIC.state);
console.log('classic', classicPath.length, 'components', comps);
const hard = result.hard.filter((c) => c.optimal !== classicPath.length);
if (hard.length >= 25) hard.splice(Math.floor(rand() * hard.length), 1);
hard.push({ state: CLASSIC.state, optimal: classicPath.length, name: CLASSIC.name });
result.hard = hard.sort((a, b) => a.optimal - b.optimal);

const out = `// 由 tools/gen-levels.mjs 自动生成，每关均经 BFS 验证可解，optimal 为最少步数\nexport const RAW_LEVELS = ${JSON.stringify(result, null, 1)};\n`;
writeFileSync(new URL('../js/levels-data.js', import.meta.url), out);
