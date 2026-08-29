import { create } from "zustand";

export type MenuItem = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
};

type ContextMenuState = {
  open: boolean;
  x: number;
  y: number;
  items: MenuItem[];
  show: (x: number, y: number, items: MenuItem[]) => void;
  hide: () => void;
};

export const useContextMenu = create<ContextMenuState>((set) => ({
  open: false,
  x: 0,
  y: 0,
  items: [],
  show: (x, y, items) => set({ open: true, x, y, items }),
  hide: () => set({ open: false, items: [] }),
}));
