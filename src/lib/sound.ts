import { useTerminal } from "@/store/terminal";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!ctx) ctx = new AudioCtor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType = "square", gain = 0.045, delay = 0) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g).connect(ac.destination);
  const t0 = ac.currentTime + delay;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function enabled() {
  try {
    return useTerminal.getState().soundOn;
  } catch {
    return true;
  }
}

export const sfx = {
  click: () => {
    if (!enabled()) return;
    tone(1100, 0.03, "square", 0.03);
  },
  open: () => {
    if (!enabled()) return;
    tone(420, 0.06, "square", 0.04);
    tone(680, 0.09, "square", 0.04, 0.05);
  },
  close: () => {
    if (!enabled()) return;
    tone(680, 0.05, "square", 0.04);
    tone(320, 0.09, "square", 0.04, 0.04);
  },
  error: () => {
    if (!enabled()) return;
    tone(190, 0.16, "sawtooth", 0.05);
    tone(120, 0.22, "sawtooth", 0.05, 0.13);
  },
  startup: () => {
    if (!enabled()) return;
    tone(261.6, 0.14, "sine", 0.05);
    tone(329.6, 0.14, "sine", 0.05, 0.11);
    tone(392, 0.24, "sine", 0.05, 0.22);
  },
  shutdown: () => {
    if (!enabled()) return;
    tone(392, 0.12, "sine", 0.05);
    tone(261.6, 0.22, "sine", 0.05, 0.1);
  },
};
