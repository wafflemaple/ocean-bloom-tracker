import { useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { RotateCw, ArrowRight } from "lucide-react";
import { BODY_MAP } from "@/content/learn";
import { cn } from "@/lib/utils";

type DomainId = "mental" | "cycle" | "physical" | "rest";

const REGION_META: Record<
  string,
  { face: "front" | "back"; x: number; y: number; domain: DomainId; track: string }
> = {
  brain: { face: "front", x: 50, y: 8, domain: "mental", track: "Mood, anxiety, brain fog" },
  eyes: { face: "front", x: 50, y: 15, domain: "physical", track: "Dryness, skin, hair" },
  heart: { face: "front", x: 42, y: 30, domain: "physical", track: "Palpitations, hot flashes" },
  breast: { face: "front", x: 60, y: 32, domain: "cycle", track: "Tenderness with hormone swings" },
  metabolism: { face: "front", x: 50, y: 46, domain: "physical", track: "Weight change, bloating" },
  pelvis: { face: "front", x: 50, y: 58, domain: "cycle", track: "Flow, spotting, urinary signs" },
  bones: { face: "back", x: 50, y: 68, domain: "physical", track: "Joint and muscle ache" },
  sleep: { face: "back", x: 50, y: 20, domain: "rest", track: "Sleep quality, night waking" },
};

const SILHOUETTE =
  "M50 4c-5 0-8 3.6-8 8.4 0 3.2 1.2 5.6 2.6 7.2-6.4 1.8-11 5.2-12.6 10.6-1.4 4.8-2 12-2.2 18.4-.2 5 .2 9 .8 12.4.4 2.4 2.6 3.4 4.2 2.2 1-.8 1.4-2.2 1.2-3.6-.4-3-.6-6.6-.4-10 3 6.4 3.6 12.6 3 18.6-.6 6-1.6 11.4-1.6 16.6 0 4.4.6 8.6 1.2 12.2.4 2.4 2.6 3.6 4.6 2.8 1.6-.6 2.4-2.2 2.2-3.8-.4-3.4-.6-7-.4-10.6.2-4 .8-7.8 1.6-11.4h6.8c.8 3.6 1.4 7.4 1.6 11.4.2 3.6 0 7.2-.4 10.6-.2 1.6.6 3.2 2.2 3.8 2 .8 4.2-.4 4.6-2.8.6-3.6 1.2-7.8 1.2-12.2 0-5.2-1-10.6-1.6-16.6-.6-6 0-12.2 3-18.6.2 3.4 0 7-.4 10-.2 1.4.2 2.8 1.2 3.6 1.6 1.2 3.8.2 4.2-2.2.6-3.4 1-7.4.8-12.4-.2-6.4-.8-13.6-2.2-18.4-1.6-5.4-6.2-8.8-12.6-10.6 1.4-1.6 2.6-4 2.6-7.2C58 7.6 55 4 50 4Z";

export function BodyFigure({ compact = false }: { compact?: boolean }) {
  const [angle, setAngle] = useState(0);
  const [active, setActive] = useState<string>("brain");
  const drag = useRef<{ x: number; start: number } | null>(null);

  const face = useMemo(() => {
    const normalised = ((angle % 360) + 360) % 360;
    return normalised > 90 && normalised < 270 ? "back" : "front";
  }, [angle]);

  const regions = BODY_MAP.filter((r) => REGION_META[r.id]?.face === face);
  const region = BODY_MAP.find((r) => r.id === active) ?? BODY_MAP[0]!;
  const meta = REGION_META[region.id]!;

  function onPointerDown(e: React.PointerEvent) {
    drag.current = { x: e.clientX, start: angle };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    setAngle(drag.current.start + (e.clientX - drag.current.x) * 0.8);
  }
  function onPointerUp() {
    drag.current = null;
  }

  return (
    <div className={cn("grid gap-6", compact ? "" : "md:grid-cols-[minmax(0,1fr)_1.1fr]")}>
      <div className="glass-soft relative rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {face === "front" ? "Front" : "Back"} · drag to rotate
          </p>
          <button
            onClick={() => setAngle((a) => a + 180)}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCw className="h-3.5 w-3.5" /> Turn
          </button>
        </div>

        <div
          className="relative mx-auto mt-2 aspect-square w-full max-w-[300px] touch-none select-none"
          style={{ perspective: "900px" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className="absolute inset-0 transition-transform duration-500 ease-out"
            style={{ transform: `rotateY(${angle}deg)`, transformStyle: "preserve-3d" }}
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              className="h-full w-full"
              aria-label={`Body diagram, ${face} view`}
            >
              <defs>
                <linearGradient id="bodyfill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="var(--color-moss)" stopOpacity="0.28" />
                </linearGradient>
              </defs>
              <path
                d={SILHOUETTE}
                fill="url(#bodyfill)"
                stroke="var(--color-primary)"
                strokeOpacity="0.55"
                strokeWidth="0.6"
              />
            </svg>
          </div>

          {regions.map((r) => {
            const m = REGION_META[r.id]!;
            return (
              <button
                key={r.id}
                onClick={() => setActive(r.id)}
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
                aria-pressed={active === r.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                title={r.region}
              >
                <span
                  className={cn(
                    "block h-4 w-4 rounded-full border transition-all",
                    active === r.id
                      ? "breathe border-primary bg-primary/70"
                      : "border-primary/50 bg-primary/25 hover:bg-primary/50",
                  )}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {regions.map((r) => (
            <button
              key={r.id}
              onClick={() => setActive(r.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                active === r.id
                  ? "border-primary bg-primary/12 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {r.region}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rise rounded-3xl p-6" key={region.id}>
        <p className="text-xs uppercase tracking-[0.22em] text-accent-foreground/70">
          Estrogen reaches here
        </p>
        <h3 className="mt-2 font-display text-3xl">{region.title}</h3>
        <ul className="mt-4 space-y-2.5">
          {region.effects.map((e) => (
            <li key={e} className="flex gap-3 text-sm text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {e}
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Track it here</p>
          <p className="mt-1 text-sm">{meta.track}</p>
          <Link
            to="/log"
            search={{ domain: meta.domain }}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-tide)] px-4 py-2 text-sm text-primary-foreground"
          >
            Log this area <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
