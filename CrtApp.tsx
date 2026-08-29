import { useEffect, useState } from "react";
import { sfx } from "@/lib/sound";
import { useTerminal } from "@/store/terminal";
import { CmdWindow } from "./CmdWindow";
import { ContextMenu } from "./ContextMenu";
import { DesktopIcons } from "./DesktopIcons";
import { DocWindow } from "./DocWindow";
import { Explorer } from "./Explorer";
import { NotepadWindow } from "./NotepadWindow";
import { PaintWindow } from "./PaintWindow";
import { RecycleWindow } from "./RecycleWindow";
import { Taskbar } from "./Taskbar";

export function CrtApp() {
  const phase = useTerminal((s) => s.phase);
  const powerOn = useTerminal((s) => s.powerOn);
  const powerOff = useTerminal((s) => s.powerOff);
  const finishWarmup = useTerminal((s) => s.finishWarmup);
  const windows = useTerminal((s) => s.windows);
  const theme = useTerminal((s) => s.theme);
  const [glitch, setGlitch] = useState(false);

  const on = phase !== "off";
  const crt = theme === "crt";

  const docIds = Object.keys(windows)
    .filter((id) => id.startsWith("doc:"))
    .map((id) => id.slice(4));
  const notepadIds = Object.keys(windows).filter((id) => id.startsWith("notepad:"));
  const paintIds = Object.keys(windows).filter((id) => id.startsWith("paint:"));
  const hasRecycle = Boolean(windows.recycle);

  useEffect(() => {
    if (phase !== "warming") return;
    const t = window.setTimeout(() => finishWarmup(), 1250);
    return () => window.clearTimeout(t);
  }, [phase, finishWarmup]);

  useEffect(() => {
    if (phase !== "desktop" || !crt) return;
    const id = window.setInterval(() => {
      setGlitch(true);
      window.setTimeout(() => setGlitch(false), 180);
    }, 14000);
    return () => window.clearInterval(id);
  }, [phase, crt]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#050403] p-2 sm:p-4">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] bg-bezel pt-4 pr-4 pb-14 pl-4 shadow-[inset_0_1px_0_#4a4338,0_20px_50px_#000]">
        <div className="mb-2 flex items-center justify-between px-2 text-[10px] tracking-widest text-bezel-hi">
          <span>FND. SECURE DISPLAY</span>
          <span>MODEL 17-K · SERIAL 7843</span>
        </div>

        <div className="crt-screen relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-crt-void shadow-[inset_0_0_80px_#000] sm:aspect-[16/10]">
          {phase === "warming" ? (
            <div className="absolute inset-0 grid place-items-center bg-black">
              <div className="warmup-fill h-full w-full bg-[#143018]" />
            </div>
          ) : null}

          {on && phase !== "warming" ? (
            <>
              <div
                className={`absolute inset-0 ${phase === "desktop" ? "bg-desk" : "bg-crt-black"} ${crt ? "crt-flicker" : ""}`}
              />

              {phase === "desktop" ? <DesktopIcons /> : null}

              <div className="pointer-events-none absolute right-4 top-4 z-40">
                <img
                  src="/scp/scp-logo.png"
                  alt="SCP Foundation"
                  className={`spin-slow h-16 w-16 opacity-90 sm:h-20 sm:w-20 ${crt ? "drop-shadow-[0_0_8px_#6bff4d]" : "drop-shadow-[0_0_4px_#00000088]"}`}
                  aria-hidden
                />
              </div>

              <div className="absolute inset-0 z-20 overflow-hidden">
                {phase === "ready" ||
                phase === "script" ||
                phase === "access" ||
                phase === "desktop" ? (
                  <CmdWindow onFocus={() => {}} />
                ) : null}
                {phase === "desktop" ? (
                  <>
                    <Explorer onFocus={() => {}} />
                    {docIds.map((id) => (
                      <DocWindow key={id} id={id} onFocus={() => {}} />
                    ))}
                    {notepadIds.map((id) => (
                      <NotepadWindow key={id} id={id} onFocus={() => {}} />
                    ))}
                    {paintIds.map((id) => (
                      <PaintWindow key={id} id={id} onFocus={() => {}} />
                    ))}
                    {hasRecycle ? <RecycleWindow id="recycle" onFocus={() => {}} /> : null}
                  </>
                ) : null}
              </div>

              {phase === "desktop" ? <ContextMenu /> : null}
              {phase === "desktop" ? <Taskbar /> : null}

              {glitch ? (
                <div className="pointer-events-none absolute inset-0 z-50 grid place-items-center bg-black/40 font-term text-2xl text-warn">
                  YOU ARE DOOMED
                </div>
              ) : null}

              {crt ? (
                <>
                  <div className="scanlines absolute inset-0 z-40" />
                  <div
                    className="pointer-events-none absolute inset-0 z-40 opacity-20"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")",
                      animation: "noise-shift 0.4s steps(2) infinite",
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 z-40 shadow-[inset_0_0_80px_20px_#000]" />
                </>
              ) : null}
            </>
          ) : null}

          {!on ? (
            <div className="absolute inset-0 grid place-items-center">
              <p className="font-term text-xs tracking-[0.35em] text-phosphor-dim/50">
                НАЖМИТЕ ПИТАНИЕ
              </p>
            </div>
          ) : null}
        </div>

        <div className="absolute bottom-3 right-6 flex items-center gap-3">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background: on ? "var(--color-led-on)" : "var(--color-led-off)",
              boxShadow: on ? "0 0 8px var(--color-phosphor)" : "none",
            }}
            aria-hidden
          />
          <button
            type="button"
            onClick={() => {
              if (on) {
                sfx.shutdown();
                powerOff();
              } else {
                sfx.startup();
                powerOn();
              }
            }}
            aria-label={on ? "Выключить монитор" : "Включить монитор"}
            className="h-11 w-11 rounded-full border-2 border-bezel bg-bezel-hi text-amber shadow-inner"
          >
            <span className="block text-center font-term text-[10px]">I/O</span>
          </button>
        </div>
      </div>
    </main>
  );
}
