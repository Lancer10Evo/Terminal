import { useCallback, useRef, type PointerEvent, type ReactNode } from "react";
import { sfx } from "@/lib/sound";

type Props = {
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized?: boolean;
  maximized?: boolean;
  onMove: (x: number, y: number) => void;
  onFocus: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
  onToggleMaximize?: () => void;
  variant?: "cmd" | "win";
  children: ReactNode;
};

export function DraggableWindow({
  title,
  x,
  y,
  w,
  h,
  z,
  minimized = false,
  maximized = false,
  onMove,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  variant = "win",
  children,
}: Props) {
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      onFocus();
      if (maximized) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-no-drag]")) return;
      drag.current = { dx: e.clientX - x, dy: e.clientY - y };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [onFocus, maximized, x, y],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!drag.current) return;
      onMove(e.clientX - drag.current.dx, e.clientY - drag.current.dy);
    },
    [onMove],
  );

  const onPointerUp = useCallback(() => {
    drag.current = null;
  }, []);

  const isCmd = variant === "cmd";

  return (
    <div
      className={isCmd ? "absolute flex flex-col overflow-hidden" : "win98 absolute flex flex-col"}
      style={{
        display: minimized ? "none" : "flex",
        left: maximized ? 2 : x,
        top: maximized ? 2 : y,
        width: maximized ? "calc(100% - 4px)" : w,
        maxWidth: "calc(100% - 4px)",
        height: maximized ? "calc(100% - 30px)" : h,
        maxHeight: "calc(100% - 30px)",
        zIndex: z,
        background: isCmd ? "var(--color-cmd-bg)" : undefined,
        border: isCmd ? "2px solid #6a6a6a" : undefined,
        boxShadow: isCmd ? "4px 4px 0 #00000088" : undefined,
      }}
      onPointerDown={onFocus}
    >
      <div
        className={
          isCmd
            ? "flex h-6 shrink-0 cursor-grab items-center justify-between bg-win-face px-1 text-black active:cursor-grabbing"
            : "win-titlebar flex h-6 shrink-0 cursor-grab items-center justify-between px-1 active:cursor-grabbing"
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => onToggleMaximize?.()}
      >
        <span className="truncate pl-1 text-[11px] font-bold">{title}</span>
        <div className="flex gap-px" data-no-drag>
          {onMinimize ? (
            <button
              type="button"
              className="win-btn"
              onClick={() => {
                sfx.click();
                onMinimize();
              }}
              aria-label="Свернуть"
            >
              _
            </button>
          ) : null}
          {onToggleMaximize ? (
            <button
              type="button"
              className="win-btn"
              onClick={() => {
                sfx.click();
                onToggleMaximize();
              }}
              aria-label={maximized ? "Восстановить" : "Развернуть"}
            >
              {maximized ? "❐" : "□"}
            </button>
          ) : null}
          {onClose ? (
            <button
              type="button"
              className="win-btn"
              onClick={() => {
                sfx.click();
                onClose();
              }}
              aria-label="Закрыть"
            >
              ×
            </button>
          ) : (
            <span className="win-btn opacity-50">×</span>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
