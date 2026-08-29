import { create } from "zustand";
import { ARCHIVE } from "@/lib/archive";

export type Phase = "off" | "warming" | "ready" | "script" | "access" | "desktop";
export type WinType = "cmd" | "explorer" | "doc" | "notepad" | "paint" | "recycle";
export type Theme = "crt" | "win98";

export type Rect = { x: number; y: number; w: number; h: number };

export type WinState = Rect & {
  id: string;
  type: WinType;
  title: string;
  minimized: boolean;
  maximized: boolean;
  prevRect?: Rect;
  docId?: string;
};

export type IconState = { id: string; name: string; x: number; y: number };

const DEFAULT_ICONS: IconState[] = [
  { id: "icon-mycomputer", name: "Мой компьютер", x: 14, y: 14 },
  { id: "icon-scp", name: "SCP-7843", x: 14, y: 104 },
  { id: "icon-recycle", name: "Корзина", x: 14, y: 194 },
];

const DEFAULT_CMD: WinState = {
  id: "cmd",
  type: "cmd",
  title: "C:\\WINDOWS\\system32\\cmd.exe",
  x: 16,
  y: 12,
  w: 460,
  h: 240,
  minimized: false,
  maximized: false,
};

const DEFAULT_EXPLORER: WinState = {
  id: "explorer",
  type: "explorer",
  title: "Проводник — C:\\FOUNDATION\\SCP-7843",
  x: 90,
  y: 28,
  w: 500,
  h: 270,
  minimized: false,
  maximized: false,
};

let notepadSeq = 0;
let paintSeq = 0;

type TerminalState = {
  phase: Phase;
  explorerPath: string;
  accessFails: number;

  windows: Record<string, WinState>;
  order: string[];

  icons: IconState[];
  selectedIcon: string | null;

  recycleBin: string[];

  theme: Theme;
  soundOn: boolean;
  startMenuOpen: boolean;

  powerOn: () => void;
  finishWarmup: () => void;
  beginScript: () => void;
  finishScript: () => void;
  grantAccess: () => void;
  failAccess: () => void;
  powerOff: () => void;

  setExplorerPath: (id: string) => void;

  openWindow: (w: Omit<WinState, "minimized" | "maximized">) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  isTopWindow: (id: string) => boolean;

  openDoc: (id: string) => void;
  closeDoc: (id: string) => void;
  openNotepad: () => void;
  openPaint: () => void;
  openRecycle: () => void;

  moveIcon: (id: string, x: number, y: number) => void;
  selectIcon: (id: string | null) => void;
  arrangeIcons: () => void;
  activateIcon: (id: string) => void;

  sendToRecycle: (id: string) => void;
  restoreFromRecycle: (id: string) => void;
  emptyRecycle: () => void;

  toggleTheme: () => void;
  toggleSound: () => void;
  setStartMenuOpen: (v: boolean) => void;
};

