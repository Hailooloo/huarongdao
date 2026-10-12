// 入口：串联棋盘、关卡、存档、计时、提示与演示
import { Board } from './board.js';
import { LEVELS, getLevel } from './levels.js';
import { solve } from './solver.js';
import { sound } from './sound.js';
import { getLast, setLast, saveRecord, getSetting, setSetting, resetAll } from './storage.js';
import { renderTierTabs, renderLevelGrid, renderInfo, updateStats, showWin, hideWin, toast, calcStars, isUnlocked } from './ui.js';

const $ = (sel) => document.querySelector(sel);

const app = {
  tier: 'easy',
  index: 0,
  level: null,
  steps: 0,
  time: 0,
  timer: null,
  started: false,
  assisted: false,
  hints: 0,
  demo: null,
  plan: new Map()
};

const board = new Board($('#board'), {
  move: ({ steps, auto }) => {
    app.steps = steps;
    if (!auto) stopDemo();
    startTimer();
    sound.move();
    refreshStats();
  },
  undo: ({ steps }) => {
    app.steps = steps;
    sound.undo();
    refreshStats();
  },
  reset: () => {
    app.steps = 0;
    refreshStats();
  },
  blocked: () => sound.blocked(),
  win: ({ steps }) => onWin(steps)
});

function refreshStats() {
  updateStats({ steps: app.steps, time: app.time, optimal: app.level ? app.level.optimal : 0 });
  $('#btnUndo').disabled = app.steps === 0;
}

function startTimer() {
  if (app.started) return;
  app.started = true;
  app.timer = setInterval(() => {
    app.time += 1;
    refreshStats();
  }, 1000);
}

function stopTimer() {
  clearInterval(app.timer);
  app.timer = null;
}

function loadLevel(tier, index) {
  const level = getLevel(tier, index);
  if (!level) return;
  stopDemo();
  stopTimer();
  hideWin();
  Object.assign(app, { tier, index, level, steps: 0, time: 0, started: false, assisted: false, hints: 0, plan: new Map() });
  setLast(tier, index);
  board.load(level);
  renderInfo(level);
  renderTierTabs(tier);
  renderLevelGrid(tier, index);
  $('#levelGrid').dataset.tier = tier;
  refreshStats();
  closeDrawer();
}

function onWin(steps) {
  stopTimer();
  stopDemo(false);
  sound.win();
  const level = app.level;
  const stars = calcStars(steps, level.optimal);
  let isNewBest = false;
  if (!app.assisted) isNewBest = saveRecord(level.id, { steps, stars, time: app.time }).isNewBest;
  renderTierTabs(app.tier);
  renderLevelGrid(app.tier, app.index);
  renderInfo(level);
  const hasNext = Boolean(getLevel(app.tier, app.index + 1));
  setTimeout(() => showWin({ level, steps, time: app.time, stars, isNewBest, assisted: app.assisted, hasNext }), 650);
}

// 计算从当前局面到终局的最优路线，并缓存“局面 -> 下一步”
function planFromHere() {
  const state = board.getState();
  if (app.plan.has(state)) return app.plan.get(state);
  const path = solve(state);
  if (!path || !path.length) return null;
  let prev = state;
  path.forEach((mv) => {
    app.plan.set(prev, mv);
    prev = mv.state;
  });
  return app.plan.get(state);
}

function withThinking(fn) {
  $('#thinking').classList.remove('hidden');
  setTimeout(() => {
    try {
      fn();
    } finally {
      $('#thinking').classList.add('hidden');
    }
  }, 40);
}

function hint() {
  if (board.locked) return;
  stopDemo();
  withThinking(() => {
    const mv = planFromHere();
    if (!mv) return toast('军师也束手无策，试试重来吧', 'ri-error-warning-line');
    app.hints += 1;
    board.showHint(mv);
    sound.hint();
    toast(`军师锦囊：第 ${app.hints} 次提示`, 'ri-lightbulb-flash-line');
  });
}

function startDemo() {
  if (board.locked) return;
  if (app.demo) return stopDemo();
  withThinking(() => {
    if (!planFromHere()) return toast('当前局面无法演示', 'ri-error-warning-line');
    app.assisted = true;
    $('#btnDemo').classList.add('is-active');
    $('#btnDemo span').textContent = '停止';
    toast('军师亲自演示中，任意操作可打断', 'ri-play-circle-line');
    app.demo = setInterval(() => {
      const mv = planFromHere();
      if (!mv || board.locked) return stopDemo(false);
      board.applySolverMove(mv);
    }, 520);
  });
}

