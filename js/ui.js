// 界面渲染：难度标签、关卡网格、关卡信息、武将图鉴、胜利弹窗与提示条
import { TIERS, LEVELS, GENERALS, getTier } from './levels.js';
import { getRecord, summary } from './storage.js';

const $ = (sel) => document.querySelector(sel);

function bindText(key, value) {
  document.querySelectorAll(`[data-bind="${key}"]`).forEach((el) => {
    el.textContent = value;
  });
}

export function starsHTML(n, size = 'text-base') {
  return [1, 2, 3]
    .map((i) => `<i class="${i <= n ? 'ri-star-fill text-amber-400' : 'ri-star-line text-stone-500/60'} ${size}"></i>`)
    .join('');
}

export function calcStars(steps, optimal) {
  if (!optimal) return 3;
  if (steps <= optimal) return 3;
  if (steps <= Math.ceil(optimal * 1.5)) return 2;
  return 1;
}

export function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function isUnlocked(tierKey, index) {
  if (index === 0) return true;
  const prev = LEVELS[tierKey] && LEVELS[tierKey][index - 1];
  return Boolean(prev && getRecord(prev.id));
}

export function renderTierTabs(activeTier) {
  const sum = summary(LEVELS);
  $('#tierTabs').innerHTML = TIERS.map((t) => {
    const s = sum.byTier[t.key] || { cleared: 0, total: 0 };
    const active = t.key === activeTier;
    return `
      <button data-tier="${t.key}" class="tier-tab ${active ? 'is-active' : ''} flex-1 rounded-xl px-2 py-2 text-left transition">
        <div class="flex items-center gap-1.5 font-bold"><i class="${t.icon}"></i>${t.title}</div>
        <div class="text-[11px] opacity-75">${t.subtitle} · ${s.cleared}/${s.total}</div>
      </button>`;
  }).join('');
}

export function renderLevelGrid(tierKey, currentIndex) {
  const list = LEVELS[tierKey] || [];
  const tier = getTier(tierKey);
  const sum = summary(LEVELS).byTier[tierKey] || { cleared: 0, total: list.length, stars: 0 };
  const pct = sum.total ? Math.round((sum.cleared / sum.total) * 100) : 0;
  $('#tierProgress').innerHTML = `
    <div class="flex items-center justify-between text-xs text-blue-900 lg:text-amber-100/80 mb-1.5">
      <span>${tier.title}进度 ${sum.cleared}/${sum.total}</span>
      <span class="flex items-center gap-1"><i class="ri-star-fill text-amber-500 lg:text-amber-400"></i>${sum.stars}/${sum.total * 3}</span>
    </div>
    <div class="h-2 rounded-full bg-blue-900/20 lg:bg-black/30 overflow-hidden"><div class="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700" style="width:${pct}%"></div></div>`;
  $('#levelGrid').innerHTML = list
    .map((lv, i) => {
      const rec = getRecord(lv.id);
      const unlocked = isUnlocked(tierKey, i);
      const current = i === currentIndex;
      return `
        <button data-level="${i}" ${unlocked ? '' : 'disabled'} title="${lv.name}"
          class="level-btn ${current ? 'is-current' : ''} ${rec ? 'is-cleared' : ''} ${unlocked ? '' : 'is-locked'}">
          <span class="text-base font-black leading-none">${unlocked ? lv.no : '<i class="ri-lock-2-fill"></i>'}</span>
          <span class="flex text-[9px] mt-1">${starsHTML(rec ? rec.stars : 0, 'text-[10px]')}</span>
        </button>`;
    })
    .join('');
  const total = summary(LEVELS);
  $('#totalStars').textContent = `${total.stars}/${total.maxStars}`;
  $('#totalCleared').textContent = `${total.cleared}/${total.total}`;
}