export const useTerminal = create<TerminalState>((set, get) => ({
  phase: "off",
  explorerPath: "scp-7843",
  accessFails: 0,

  windows: { cmd: { ...DEFAULT_CMD } },
  order: ["cmd"],

  icons: [],
  selectedIcon: null,

  recycleBin: [],

  theme: "crt",
  soundOn: true,
  startMenuOpen: false,

  powerOn: () => set({ phase: "warming" }),
  finishWarmup: () => set({ phase: "ready" }),
  beginScript: () => set({ phase: "script" }),
  finishScript: () => set({ phase: "access" }),
  grantAccess: () =>
    set((s) => ({
      phase: "desktop",
      explorerPath: "scp-7843",
      icons: s.icons.length ? s.icons : DEFAULT_ICONS.map((i) => ({ ...i })),
      windows: { ...s.windows, explorer: { ...DEFAULT_EXPLORER } },
      order: [...s.order.filter((id) => id !== "explorer"), "explorer"],
    })),
  failAccess: () => set((s) => ({ accessFails: s.accessFails + 1 })),
  powerOff: () =>
    set({
      phase: "off",
      explorerPath: "scp-7843",
      accessFails: 0,
      windows: { cmd: { ...DEFAULT_CMD } },
      order: ["cmd"],
      icons: [],
      selectedIcon: null,
      startMenuOpen: false,
      recycleBin: [],
    }),

  setExplorerPath: (id) => {
    set({ explorerPath: id });
    get().focusWindow("explorer");
  },

  openWindow: (w) =>
    set((s) => {
      const existing = s.windows[w.id];
      if (existing) {
        return {
          windows: { ...s.windows, [w.id]: { ...existing, minimized: false } },
          order: [...s.order.filter((id) => id !== w.id), w.id],
        };
      }
      return {
        windows: { ...s.windows, [w.id]: { ...w, minimized: false, maximized: false } },
        order: [...s.order, w.id],
      };
    }),

  closeWindow: (id) =>
    set((s) => {
      const rest = { ...s.windows };
      delete rest[id];
      return { windows: rest, order: s.order.filter((x) => x !== id) };
    }),

  focusWindow: (id) =>
    set((s) => {
      if (!s.windows[id]) return {};
      return {
        windows: { ...s.windows, [id]: { ...s.windows[id], minimized: false } },
        order: [...s.order.filter((x) => x !== id), id],
      };
    }),

  moveWindow: (id, x, y) =>
    set((s) => (s.windows[id] ? { windows: { ...s.windows, [id]: { ...s.windows[id], x, y } } } : {})),

  minimizeWindow: (id) =>
    set((s) => (s.windows[id] ? { windows: { ...s.windows, [id]: { ...s.windows[id], minimized: true } } } : {})),

  toggleMaximize: (id) =>
    set((s) => {
      const w = s.windows[id];
      if (!w) return {};
      if (w.maximized) {
        const prev = w.prevRect ?? { x: w.x, y: w.y, w: w.w, h: w.h };
        return {
          windows: {
            ...s.windows,
            [id]: { ...w, maximized: false, x: prev.x, y: prev.y, w: prev.w, h: prev.h, prevRect: undefined },
          },
        };
      }
      return {
        windows: {
          ...s.windows,
          [id]: { ...w, maximized: true, prevRect: { x: w.x, y: w.y, w: w.w, h: w.h } },
        },
      };
    }),

  isTopWindow: (id) => {
    const s = get();
    const visible = s.order.filter((wid) => !s.windows[wid]?.minimized);
    return visible[visible.length - 1] === id;
  },

  openDoc: (id) => {
    const node = ARCHIVE[id];
    get().openWindow({
      id: `doc:${id}`,
      type: "doc",
      title: `Блокнот — ${node?.name ?? id}`,
      x: 72 + (id.length % 5) * 12,
      y: 28 + (id.length % 4) * 10,
      w: 420,
      h: 250,
      docId: id,
    });
  },
  closeDoc: (id) => get().closeWindow(`doc:${id}`),

  openNotepad: () => {
    notepadSeq += 1;
    const n = notepadSeq;
    get().openWindow({
      id: `notepad:${n}`,
      type: "notepad",
      title: "Блокнот — Безымянный",
      x: 60 + (n % 5) * 16,
      y: 40 + (n % 4) * 12,
      w: 360,
      h: 260,
    });
  },
  openPaint: () => {
    paintSeq += 1;
    const n = paintSeq;
    get().openWindow({
      id: `paint:${n}`,
      type: "paint",
      title: "Paint — Безымянный",
      x: 70 + (n % 5) * 16,
      y: 34 + (n % 4) * 12,
      w: 360,
      h: 280,
    });
  },
  openRecycle: () => {
    get().openWindow({
      id: "recycle",
      type: "recycle",
      title: "Корзина",
      x: 130,
      y: 50,
      w: 340,
      h: 240,
    });
  },

  moveIcon: (id, x, y) => set((s) => ({ icons: s.icons.map((ic) => (ic.id === id ? { ...ic, x, y } : ic)) })),
  selectIcon: (id) => set({ selectedIcon: id }),
  arrangeIcons: () => set({ icons: DEFAULT_ICONS.map((i) => ({ ...i })) }),
  activateIcon: (id) => {
    if (id === "icon-recycle") {
      get().openRecycle();
      return;
    }
    get().setExplorerPath("scp-7843");
    get().openWindow(get().windows.explorer ?? { ...DEFAULT_EXPLORER });
  },

  sendToRecycle: (id) => {
    get().closeDoc(id);
    set((s) => (s.recycleBin.includes(id) ? {} : { recycleBin: [...s.recycleBin, id] }));
  },
  restoreFromRecycle: (id) => set((s) => ({ recycleBin: s.recycleBin.filter((x) => x !== id) })),
  emptyRecycle: () => set({ recycleBin: [] }),

  toggleTheme: () => set((s) => ({ theme: s.theme === "crt" ? "win98" : "crt" })),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  setStartMenuOpen: (v) => set({ startMenuOpen: v }),
}));