function stopDemo(notify = true) {
  if (!app.demo) return;
  clearInterval(app.demo);
  app.demo = null;
  $('#btnDemo').classList.remove('is-active');
  $('#btnDemo span').textContent = '演示';
  if (notify && !board.locked) toast('演示已停止，本局不计入成绩', 'ri-pause-circle-line');
}

function go(delta) {
  const next = app.index + delta;
  if (!getLevel(app.tier, next)) return toast(delta > 0 ? '已经是本难度最后一关' : '已经是第一关');
  if (!isUnlocked(app.tier, next)) return toast('通关上一关后解锁', 'ri-lock-2-line');
  loadLevel(app.tier, next);
}

function openDrawer() {
  $('#levelPanel').classList.add('is-open');
  $('#drawerMask').classList.remove('hidden');
}

function closeDrawer() {
  $('#levelPanel').classList.remove('is-open');
  $('#drawerMask').classList.add('hidden');
}

function bind() {
  $('#btnUndo').addEventListener('click', () => {
    stopDemo();
    board.undo();
  });
  $('#btnReset').addEventListener('click', () => {
    stopDemo();
    board.reset();
    app.assisted = false;
    toast('已恢复初始布阵', 'ri-restart-line');
  });
  $('#btnHint').addEventListener('click', hint);
  $('#btnDemo').addEventListener('click', startDemo);
  $('#btnPrev').addEventListener('click', () => go(-1));
  $('#btnNext').addEventListener('click', () => go(1));
  $('#btnLevels').addEventListener('click', openDrawer);
  $('#drawerMask').addEventListener('click', closeDrawer);
  $('#btnCloseDrawer').addEventListener('click', closeDrawer);

  $('#tierTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tier]');
    if (!btn) return;
    const tier = btn.dataset.tier;
    renderTierTabs(tier);
    renderLevelGrid(tier, tier === app.tier ? app.index : -1);
    $('#levelGrid').dataset.tier = tier;
  });

  $('#levelGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-level]');
    if (!btn || btn.disabled) return;
    const tier = $('#levelGrid').dataset.tier || app.tier;
    loadLevel(tier, Number(btn.dataset.level));
  });

  $('#winModal').addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]');
    if (!action) return;
    const a = action.dataset.action;
    if (a === 'next') go(1);
    if (a === 'retry') loadLevel(app.tier, app.index);
    if (a === 'close') hideWin();
  });

  const soundBtn = $('#btnSound');
  const syncSound = () => {
    soundBtn.innerHTML = `<i class="${sound.isEnabled() ? 'ri-volume-up-line' : 'ri-volume-mute-line'} text-lg"></i>`;
  };
  soundBtn.addEventListener('click', () => {
    sound.setEnabled(!sound.isEnabled());
    setSetting('sound', sound.isEnabled());
    syncSound();
  });
  sound.setEnabled(getSetting('sound') !== false);
  syncSound();

  $('#btnResetAll').addEventListener('click', () => {
    if (!window.confirm('确定清空全部通关记录吗？')) return;
    resetAll();
    loadLevel('easy', 0);
    toast('记录已清空', 'ri-delete-bin-line');
  });

  $('#btnHelp').addEventListener('click', () => $('#helpModal').classList.remove('hidden'));
  $('#helpModal').addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || e.target.id === 'helpModal') $('#helpModal').classList.add('hidden');
  });

  const KEY_DIR = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
  document.addEventListener('keydown', (e) => {
    if (!$('#winModal').classList.contains('hidden')) {
      if (e.key === 'Enter') go(1);
      return;
    }
    if (KEY_DIR[e.key]) {
      e.preventDefault();
      stopDemo();
      board.moveSelected(KEY_DIR[e.key]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      board.cycleSelect(e.shiftKey ? -1 : 1);
    } else if (e.key === 'z' || e.key === 'Backspace') {
      board.undo();
    } else if (e.key === 'r') {
      board.reset();
    } else if (e.key === 'h') {
      hint();
    }
  });
}

function init() {
  const total = Object.values(LEVELS).reduce((n, l) => n + l.length, 0);
  $('#levelTotal').textContent = total;
  bind();
  const last = getLast();
  const ok = getLevel(last.tier, last.index) && isUnlocked(last.tier, last.index);
  loadLevel(ok ? last.tier : 'easy', ok ? last.index : 0);
  $('#levelGrid').dataset.tier = app.tier;
  if (window.matchMedia('(max-width: 1023px)').matches) openDrawer();
}

init();
