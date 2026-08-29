import { useCallback, useRef, type MouseEvent, type PointerEvent } from "react";
import { Folder, Monitor, Trash2 } from "lucide-react";
import { sfx } from "@/lib/sound";
import { useContextMenu } from "@/store/contextMenu";
import { useTerminal } from "@/store/terminal";

function IconGlyph({ id }: { id: string }) {
  if (id === "icon-recycle") return <Trash2 className="size-8 text-white drop-shadow" strokeWidth={1.5} />;
  if (id === "icon-scp") return <Folder className="size-8 text-amber drop-shadow" strokeWidth={1.5} />;
  return <Monitor className="size-8 text-white drop-shadow" strokeWidth={1.5} />;
}

export function DesktopIcons() {
  const icons = useTerminal((s) => s.icons);
  const selectedIcon = useTerminal((s) => s.selectedIcon);
  const selectIcon = useTerminal((s) => s.selectIcon);
  const moveIcon = useTerminal((s) => s.moveIcon);
  const activateIcon = useTerminal((s) => s.activateIcon);
  const arrangeIcons = useTerminal((s) => s.arrangeIcons);
  const showMenu = useContextMenu((s) => s.show);

  const drag = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);
  const lastTap = useRef<{ id: string; t: number } | null>(null);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLButtonElement>, id: string, x: number, y: number) => {
      selectIcon(id);
      drag.current = { id, dx: e.clientX - x, dy: e.clientY - y, moved: false };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [selectIcon],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (!drag.current) return;
      drag.current.moved = true;
      moveIcon(drag.current.id, e.clientX - drag.current.dx, e.clientY - drag.current.dy);
    },
    [moveIcon],
  );

  function onPointerUp(id: string) {
    const wasDrag = drag.current?.moved;
    drag.current = null;
    if (wasDrag) return;
    const now = Date.now();
    if (lastTap.current && lastTap.current.id === id && now - lastTap.current.t < 400) {
      sfx.open();
      activateIcon(id);
      lastTap.current = null;
    } else {
      sfx.click();
      lastTap.current = { id, t: now };
    }
  }

  function onIconContextMenu(e: MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    selectIcon(id);
    const rect = (e.currentTarget.closest(".crt-screen") as HTMLElement)?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : e.clientX;
    const y = rect ? e.clientY - rect.top : e.clientY;
    showMenu(x, y, [
      { label: "Открыть", onClick: () => activateIcon(id) },
      { divider: true, label: "" },
      { label: "Свойства", onClick: () => {} },
    ]);
  }

  function onDesktopContextMenu(e: MouseEvent) {
    e.preventDefault();
    const rect = (e.currentTarget.closest(".crt-screen") as HTMLElement)?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : e.clientX;
    const y = rect ? e.clientY - rect.top : e.clientY;
    const openNotepad = useTerminal.getState().openNotepad;
    const openPaint = useTerminal.getState().openPaint;
    const toggleTheme = useTerminal.getState().toggleTheme;
    showMenu(x, y, [
      { label: "Обновить", onClick: () => {} },
      { label: "Упорядочить значки", onClick: () => arrangeIcons() },
      { divider: true, label: "" },
      { label: "Создать текстовый документ", onClick: () => openNotepad() },
      { label: "Создать рисунок Paint", onClick: () => openPaint() },
      { divider: true, label: "" },
      { label: "Сменить тему", onClick: () => toggleTheme() },
    ]);
  }

  return (
    <div
      className="absolute inset-0 z-10"
      onPointerDown={() => selectIcon(null)}
      onContextMenu={onDesktopContextMenu}
    >
      {icons.map((ic) => (
        <button
          key={ic.id}
          type="button"
          className="absolute flex w-16 flex-col items-center gap-1 rounded-sm px-1 py-1 text-[11px] text-white"
          style={{
            left: ic.x,
            top: ic.y,
            background: selectedIcon === ic.id ? "rgba(0,0,128,0.55)" : "transparent",
            outline: selectedIcon === ic.id ? "1px dotted #fff" : "none",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            onPointerDown(e, ic.id, ic.x, ic.y);
          }}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => {
            e.stopPropagation();
            onPointerUp(ic.id);
          }}
          onContextMenu={(e) => onIconContextMenu(e, ic.id)}
        >
          <IconGlyph id={ic.id} />
          <span className="w-full truncate text-center drop-shadow">{ic.name}</span>
        </button>
      ))}
    </div>
  );
}
