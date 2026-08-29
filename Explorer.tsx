import { useMemo, type MouseEvent } from "react";
import { AlertTriangle, FileText, Folder, Mail } from "lucide-react";
import { ARCHIVE, ROOT_ID, type ArchiveNode } from "@/lib/archive";
import { sfx } from "@/lib/sound";
import { useContextMenu } from "@/store/contextMenu";
import { useTerminal } from "@/store/terminal";
import { DraggableWindow } from "./DraggableWindow";

function Icon({ n }: { n: ArchiveNode }) {
  if (n.kind === "folder") return <Folder className="size-8 text-amber" strokeWidth={1.5} />;
  if (n.icon === "warn") return <AlertTriangle className="size-8 text-warn" strokeWidth={1.5} />;
  if (n.icon === "mail") return <Mail className="size-8 text-win-title" strokeWidth={1.5} />;
  return <FileText className="size-8 text-win-title" strokeWidth={1.5} />;
}

export function Explorer({ onFocus }: { onFocus: () => void }) {
  const path = useTerminal((s) => s.explorerPath);
  const setPath = useTerminal((s) => s.setExplorerPath);
  const openDoc = useTerminal((s) => s.openDoc);
  const sendToRecycle = useTerminal((s) => s.sendToRecycle);
  const recycleBin = useTerminal((s) => s.recycleBin);

  const win = useTerminal((s) => s.windows.explorer);
  const order = useTerminal((s) => s.order);
  const moveWindow = useTerminal((s) => s.moveWindow);
  const focusWindow = useTerminal((s) => s.focusWindow);
  const minimizeWindow = useTerminal((s) => s.minimizeWindow);
  const toggleMaximize = useTerminal((s) => s.toggleMaximize);
  const showMenu = useContextMenu((s) => s.show);

  const folder = ARCHIVE[path] ?? ARCHIVE[ROOT_ID];
  const items = useMemo(() => {
    const ids = folder?.children ?? [];
    return ids
      .map((id) => ARCHIVE[id])
      .filter((n): n is ArchiveNode => Boolean(n) && !recycleBin.includes(n.id));
  }, [folder, recycleBin]);

  const crumbs: ArchiveNode[] = [];
  if (folder && folder.id !== ROOT_ID) {
    crumbs.push(ARCHIVE[ROOT_ID]!);
    crumbs.push(folder);
  } else if (folder) {
    crumbs.push(folder);
  }

  function activate(n: ArchiveNode) {
    sfx.click();
    if (n.kind === "folder") setPath(n.id);
    else openDoc(n.id);
  }

  function onItemContextMenu(e: MouseEvent, n: ArchiveNode) {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget.closest(".crt-screen") as HTMLElement)?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : e.clientX;
    const y = rect ? e.clientY - rect.top : e.clientY;
    showMenu(x, y, [
      { label: "Открыть", onClick: () => activate(n) },
      {
        label: "Удалить",
        disabled: n.kind === "folder",
        onClick: () => {
          sfx.close();
          sendToRecycle(n.id);
        },
      },
      { divider: true, label: "" },
      { label: "Свойства", onClick: () => {} },
    ]);
  }

  const parentId = folder && folder.id !== ROOT_ID ? ROOT_ID : null;

  if (!win) return null;
  const z = 10 + order.indexOf("explorer");

  return (
    <DraggableWindow
      title="Проводник — C:\\FOUNDATION\\SCP-7843"
      x={win.x}
      y={win.y}
      w={win.w}
      h={win.h}
      z={z}
      minimized={win.minimized}
      maximized={win.maximized}
      onMove={(nx, ny) => moveWindow("explorer", nx, ny)}
      onFocus={() => {
        focusWindow("explorer");
        onFocus();
      }}
      onMinimize={() => minimizeWindow("explorer")}
      onToggleMaximize={() => toggleMaximize("explorer")}
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
            C:\\FOUNDATION\\{crumbs.map((c) => c.name).join("\\\\")}
          </div>
        </div>
        <div className="flex min-h-0 flex-1 px-1 pb-1">
          <div className="win98-inset w-36 shrink-0 overflow-auto p-1">
            <button
              type="button"
              className="flex w-full items-center gap-1 px-1 py-1 text-left hover:bg-win-title hover:text-white"
              onClick={() => {
                sfx.click();
                setPath(ROOT_ID);
              }}
            >
              <Folder className="size-3.5" /> SCP-7843
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-1 px-1 py-1 pl-4 text-left hover:bg-win-title hover:text-white"
              onClick={() => {
                sfx.click();
                setPath("addenda");
              }}
            >
              <Folder className="size-3.5" /> ADDENDA
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-1 px-1 py-1 pl-4 text-left hover:bg-win-title hover:text-white"
              onClick={() => {
                sfx.click();
                setPath("logs");
              }}
            >
              <Folder className="size-3.5" /> LOGS
            </button>
          </div>
          <div className="win98-inset min-w-0 flex-1 overflow-auto p-2">
            {parentId ? (
              <button
                type="button"
                className="mb-1 flex min-h-11 w-full items-center gap-2 px-1 py-1 text-left hover:bg-win-title hover:text-white"
                onClick={() => {
                  sfx.click();
                  setPath(parentId);
                }}
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
                  onContextMenu={(e) => onItemContextMenu(e, n)}
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
