// 轻量音效：WebAudio 合成，无需外部音频文件
let ctx = null;
let enabled = true;

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, duration, type = 'sine', gain = 0.12, delay = 0) {
  if (!enabled) return;
  const ac = ensureCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const t0 = ac.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sound = {
  setEnabled(v) {
    enabled = Boolean(v);
  },
  isEnabled() {
    return enabled;
  },
  move() {
    tone(320, 0.09, 'triangle', 0.1);
    tone(480, 0.06, 'sine', 0.05, 0.03);
  },
  blocked() {
    tone(140, 0.12, 'square', 0.04);
  },
  undo() {
    tone(420, 0.07, 'triangle', 0.08);
    tone(300, 0.08, 'triangle', 0.06, 0.05);
  },
  hint() {
    tone(660, 0.1, 'sine', 0.08);
    tone(880, 0.12, 'sine', 0.06, 0.08);
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'triangle', 0.12, i * 0.12));
  }
};
