import { create } from "zustand";

export type Phase = "off" | "warming" | "ready" | "script" | "access" | "desktop";

type TerminalState = {
  phase: Phase;
  explorerPath: string;
  openDocs: string[];
  focusedWin: "cmd" | "explorer" | "doc";
  accessFails: number;
  powerOn: () => void;
  finishWarmup: () => void;
  beginScript: () => void;
  finishScript: () => void;
  grantAccess: () => void;
  failAccess: () => void;
  setExplorerPath: (id: string) => void;
  openDoc: (id: string) => void;
  closeDoc: (id: string) => void;
  focus: (w: TerminalState["focusedWin"]) => void;
  powerOff: () => void;
};

export const useTerminal = create<TerminalState>((set) => ({
  phase: "off",
  explorerPath: "scp-7843",
  openDocs: [],
  focusedWin: "cmd",
  accessFails: 0,
  powerOn: () => set({ phase: "warming" }),
  finishWarmup: () => set({ phase: "ready" }),
  beginScript: () => set({ phase: "script" }),
  finishScript: () => set({ phase: "access" }),
  grantAccess: () =>
    set({
      phase: "desktop",
      focusedWin: "explorer",
      explorerPath: "scp-7843",
    }),
  failAccess: () => set((s) => ({ accessFails: s.accessFails + 1 })),
  setExplorerPath: (id) => set({ explorerPath: id, focusedWin: "explorer" }),
  openDoc: (id) =>
    set((s) => ({
      openDocs: s.openDocs.includes(id) ? s.openDocs : [...s.openDocs, id],
      focusedWin: "doc",
    })),
  closeDoc: (id) =>
    set((s) => ({
      openDocs: s.openDocs.filter((d) => d !== id),
      focusedWin: "explorer",
    })),
  focus: (w) => set({ focusedWin: w }),
  powerOff: () =>
    set({
      phase: "off",
      explorerPath: "scp-7843",
      openDocs: [],
      focusedWin: "cmd",
      accessFails: 0,
    }),
}));
