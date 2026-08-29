import { useState } from "react";
import { ARCHIVE } from "@/lib/archive";
import { useTerminal } from "@/store/terminal";
import { DraggableWindow } from "./DraggableWindow";

export function DocWindow({ id, z, onFocus }: { id: string; z: number; onFocus: () => void }) {
  const node = ARCHIVE[id];
  const closeDoc = useTerminal((s) => s.closeDoc);
  const [pos, setPos] = useState({
    x: 72 + (id.length % 5) * 12,
    y: 28 + (id.length % 4) * 10,
  });

  if (!node) return null;

  return (
    <DraggableWindow
      title={`Блокнот — ${node.name}`}
      x={pos.x}
      y={pos.y}
      w={420}
      h={250}
      z={z}
      onMove={(nx, ny) => setPos({ x: nx, y: ny })}
      onFocus={onFocus}
      onClose={() => closeDoc(id)}
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
