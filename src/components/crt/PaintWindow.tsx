import { useRef, useState, type PointerEvent } from "react";
import { sfx } from "@/lib/sound";
import { useTerminal } from "@/store/terminal";
import { DraggableWindow } from "./DraggableWindow";

const COLORS = ["#000000", "#ffffff", "#c41e3a", "#e8a317", "#6bff4d", "#1084d0", "#808080"];

export function PaintWindow({ id, onFocus }: { id: string; onFocus: () => void }) {
  const win = useTerminal((s) => s.windows[id]);
  const order = useTerminal((s) => s.order);
  const closeWindow = useTerminal((s) => s.closeWindow);
  const moveWindow = useTerminal((s) => s.moveWindow);
  const focusWindow = useTerminal((s) => s.focusWindow);
  const minimizeWindow = useTerminal((s) => s.minimizeWindow);
  const toggleMaximize = useTerminal((s) => s.toggleMaximize);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState("#000000");
  const [brush, setBrush] = useState(3);

  function pos(e: PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function down(e: PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    last.current = pos(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function move(e: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const p = pos(e);
    if (!ctx || !last.current) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = brush;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  }

  function up() {
    drawing.current = false;
    last.current = null;
  }

  function clear() {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
  }

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
      <div className="flex h-full flex-col bg-win-face text-black">
        <div className="flex flex-wrap items-center gap-1 border-b border-win-dark p-1" data-no-drag>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => {
                sfx.click();
                setColor(c);
              }}
              className="size-4 shrink-0 border"
              style={{
                background: c,
                borderColor: color === c ? "#000080" : "#808080",
                borderWidth: color === c ? 2 : 1,
              }}
            />
          ))}
          <input
            type="range"
            min={1}
            max={12}
            value={brush}
            onChange={(e) => setBrush(Number(e.target.value))}
            className="mx-1 w-16"
          />
          <button
            type="button"
            className="win98 ml-auto px-2 py-0.5 text-[11px]"
            onClick={() => {
              sfx.click();
              clear();
            }}
          >
            Очистить
          </button>
        </div>
        <div className="win98-inset m-1 min-h-0 flex-1 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={400}
            height={220}
            data-no-drag
            className="h-full w-full touch-none bg-white"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerLeave={up}
          />
        </div>
      </div>
    </DraggableWindow>
  );
}
