import { useContextMenu } from "@/store/contextMenu";
import { sfx } from "@/lib/sound";

export function ContextMenu() {
  const open = useContextMenu((s) => s.open);
  const x = useContextMenu((s) => s.x);
  const y = useContextMenu((s) => s.y);
  const items = useContextMenu((s) => s.items);
  const hide = useContextMenu((s) => s.hide);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[90]" onContextMenu={(e) => e.preventDefault()}>
      <div className="absolute inset-0" onPointerDown={() => hide()} onContextMenu={() => hide()} />
      <div
        className="win98 absolute min-w-[160px] py-0.5"
        style={{ left: Math.max(2, x), top: Math.max(2, y) }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {items.map((it, i) =>
          it.divider ? (
            <div key={`div-${i}`} className="my-0.5 border-t border-win-dark" />
          ) : (
            <button
              key={`${it.label}-${i}`}
              type="button"
              disabled={it.disabled}
              className="flex w-full items-center px-3 py-1 text-left text-[11px] text-black hover:bg-win-title hover:text-white disabled:text-win-shadow disabled:hover:bg-transparent disabled:hover:text-win-shadow"
              onClick={() => {
                sfx.click();
                hide();
                it.onClick?.();
              }}
            >
              {it.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
