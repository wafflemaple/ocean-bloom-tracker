import { useState } from "react";
import { BODY_MAP } from "@/content/learn";
import { cn } from "@/lib/utils";

export function BodyMap() {
  const [active, setActive] = useState<string>(BODY_MAP[0]!.id);
  const region = BODY_MAP.find((r) => r.id === active) ?? BODY_MAP[0]!;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-center">
      <div className="relative mx-auto flex h-[420px] w-full max-w-xs items-center justify-center">
        {/* silhouette */}
        <div
          className="drift absolute h-[92%] w-28 rounded-full bg-[image:var(--gradient-tide)] opacity-25 blur-[2px]"
          aria-hidden
        />
        <div
          className="absolute h-[92%] w-28 rounded-full border border-primary/30"
          aria-hidden
        />
        {BODY_MAP.map((r) => (
          <button
            key={r.id}
            onClick={() => setActive(r.id)}
            style={{ top: r.top }}
            className={cn(
              "absolute flex items-center gap-2 text-xs transition-all",
              r.side === "left" ? "left-0 flex-row" : "right-0 flex-row-reverse",
              active === r.id ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={active === r.id}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-all",
                active === r.id
                  ? "glow scale-125 bg-accent"
                  : "bg-primary/50 group-hover:bg-primary",
              )}
            />
            <span className="whitespace-nowrap">{r.region}</span>
          </button>
        ))}
      </div>

      <div className="glass rise rounded-3xl p-6" key={region.id}>
        <p className="text-xs uppercase tracking-[0.25em] text-accent">Estrogen reaches here</p>
        <h3 className="mt-2 font-display text-3xl">{region.title}</h3>
        <ul className="mt-4 space-y-3">
          {region.effects.map((e) => (
            <li key={e} className="flex gap-3 text-sm text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {e}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
