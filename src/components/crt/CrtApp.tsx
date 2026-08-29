import { useEffect, useState } from "react";
import { Folder, Monitor } from "lucide-react";
import { useTerminal } from "@/store/terminal";
import { CmdWindow } from "./CmdWindow";
import { DocWindow } from "./DocWindow";
import { Explorer } from "./Explorer";

export function CrtApp() {
  const phase = useTerminal((s) => s.phase);
  const powerOn = useTerminal((s) => s.powerOn);
  const powerOff = useTerminal((s) => s.powerOff);
  const finishWarmup = useTerminal((s) => s.finishWarmup);
  const openDocs = useTerminal((s) => s.openDocs);
  const focusedWin = useTerminal((s) => s.focusedWin);
  const focus = useTerminal((s) => s.focus);
  const [glitch, setGlitch] = useState(false);

  const on = phase !== "off";

  useEffect(() => {
    if (phase !== "warming") return;
    const t = window.setTimeout(() => finishWarmup(), 1250);
    return () => window.clearTimeout(t);
  }, [phase, finishWarmup]);

  useEffect(() => {
    if (phase !== "desktop") return;
    const id = window.setInterval(() => {
      setGlitch(true);
      window.setTimeout(() => setGlitch(false), 180);
    }, 14000);
    return () => window.clearInterval(id);
  }, [phase]);

  const zCmd = focusedWin === "cmd" ? 40 : 15;
  const zExp = focusedWin === "explorer" ? 38 : 22;
  const zDoc = focusedWin === "doc" ? 50 : 36;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#050403] p-2 sm:p-4">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] bg-bezel pt-4 pr-4 pb-14 pl-4 shadow-[inset_0_1px_0_#4a4338,0_20px_50px_#000]">
        <div className="mb-2 flex items-center justify-between px-2 text-[10px] tracking-widest text-bezel-hi">
          <span>FND. SECURE DISPLAY</span>
          <span>MODEL 17-K · SERIAL 7843</span>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-crt-void shadow-[inset_0_0_80px_#000] sm:aspect-[16/10]">
          {phase === "warming" ? (
            <div className="absolute inset-0 grid place-items-center bg-black">
              <div className="warmup-fill h-full w-full bg-[#143018]" />
            </div>
          ) : null}

          {on && phase !== "warming" ? (
            <>
              <div
                className={`absolute inset-0 ${phase === "desktop" ? "bg-desk" : "bg-crt-black"} crt-flicker`}
              />
              {phase === "desktop" ? (
                <div className="absolute left-3 top-3 z-10 flex flex-col gap-4 text-[11px] text-white">
                  <div className="flex w-16 flex-col items-center gap-1">
                    <Monitor className="size-8" />
                    <span className="text-center drop-shadow">Мой компьютер</span>
                  </div>
                  <div className="flex w-16 flex-col items-center gap-1">
                    <Folder className="size-8 text-amber" />
                    <span className="text-center drop-shadow">SCP-7843</span>
                  </div>
                </div>
              ) : null}

              <div className="pointer-events-none absolute right-4 top-4 z-40">
                <svg
                  className="spin-slow h-16 w-16 opacity-80 sm:h-20 sm:w-20"
                  viewBox="0 0 100 100"
                  aria-hidden
                >
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#6bff4d" strokeWidth="2" />
                  <circle cx="50" cy="50" r="8" fill="#6bff4d" />
                  <path d="M50 12 L58 38 L50 32 L42 38 Z" fill="#6bff4d" />
                  <path d="M88 75 L58 62 L66 56 L62 48 Z" fill="#6bff4d" />
                  <path d="M12 75 L38 48 L42 56 L50 62 Z" fill="#6bff4d" />
                </svg>
              </div>

              <div className="absolute inset-0 z-20 overflow-hidden">
                {phase === "ready" ||
                phase === "script" ||
                phase === "access" ||
                phase === "desktop" ? (
                  <CmdWindow z={zCmd} onFocus={() => focus("cmd")} />
                ) : null}
                {phase === "desktop" ? (
                  <Explorer z={zExp} onFocus={() => focus("explorer")} />
                ) : null}
                {phase === "desktop"
                  ? openDocs.map((id) => (
                      <DocWindow key={id} id={id} z={zDoc} onFocus={() => focus("doc")} />
                    ))
                  : null}
              </div>

              {glitch ? (
                <div className="pointer-events-none absolute inset-0 z-50 grid place-items-center bg-black/40 font-term text-2xl text-warn">
                  YOU ARE DOOMED
                </div>
              ) : null}

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
            onClick={() => (on ? powerOff() : powerOn())}
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
