import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sfx } from "@/lib/sound";
import { useTerminal } from "@/store/terminal";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);
  return now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function Taskbar() {
  const windows = useTerminal((s) => s.windows);
  const order = useTerminal((s) => s.order);
  const startMenuOpen = useTerminal((s) => s.startMenuOpen);
  const setStartMenuOpen = useTerminal((s) => s.setStartMenuOpen);
  const focusWindow = useTerminal((s) => s.focusWindow);
  const minimizeWindow = useTerminal((s) => s.minimizeWindow);
  const openNotepad = useTerminal((s) => s.openNotepad);
  const openPaint = useTerminal((s) => s.openPaint);
  const openRecycle = useTerminal((s) => s.openRecycle);
  const setExplorerPath = useTerminal((s) => s.setExplorerPath);
  const theme = useTerminal((s) => s.theme);
  const toggleTheme = useTerminal((s) => s.toggleTheme);
  const soundOn = useTerminal((s) => s.soundOn);
  const toggleSound = useTerminal((s) => s.toggleSound);
  const powerOff = useTerminal((s) => s.powerOff);
  const clock = useClock();

  const topId = order.filter((id) => !windows[id]?.minimized).at(-1);

  function taskClick(id: string) {
    sfx.click();
    const w = windows[id];
    if (!w) return;
    if (w.minimized || id !== topId) focusWindow(id);
    else minimizeWindow(id);
  }

  function menuAction(fn: () => void) {
    sfx.click();
    setStartMenuOpen(false);
    fn();
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-[80]">
      {startMenuOpen ? (
        <>
          <div className="fixed inset-0" onPointerDown={() => setStartMenuOpen(false)} />
          <div className="win98 absolute bottom-[26px] left-0 w-48 py-1">
            <div className="mb-1 flex items-center gap-2 border-b border-win-dark pb-1 pl-2 text-[11px] font-bold text-win-title">
              FOUNDATION 98
            </div>
            {[
              { label: "Проводник", onClick: () => setExplorerPath("scp-7843") },
              { label: "Командная строка", onClick: () => focusWindow("cmd") },
              { label: "Блокнот", onClick: () => openNotepad() },
              { label: "Paint", onClick: () => openPaint() },
              { label: "Корзина", onClick: () => openRecycle() },
            ].map((it) => (
              <button
                key={it.label}
                type="button"
                className="flex w-full px-3 py-1 text-left text-[11px] hover:bg-win-title hover:text-white"
                onClick={() => menuAction(it.onClick)}
              >
                {it.label}
              </button>
            ))}
            <div className="my-1 border-t border-win-dark" />
            <button
              type="button"
              className="flex w-full px-3 py-1 text-left text-[11px] hover:bg-win-title hover:text-white"
              onClick={() => menuAction(toggleTheme)}
            >
              Тема: {theme === "crt" ? "CRT-терминал" : "Windows 98"}
            </button>
            <button
              type="button"
              className="flex w-full px-3 py-1 text-left text-[11px] hover:bg-win-title hover:text-white"
              onClick={() => menuAction(toggleSound)}
            >
              Звук: {soundOn ? "Вкл" : "Выкл"}
            </button>
            <div className="my-1 border-t border-win-dark" />
            <button
              type="button"
              className="flex w-full px-3 py-1 text-left text-[11px] hover:bg-win-title hover:text-white"
              onClick={() => menuAction(powerOff)}
            >
              Завершение работы...
            </button>
          </div>
        </>
      ) : null}

      <div className="win98 flex h-[26px] items-center gap-1 px-1" style={{ borderWidth: "2px 0 0 0" }}>
        <button
          type="button"
          className="win98 flex h-[20px] items-center gap-1 px-2 text-[11px] font-bold"
          style={
            startMenuOpen
              ? { borderColor: "var(--color-win-shadow) var(--color-win-light) var(--color-win-light) var(--color-win-shadow)" }
              : undefined
          }
          onClick={() => {
            sfx.click();
            setStartMenuOpen(!startMenuOpen);
          }}
        >
          <img src="/scp/scp-logo.png" alt="" className="size-3.5" aria-hidden />
          Пуск
        </button>

        <div className="mx-1 h-4 w-px bg-win-dark" />

        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {order.map((id) => {
            const w = windows[id];
            if (!w) return null;
            const active = id === topId && !w.minimized;
            return (
              <button
                key={id}
                type="button"
                className="win98 h-[20px] max-w-[110px] shrink-0 truncate px-2 text-left text-[11px]"
                style={{
                  borderColor: active
                    ? "var(--color-win-shadow) var(--color-win-light) var(--color-win-light) var(--color-win-shadow)"
                    : undefined,
                  background: active ? "#d4d0c8" : undefined,
                }}
                onClick={() => taskClick(id)}
                title={w.title}
              >
                {w.title.replace(/^.*—\s*/, "").replace(/^C:\\\\.*\\\\/, "")}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2 px-2 text-[11px]">
          <button
            type="button"
            aria-label={soundOn ? "Выключить звук" : "Включить звук"}
            onClick={() => {
              toggleSound();
              sfx.click();
            }}
          >
            {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
          <button
            type="button"
            className="win98-inset px-1 text-[10px]"
            onClick={() => {
              sfx.click();
              toggleTheme();
            }}
            title="Сменить тему"
          >
            {theme === "crt" ? "CRT" : "98"}
          </button>
          <span className="win98-inset px-1">{clock}</span>
        </div>
      </div>
    </div>
  );
}
