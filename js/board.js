// 棋盘组件：渲染 3D Q 版棋子，处理拖拽 / 点击 / 键盘移动、撤销、提示高亮与胜利动画
import { COLS, ROWS, SIZE, DIRS, buildGrid, canMove, serialize, isGoal } from './solver.js';
import { GENERALS } from './levels.js';

const DIR_ICON = { up: 'ri-arrow-up-line', down: 'ri-arrow-down-line', left: 'ri-arrow-left-line', right: 'ri-arrow-right-line' };
const TYPE_CLASS = { C: 'piece-c', H: 'piece-h', V: 'piece-v', S: 'piece-s' };

export class Board {
  constructor(root, handlers = {}) {
    this.root = root;
    this.handlers = handlers;
    this.pieces = [];
    this.history = [];
    this.locked = false;
    this.selected = -1;
    this.drag = null;
    this.root.innerHTML = `
      <div class="board-frame">
        <div class="board-inner" data-role="inner">
          ${Array.from({ length: COLS * ROWS }, () => '<div class="board-cell"></div>').join('')}
          <div class="goal-mark"><i class="ri-flag-2-line"></i><span>曹操目标</span></div>
          <div data-role="pieces" class="absolute inset-0"></div>
        </div>
        <div class="board-exit"><span>出 口</span></div>
      </div>`;
    this.inner = root.querySelector('[data-role="inner"]');
    this.layer = root.querySelector('[data-role="pieces"]');
    this.bindEvents();
  }

  load(level) {
    this.locked = false;
    this.history = [];
    this.selected = -1;
    this.pieces = level.pieces.map((p, id) => ({ id, type: p.type, r: p.r, c: p.c, general: p.general }));
    this.initial = this.pieces.map((p) => ({ ...p }));
    this.layer.innerHTML = this.pieces.map((p) => this.pieceHTML(p)).join('');
    this.layer.querySelectorAll('.piece').forEach((el, i) => {
      el.style.animationDelay = `${i * 40}ms`;
      el.classList.add('piece-enter');
      el.addEventListener('animationend', () => el.classList.remove('piece-enter'), { once: true });
    });
    this.updatePositions();
  }

  pieceHTML(p) {
    const g = GENERALS[p.general] || GENERALS.soldier;
    const { w, h } = SIZE[p.type];
    return `
      <div class="piece ${TYPE_CLASS[p.type]}" data-id="${p.id}" style="--tone:${g.tone};width:${w * 25}%;height:${h * 20}%">
        <div class="piece-body">
          <div class="piece-img" style="background-image:url('${g.img}')"></div>
          <div class="piece-gloss"></div>
          <div class="piece-name">${g.name}</div>
          <div class="piece-arrow hidden"><i></i></div>
        </div>
      </div>`;
  }

  el(id) {
    return this.layer.querySelector(`.piece[data-id="${id}"]`);
  }

  updatePositions() {
    this.pieces.forEach((p) => {
      const el = this.el(p.id);
      if (!el) return;
      el.style.left = `${p.c * 25}%`;
      el.style.top = `${p.r * 20}%`;
      el.classList.toggle('is-selected', p.id === this.selected);
    });
  }

  getState() {
    return serialize(this.pieces);
  }

  maxDist(id, dir) {
    const grid = buildGrid(this.pieces);
    if (!canMove(this.pieces, grid, id, dir, 1)) return 0;
    return canMove(this.pieces, grid, id, dir, 2) ? 2 : 1;
  }

  availableDirs(id) {
    return Object.keys(DIRS).filter((d) => this.maxDist(id, d) > 0);
  }

  pieceAtCell(index) {
    return this.pieces.find((p) => p.r * COLS + p.c === index) || null;
  }

  move(id, dir, dist = 1, opts = {}) {
    if (this.locked) return false;
    const max = this.maxDist(id, dir);
    if (max < dist || dist < 1) {
      this.shake(id);
      this.emit('blocked');
      return false;
    }
    const p = this.pieces[id];
    this.history.push({ id, r: p.r, c: p.c });
    p.r += DIRS[dir].dr * dist;
    p.c += DIRS[dir].dc * dist;
    this.clearHint();
    if (opts.fromDrag) this.settleFromDrag(id, opts.residualX || 0, opts.residualY || 0);
    this.updatePositions();
    this.emit('move', { steps: this.history.length, auto: Boolean(opts.auto) });
    if (isGoal(this.getState())) this.finish();
    return true;
  }

  settleFromDrag(id, rx, ry) {
    const el = this.el(id);
    if (!el) return;
    el.classList.add('no-anim');
    const p = this.pieces[id];
    el.style.left = `${p.c * 25}%`;
    el.style.top = `${p.r * 20}%`;
    el.style.transform = `translate(${rx}px, ${ry}px)`;
    void el.offsetWidth;
    el.classList.remove('no-anim');
    el.style.transform = '';
  }

  undo() {
    if (this.locked || !this.history.length) return false;
    const last = this.history.pop();
    const p = this.pieces[last.id];
    p.r = last.r;
    p.c = last.c;
    this.clearHint();
    this.updatePositions();
    this.emit('undo', { steps: this.history.length });
    return true;
  }

  reset() {
    this.locked = false;
    this.history = [];
    this.selected = -1;
    this.pieces = this.initial.map((p) => ({ ...p }));
    this.layer.querySelectorAll('.piece').forEach((el) => el.classList.remove('piece-exit'));
    this.clearHint();
    this.updatePositions();
    this.emit('reset', { steps: 0 });
  }

