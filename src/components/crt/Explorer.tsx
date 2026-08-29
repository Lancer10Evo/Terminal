import { useMemo, useState } from "react";
import { AlertTriangle, FileText, Folder, Mail } from "lucide-react";
import { ARCHIVE, ROOT_ID, type ArchiveNode } from "@/lib/archive";
import { useTerminal } from "@/store/terminal";
import { DraggableWindow } from "./DraggableWindow";

function Icon({ n }: { n: ArchiveNode }) {
  if (n.kind === "folder") return <Folder className="size-8 text-amber" strokeWidth={1.5} />;
  if (n.icon === "warn") return <AlertTriangle className="size-8 text-warn" strokeWidth={1.5} />;
  if (n.icon === "mail") return <Mail className="size-8 text-win-title" strokeWidth={1.5} />;
  return <FileText className="size-8 text-win-title" strokeWidth={1.5} />;
}

export function Explorer({ z, onFocus }: { z: number; onFocus: () => void }) {
  const path = useTerminal((s) => s.explorerPath);
  const setPath = useTerminal((s) => s.setExplorerPath);
  const openDoc = useTerminal((s) => s.openDoc);
  const [pos, setPos] = useState({ x: 90, y: 28 });

  const folder = ARCHIVE[path] ?? ARCHIVE[ROOT_ID];
  const items = useMemo(() => {
    const ids = folder?.children ?? [];
    return ids.map((id) => ARCHIVE[id]).filter((n): n is ArchiveNode => Boolean(n));
  }, [folder]);

  const crumbs: ArchiveNode[] = [];
  if (folder && folder.id !== ROOT_ID) {
    crumbs.push(ARCHIVE[ROOT_ID]!);
    crumbs.push(folder);
  } else if (folder) {
    crumbs.push(folder);
  }

  function activate(n: ArchiveNode) {
    if (n.kind === "folder") setPath(n.id);
    else openDoc(n.id);
  }

  const parentId = folder && folder.id !== ROOT_ID ? ROOT_ID : null;

  return (
    <DraggableWindow
      title="Проводник — C:\\FOUNDATION\\SCP-7843"
      x={pos.x}
      y={pos.y}
      w={500}
      h={270}
      z={z}
      onMove={(nx, ny) => setPos({ x: nx, y: ny })}
      onFocus={onFocus}
    >
      <div className="flex h-full flex-col bg-win-face text-xs text-black">
        <div className="flex gap-3 border-b border-win-dark px-2 py-0.5 text-[11px]">
          <span>Файл</span>
          <span>Правка</span>
          <span>Вид</span>
          <span>Справка</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="text-win-shadow">Адрес</span>
          <div className="win98-inset flex-1 truncate px-1 py-0.5">
            C:\\FOUNDATION\\{crumbs.map((c) => c.name).join("\\")}
          </div>
        </div>
        <div className="flex min-h-0 flex-1 px-1 pb-1">
          <div className="win98-inset w-36 shrink-0 overflow-auto p-1">
            <button
              type="button"
              className="flex w-full items-center gap-1 px-1 py-1 text-left hover:bg-win-title hover:text-white"
              onClick={() => setPath(ROOT_ID)}
            >
              <Folder className="size-3.5" /> SCP-7843
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-1 px-1 py-1 pl-4 text-left hover:bg-win-title hover:text-white"
              onClick={() => setPath("addenda")}
            >
              <Folder className="size-3.5" /> ADDENDA
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-1 px-1 py-1 pl-4 text-left hover:bg-win-title hover:text-white"
              onClick={() => setPath("logs")}
            >
              <Folder className="size-3.5" /> LOGS
            </button>
          </div>
          <div className="win98-inset min-w-0 flex-1 overflow-auto p-2">
            {parentId ? (
              <button
                type="button"
                className="mb-1 flex min-h-11 w-full items-center gap-2 px-1 py-1 text-left hover:bg-win-title hover:text-white"
                onClick={() => setPath(parentId)}
              >
                ..
              </button>
            ) : null}
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="flex min-h-11 flex-col items-center gap-1 px-1 py-2 text-center hover:bg-win-title hover:text-white"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => activate(n)}
                >
                  <Icon n={n} />
                  <span className="w-full truncate">{n.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-win-dark px-2 py-0.5 text-[11px] text-win-shadow">
          {items.length} объект(ов) · КЛАССИФИЦИРОВАНО 4/7843
        </div>
      </div>
    </DraggableWindow>
  );
}
