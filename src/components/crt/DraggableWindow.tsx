import { useCallback, useRef, type PointerEvent, type ReactNode } from "react";

type Props = {
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  onMove: (x: number, y: number) => void;
  onFocus: () => void;
  onClose?: () => void;
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
  onMove,
  onFocus,
  onClose,
  variant = "win",
  children,
}: Props) {
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      onFocus();
      const target = e.target as HTMLElement;
      if (target.closest("[data-no-drag]")) return;
      drag.current = { dx: e.clientX - x, dy: e.clientY - y };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [onFocus, x, y],
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
        left: x,
        top: y,
        width: w,
        maxWidth: "calc(100% - 12px)",
        height: h,
        maxHeight: "calc(100% - 12px)",
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
      >
        <span className="truncate pl-1 text-[11px] font-bold">{title}</span>
        <div className="flex gap-px" data-no-drag>
          {onClose ? (
            <button type="button" className="win-btn" onClick={onClose} aria-label="Закрыть">
              ×
            </button>
          ) : (
            <span className="win-btn">×</span>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
