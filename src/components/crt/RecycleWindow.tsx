import { FileText, Trash2 } from "lucide-react";
import { ARCHIVE } from "@/lib/archive";
import { sfx } from "@/lib/sound";
import { useTerminal } from "@/store/terminal";
import { DraggableWindow } from "./DraggableWindow";

export function RecycleWindow({ id, onFocus }: { id: string; onFocus: () => void }) {
  const win = useTerminal((s) => s.windows[id]);
  const order = useTerminal((s) => s.order);
  const closeWindow = useTerminal((s) => s.closeWindow);
  const moveWindow = useTerminal((s) => s.moveWindow);
  const focusWindow = useTerminal((s) => s.focusWindow);
  const minimizeWindow = useTerminal((s) => s.minimizeWindow);
  const toggleMaximize = useTerminal((s) => s.toggleMaximize);
  const recycleBin = useTerminal((s) => s.recycleBin);
  const restoreFromRecycle = useTerminal((s) => s.restoreFromRecycle);
  const emptyRecycle = useTerminal((s) => s.emptyRecycle);

  if (!win) return null;
  const z = 10 + order.indexOf(id);
  const items = recycleBin.map((nid) => ARCHIVE[nid]).filter(Boolean);

  return (
    <DraggableWindow
      title="Корзина"
      x={win.x}
      y={win.y}
      w={win.w}
      h={win.h}
      z={z}
      minimized={win.minimized}
      maximized={win.maximized}
      onMove={(nx, ny) => moveWindow(id, nx, ny)}
      onFocus={() => {
        focusWindow(id);
        onFocus();
      }}
      onMinimize={() => minimizeWindow(id)}
      onToggleMaximize={() => toggleMaximize(id)}
      onClose={() => {
        sfx.close();
        closeWindow(id);
      }}
    >
      <div className="flex h-full flex-col bg-win-face text-xs text-black">
        <div className="flex items-center justify-between border-b border-win-dark px-2 py-1">
          <span>Объектов в корзине: {items.length}</span>
          <button
            type="button"
            className="win98 px-2 py-0.5 text-[11px] disabled:opacity-50"
            disabled={items.length === 0}
            data-no-drag
            onClick={() => {
              sfx.close();
              emptyRecycle();
            }}
          >
            Очистить корзину
          </button>
        </div>
        <div className="win98-inset m-1 min-h-0 flex-1 overflow-auto p-2">
          {items.length === 0 ? (
            <p className="p-3 text-center text-win-shadow">Корзина пуста</p>
          ) : (
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {items.map((n) =>
                n ? (
                  <button
                    key={n.id}
                    type="button"
                    data-no-drag
                    className="flex flex-col items-center gap-1 px-1 py-2 text-center hover:bg-win-title hover:text-white"
                    onClick={() => {
                      sfx.click();
                      restoreFromRecycle(n.id);
                    }}
                    title="Восстановить"
                  >
                    <FileText className="size-8 text-win-title" strokeWidth={1.5} />
                    <span className="w-full truncate">{n.name}</span>
                    <span className="flex items-center gap-1 text-[10px] text-win-shadow">
                      <Trash2 className="size-3" /> Восстановить
                    </span>
                  </button>
                ) : null,
              )}
            </div>
          )}
        </div>
      </div>
    </DraggableWindow>
  );
}