export function renderInfo(level) {
  const tier = getTier(level.tier);
  const rec = getRecord(level.id);
  $('#levelTier').className = `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${tier.badge}`;
  $('#levelTier').innerHTML = `<i class="${tier.icon}"></i>${tier.title} · 第 ${level.no} 关`;
  $('#levelName').textContent = level.name;
  $('#optimalSteps').textContent = level.optimal;
  bindText('tierLabel', `${tier.title} · 第 ${level.no} 关`);
  bindText('name', level.name);
  bindText('optimal', level.optimal);
  $('#bestRecord').innerHTML = rec
    ? `<span class="flex">${starsHTML(rec.stars, 'text-sm')}</span><span>${rec.steps} 步 · ${formatTime(rec.time)}</span>`
    : '<span class="text-amber-100/60">尚未通关</span>';
  $('#starRule').innerHTML = `
    <div class="flex items-center justify-between"><span class="flex">${starsHTML(3, 'text-xs')}</span><span>≤ ${level.optimal} 步</span></div>
    <div class="flex items-center justify-between"><span class="flex">${starsHTML(2, 'text-xs')}</span><span>≤ ${Math.ceil(level.optimal * 1.5)} 步</span></div>
    <div class="flex items-center justify-between"><span class="flex">${starsHTML(1, 'text-xs')}</span><span>成功脱困</span></div>`;
  renderRoster(level);
}

export function renderRoster(level) {
  const counts = {};
  level.pieces.forEach((p) => {
    counts[p.general] = (counts[p.general] || 0) + 1;
  });
  $('#roster').innerHTML = Object.entries(counts)
    .map(([key, n]) => {
      const g = GENERALS[key];
      if (!g) return '';
      return `
        <div class="roster-card" style="--tone:${g.tone}">
          <div class="roster-img" style="background-image:url('${g.img}')"></div>
          <div class="text-xs font-bold mt-1">${g.name}${n > 1 ? ` ×${n}` : ''}</div>
        </div>`;
    })
    .join('');
}

export function updateStats({ steps, time, optimal }) {
  $('#stepCount').textContent = steps;
  $('#timeCount').textContent = formatTime(time);
  bindText('steps', steps);
  bindText('time', formatTime(time));
  const stars = calcStars(Math.max(steps, 0), optimal);
  $('#liveStars').innerHTML = starsHTML(steps === 0 ? 3 : stars, 'text-lg');
}

export function showWin({ level, steps, time, stars, isNewBest, assisted, hasNext }) {
  $('#winTitle').textContent = assisted ? '军师演示完成' : '曹操成功脱困！';
  $('#winLevel').textContent = `${getTier(level.tier).title} · ${level.name}`;
  $('#winStars').innerHTML = assisted ? starsHTML(0, 'text-4xl') : [1, 2, 3].map((i) => `<i class="${i <= stars ? 'ri-star-fill text-amber-400 win-star' : 'ri-star-line text-stone-400'} text-5xl" style="animation-delay:${i * 180}ms"></i>`).join('');
  $('#winSteps').textContent = steps;
  $('#winOptimal').textContent = level.optimal;
  $('#winTime').textContent = formatTime(time);
  $('#winBadge').classList.toggle('hidden', !isNewBest || assisted);
  $('#winNote').textContent = assisted ? '演示通关不计入成绩，自己再试一次吧！' : stars === 3 ? '神机妙算，步步最优！' : `距离最优解还差 ${steps - level.optimal} 步，再接再厉！`;
  $('#winNext').classList.toggle('hidden', !hasNext);
  $('#winModal').classList.remove('hidden');
  requestAnimationFrame(() => $('#winModal').classList.add('is-open'));
  burst();
}

export function hideWin() {
  $('#winModal').classList.remove('is-open');
  setTimeout(() => $('#winModal').classList.add('hidden'), 250);
}

let toastTimer = null;
export function toast(text, icon = 'ri-information-line') {
  const el = $('#toast');
  el.innerHTML = `<i class="${icon} text-lg"></i><span>${text}</span>`;
  el.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-show'), 2200);
}

function burst() {
  const host = $('#confetti');
  const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#a855f7', '#fde68a'];
  host.innerHTML = Array.from({ length: 60 }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.6;
    const dur = 1.8 + Math.random() * 1.4;
    const rot = Math.random() * 360;
    return `<span class="confetti-bit" style="left:${left}%;background:${colors[i % colors.length]};animation-delay:${delay}s;animation-duration:${dur}s;transform:rotate(${rot}deg)"></span>`;
  }).join('');
  setTimeout(() => (host.innerHTML = ''), 3600);
}
