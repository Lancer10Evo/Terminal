import { ARCHIVE } from "@/lib/archive";
import { sfx } from "@/lib/sound";
import { useTerminal } from "@/store/terminal";
import { DraggableWindow } from "./DraggableWindow";

export function DocWindow({ id, onFocus }: { id: string; onFocus: () => void }) {
  const node = ARCHIVE[id];
  const winId = `doc:${id}`;
  const win = useTerminal((s) => s.windows[winId]);
  const order = useTerminal((s) => s.order);
  const closeDoc = useTerminal((s) => s.closeDoc);
  const moveWindow = useTerminal((s) => s.moveWindow);
  const focusWindow = useTerminal((s) => s.focusWindow);
  const minimizeWindow = useTerminal((s) => s.minimizeWindow);
  const toggleMaximize = useTerminal((s) => s.toggleMaximize);

  if (!node || !win) return null;
  const z = 10 + order.indexOf(winId);

  return (
    <DraggableWindow
      title={`Блокнот — ${node.name}`}
      x={win.x}
      y={win.y}
      w={win.w}
      h={win.h}
      z={z}
      minimized={win.minimized}
      maximized={win.maximized}
      onMove={(nx, ny) => moveWindow(winId, nx, ny)}
      onFocus={() => {
        focusWindow(winId);
        onFocus();
      }}
      onMinimize={() => minimizeWindow(winId)}
      onToggleMaximize={() => toggleMaximize(winId)}
      onClose={() => {
        sfx.close();
        closeDoc(id);
      }}
    >
      <div className="flex h-full flex-col bg-white text-black">
        <div className="border-b border-win-dark px-2 py-0.5 text-[11px] text-warn">
          ITEM SCP-7843 · LEVEL 4 · {node.name}
        </div>
        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap px-3 py-2 font-term text-xs leading-5">
          {node.body}
        </pre>
      </div>
    </DraggableWindow>
  );
}
