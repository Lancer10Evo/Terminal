import { useState } from "react";
import { sfx } from "@/lib/sound";
import { useTerminal } from "@/store/terminal";
import { DraggableWindow } from "./DraggableWindow";

export function NotepadWindow({ id, onFocus }: { id: string; onFocus: () => void }) {
  const win = useTerminal((s) => s.windows[id]);
  const order = useTerminal((s) => s.order);
  const closeWindow = useTerminal((s) => s.closeWindow);
  const moveWindow = useTerminal((s) => s.moveWindow);
  const focusWindow = useTerminal((s) => s.focusWindow);
  const minimizeWindow = useTerminal((s) => s.minimizeWindow);
  const toggleMaximize = useTerminal((s) => s.toggleMaximize);
  const [text, setText] = useState("");

  if (!win) return null;
  const z = 10 + order.indexOf(id);

  return (
    <DraggableWindow
      title={win.title}
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
      <div className="flex h-full flex-col bg-white text-black">
        <div className="flex gap-3 border-b border-win-dark px-2 py-0.5 text-[11px]" data-no-drag>
          <span>Файл</span>
          <span>Правка</span>
          <span>Формат</span>
          <button
            type="button"
            className="ml-auto text-win-shadow hover:text-black"
            onClick={() => {
              sfx.click();
              setText("");
            }}
          >
            Очистить
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          data-no-drag
          placeholder="Начните печатать..."
          className="min-h-0 flex-1 resize-none border-0 bg-white px-3 py-2 font-term text-xs leading-5 text-black outline-none"
        />
      </div>
    </DraggableWindow>
  );
}
