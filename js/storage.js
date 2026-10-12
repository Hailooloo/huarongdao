// 本地存档：每关最佳步数、星级、用时，以及上次游玩位置
const KEY = 'huarongdao-progress-v1';

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || '{}');
    return data && typeof data === 'object' ? data : {};
  } catch (e) {
    return {};
  }
}

let cache = load();
if (!cache.records || typeof cache.records !== 'object') cache.records = {};
if (!cache.settings || typeof cache.settings !== 'object') cache.settings = { sound: true };

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch (e) {
    /* 存储不可用时静默降级 */
  }
}

export function getRecord(levelId) {
  return cache.records[levelId] || null;
}

export function saveRecord(levelId, { steps, stars, time }) {
  const old = cache.records[levelId];
  const better = !old || stars > old.stars || (stars === old.stars && steps < old.steps);
  cache.records[levelId] = {
    steps: old ? Math.min(old.steps, steps) : steps,
    stars: old ? Math.max(old.stars, stars) : stars,
    time: old ? Math.min(old.time, time) : time,
    plays: (old ? old.plays : 0) + 1
  };
  persist();
  return { isNewBest: better, record: cache.records[levelId] };
}

export function getLast() {
  return cache.last || { tier: 'easy', index: 0 };
}

export function setLast(tier, index) {
  cache.last = { tier, index };
  persist();
}

export function getSetting(name) {
  return cache.settings[name];
}

export function setSetting(name, value) {
  cache.settings[name] = value;
  persist();
}

export function resetAll() {
  cache = { records: {}, settings: cache.settings };
  persist();
}

export function summary(levelsByTier) {
  const result = { cleared: 0, stars: 0, total: 0, maxStars: 0, byTier: {} };
  Object.entries(levelsByTier).forEach(([tier, list]) => {
    const t = { cleared: 0, stars: 0, total: list.length };
    list.forEach((lv) => {
      const r = cache.records[lv.id];
      if (r) {
        t.cleared += 1;
        t.stars += r.stars;
      }
    });
    result.byTier[tier] = t;
    result.cleared += t.cleared;
    result.stars += t.stars;
    result.total += t.total;
    result.maxStars += t.total * 3;
  });
  return result;
}
