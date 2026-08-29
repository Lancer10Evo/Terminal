import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BOOT_SCRIPT, isValidClearance } from "@/lib/archive";
import { sfx } from "@/lib/sound";
import { useTerminal } from "@/store/terminal";
import { DraggableWindow } from "./DraggableWindow";

type Line = { text: string; tone?: "ok" | "bad" | "dim" };

export function CmdWindow({ onFocus }: { onFocus: () => void }) {
  const phase = useTerminal((s) => s.phase);
  const beginScript = useTerminal((s) => s.beginScript);
  const finishScript = useTerminal((s) => s.finishScript);
  const grantAccess = useTerminal((s) => s.grantAccess);
  const failAccess = useTerminal((s) => s.failAccess);
  const accessFails = useTerminal((s) => s.accessFails);

  const win = useTerminal((s) => s.windows.cmd);
  const order = useTerminal((s) => s.order);
  const moveWindow = useTerminal((s) => s.moveWindow);
  const focusWindow = useTerminal((s) => s.focusWindow);
  const minimizeWindow = useTerminal((s) => s.minimizeWindow);
  const toggleMaximize = useTerminal((s) => s.toggleMaximize);

  const [lines, setLines] = useState<Line[]>([
    { text: "C:\\FOUNDATION>", tone: "dim" },
    { text: "Нажмите ENTER для распаковки архива SCP-7843.", tone: "dim" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scriptRan = useRef(false);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, busy]);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [phase, busy]);

  useEffect(() => {
    if (phase !== "script" || scriptRan.current) return;
    scriptRan.current = true;
    setBusy(true);
    setLines([]);
    let i = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (i >= BOOT_SCRIPT.length) {
        setBusy(false);
        finishScript();
        return;
      }
      const text = BOOT_SCRIPT[i] ?? "";
      const tone =
        text.includes("WARNING") || text.includes("DETECTED") ? "bad" : undefined;
      setLines((prev) => [...prev, { text, tone }]);
      i += 1;
      const delay = text.startsWith("[") ? 220 : text.length > 40 ? 90 : 55;
      window.setTimeout(tick, delay);
    };
    window.setTimeout(tick, 120);
    return () => {
      cancelled = true;
    };
  }, [phase, finishScript]);

  function submit() {
    if (busy) return;
    if (phase === "ready") {
      sfx.click();
      beginScript();
      return;
    }
    if (phase === "access" || phase === "desktop") {
      const raw = input;
      setInput("");
      setLines((prev) => [...prev, { text: raw }]);
      if (phase === "access") {
        if (isValidClearance(raw)) {
          sfx.open();
          setLines((prev) => [
            ...prev,
            { text: "CLEARANCE ACCEPTED: LEVEL 4/7843", tone: "ok" },
            { text: "MOUNTING ARCHIVE .............. OK", tone: "ok" },
            { text: "Открываю проводник C:\\FOUNDATION\\SCP-7843", tone: "dim" },
          ]);
          window.setTimeout(() => grantAccess(), 500);
        } else {
          sfx.error();
          const nextFails = accessFails + 1;
          failAccess();
          setLines((prev) => [
            ...prev,
            { text: "ACCESS DENIED.", tone: "bad" },
            {
              text:
                nextFails >= 2
                  ? "ПОДСКАЗКА: уровень объекта — 4 / KETER"
                  : "ТРЕБУЕТСЯ УРОВЕНЬ ДОСТУПА [1-5]:",
              tone: "dim",
            },
          ]);
        }
        return;
      }
      const cmd = raw.trim().toLowerCase();
      if (cmd === "cls" || cmd === "clear") setLines([]);
      else if (cmd === "dir" || cmd === "ls")
        setLines((p) => [
          ...p,
          { text: "7843-CONTAIN.txt  7843-DESCR.txt  ADDENDA  LOGS  WARNING.txt" },
        ]);
      else if (cmd === "help")
        setLines((p) => [...p, { text: "dir  cls  help  whoami  yk" }]);
      else if (cmd === "whoami")
        setLines((p) => [...p, { text: "FOUNDATION\\level-4  [session unstable]" }]);
      else if (cmd === "yk" || cmd === "yled") {
        sfx.error();
        setLines((p) => [...p, { text: "YOU ARE DOOMED!", tone: "bad" }]);
      } else if (cmd)
        setLines((p) => [
          ...p,
          {
            text: `'${raw}' is not recognized as an internal or external command.`,
            tone: "dim",
          },
        ]);
    }
  }

  if (!win) return null;
  const z = 10 + order.indexOf("cmd");

  return (
    <DraggableWindow
      title="C:\\WINDOWS\\system32\\cmd.exe"
      x={win.x}
      y={win.y}
      w={win.w}
      h={win.h}
      z={z}
      minimized={phase === "desktop" ? win.minimized : false}
      maximized={phase === "desktop" ? win.maximized : false}
      variant="cmd"
      onMove={(nx, ny) => moveWindow("cmd", nx, ny)}
      onFocus={() => {
        focusWindow("cmd");
        onFocus();
      }}
      onMinimize={phase === "desktop" ? () => minimizeWindow("cmd") : undefined}
      onToggleMaximize={phase === "desktop" ? () => toggleMaximize("cmd") : undefined}
    >
      <div
        className="flex h-full min-h-0 flex-col bg-cmd-bg px-2 py-1 font-term text-sm leading-5 text-cmd-fg"
        onClick={() => inputRef.current?.focus()}
      >
        <div ref={boxRef} className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap">
          {lines.map((ln, i) => (
            <div
              key={`${i}-${ln.text.slice(0, 16)}`}
              className={
                ln.tone === "bad"
                  ? "text-warn"
                  : ln.tone === "ok"
                    ? "text-phosphor"
                    : ln.tone === "dim"
                      ? "text-win-dark"
                      : ""
              }
            >
              {ln.text || "\u00a0"}
            </div>
          ))}
        </div>
        {!busy && (phase === "ready" || phase === "access" || phase === "desktop") ? (
          <div className="flex shrink-0 items-center gap-1">
            {phase === "desktop" ? <span>C:\\FOUNDATION{">"}</span> : null}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              className="min-w-0 flex-1 border-0 bg-transparent font-term text-sm text-cmd-fg outline-none"
              autoComplete="off"
              spellCheck={false}
              aria-label="Командная строка"
            />
            {!input ? <span className="cmd-caret" /> : null}
          </div>
        ) : null}
      </div>
    </DraggableWindow>
  );
}