  showHint(move) {
    this.clearHint();
    const piece = this.pieceAtCell(move.from);
    if (!piece) return null;
    const el = this.el(piece.id);
    el.classList.add('is-hint');
    const arrow = el.querySelector('.piece-arrow');
    arrow.classList.remove('hidden');
    arrow.querySelector('i').className = `${DIR_ICON[move.dir]} text-2xl`;
    this.hintTimer = setTimeout(() => this.clearHint(), 3200);
    return piece.id;
  }

  clearHint() {
    clearTimeout(this.hintTimer);
    this.layer.querySelectorAll('.is-hint').forEach((el) => {
      el.classList.remove('is-hint');
      el.querySelector('.piece-arrow').classList.add('hidden');
    });
  }

  applySolverMove(move) {
    const piece = this.pieceAtCell(move.from);
    if (!piece) return false;
    return this.move(piece.id, move.dir, move.dist, { auto: true });
  }

  shake(id) {
    const el = this.el(id);
    if (!el) return;
    el.classList.remove('piece-shake');
    void el.offsetWidth;
    el.classList.add('piece-shake');
  }

  finish() {
    this.locked = true;
    this.selected = -1;
    const cao = this.pieces.find((p) => p.type === 'C');
    const el = cao && this.el(cao.id);
    setTimeout(() => {
      if (el) el.classList.add('piece-exit');
      this.emit('win', { steps: this.history.length });
    }, 260);
  }

  emit(name, payload) {
    const fn = this.handlers[name];
    if (typeof fn === 'function') fn(payload || {});
  }

  bindEvents() {
    this.layer.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('.piece');
      if (!el || this.locked) return;
      const id = Number(el.dataset.id);
      if (!Number.isInteger(id) || !this.pieces[id]) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      const rect = this.inner.getBoundingClientRect();
      this.drag = {
        id,
        el,
        x0: e.clientX,
        y0: e.clientY,
        cw: rect.width / COLS,
        ch: rect.height / ROWS,
        axis: null,
        ox: 0,
        oy: 0,
        limits: {
          up: this.maxDist(id, 'up'),
          down: this.maxDist(id, 'down'),
          left: this.maxDist(id, 'left'),
          right: this.maxDist(id, 'right')
        }
      };
      el.classList.add('no-anim', 'is-dragging');
    });

    this.layer.addEventListener('pointermove', (e) => {
      const d = this.drag;
      if (!d) return;
      const dx = e.clientX - d.x0;
      const dy = e.clientY - d.y0;
      if (!d.axis && Math.hypot(dx, dy) > 6) d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (d.axis === 'x') {
        d.ox = Math.max(-d.limits.left * d.cw, Math.min(d.limits.right * d.cw, dx));
        d.oy = 0;
      } else if (d.axis === 'y') {
        d.oy = Math.max(-d.limits.up * d.ch, Math.min(d.limits.down * d.ch, dy));
        d.ox = 0;
      }
      d.el.style.transform = `translate(${d.ox}px, ${d.oy}px)`;
    });

    const end = (e) => {
      const d = this.drag;
      if (!d) return;
      this.drag = null;
      d.el.classList.remove('is-dragging');
      const moved = Math.hypot(e.clientX - d.x0, e.clientY - d.y0);
      if (!d.axis || moved < 6) {
        d.el.classList.remove('no-anim');
        d.el.style.transform = '';
        this.handleTap(d.id, e);
        return;
      }
      const cell = d.axis === 'x' ? d.cw : d.ch;
      const offset = d.axis === 'x' ? d.ox : d.oy;
      const dist = Math.round(Math.abs(offset) / cell);
      if (dist === 0) {
        d.el.classList.remove('no-anim');
        d.el.style.transform = '';
        if (Math.abs(offset) < 2) this.emit('blocked');
        return;
      }
      const dir = d.axis === 'x' ? (offset > 0 ? 'right' : 'left') : offset > 0 ? 'down' : 'up';
      const residual = offset - Math.sign(offset) * dist * cell;
      const ok = this.move(d.id, dir, dist, {
        fromDrag: true,
        residualX: d.axis === 'x' ? residual : 0,
        residualY: d.axis === 'y' ? residual : 0
      });
      if (!ok) {
        d.el.classList.remove('no-anim');
        d.el.style.transform = '';
      }
    };
    this.layer.addEventListener('pointerup', end);
    this.layer.addEventListener('pointercancel', end);
  }

  // 点击：只有一个方向可走就直接走；多个方向则朝点击位置偏向的方向走
  handleTap(id, e) {
    const dirs = this.availableDirs(id);
    this.selected = id;
    if (!dirs.length) {
      this.updatePositions();
      this.shake(id);
      this.emit('blocked');
      return;
    }
    let dir = dirs[0];
    if (dirs.length > 1) {
      const rect = this.el(id).getBoundingClientRect();
      const vx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const vy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      let best = -Infinity;
      dirs.forEach((d) => {
        const score = DIRS[d].dc * vx + DIRS[d].dr * vy;
        if (score > best) {
          best = score;
          dir = d;
        }
      });
    }
    this.move(id, dir, 1);
  }

  moveSelected(dir) {
    if (this.selected < 0) {
      const movable = this.pieces.find((p) => this.maxDist(p.id, dir) > 0);
      if (!movable) return this.emit('blocked');
      this.selected = movable.id;
    }
    this.move(this.selected, dir, 1);
  }

  cycleSelect(step = 1) {
    if (!this.pieces.length) return;
    this.selected = (this.selected + step + this.pieces.length) % this.pieces.length;
    this.updatePositions();
  }
}
