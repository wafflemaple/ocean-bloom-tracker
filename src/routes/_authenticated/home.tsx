import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";
import { ArrowRight, Download, Sparkles } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchEntries, fetchProfile } from "@/lib/api";
import { DOMAINS, entryLoad, type SymptomEntry } from "@/lib/symptoms";
import { downloadSvgAsPng } from "@/lib/download";
import { BodyMap } from "@/components/BodyMap";
import pathAsset from "@/assets/ocean-path.png.asset.json";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Your day · Tidal" },
      {
        name: "description",
        content: "Today's mental health, cycle, physical and rest tracking at a glance.",
      },
      { property: "og:title", content: "Your day · Tidal" },
      { property: "og:description", content: "Track the transition, one calm day at a time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const TONE: Record<string, string> = {
  primary: "text-primary",
  bloom: "text-[color:var(--bloom)]",
  accent: "text-accent",
  moss: "text-[color:var(--moss)]",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function HomePage() {
  const chartRef = useRef<HTMLDivElement>(null);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const { data: entries = [] } = useQuery({
    queryKey: ["entries", "recent"],
    queryFn: () => fetchEntries(),
  });

  const days = useMemo(() => buildTrend(entries, 14), [entries]);
  const todayCount = entries.filter((e) => e.entry_date === localISO(new Date())).length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <section className="glass rise relative overflow-hidden rounded-4xl">
        <img
          src={pathAsset.url}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[image:linear-gradient(120deg,oklch(0.16_0.05_245/88%)_10%,oklch(0.16_0.05_245/55%)_100%)]" />
        <div className="relative p-7 sm:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            {greeting()}
            {profile?.display_name ? `, ${profile.display_name}` : ""}.
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-primary">
              {stageLabel(profile?.stage)}
            </span>
            <span className="rounded-full border border-border px-3 py-1.5 text-muted-foreground">
              {todayCount} {todayCount === 1 ? "entry" : "entries"} today
            </span>
          </div>
          <Link
            to="/log"
            className="glow group mt-7 inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-tide)] px-6 py-3.5 font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            How are you right now?
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Domain cards */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {DOMAINS.map((d, i) => {
          const latest = latestValues(entries, d.fields.map((f) => f.key));
          return (
            <Link
              key={d.id}
              to="/log"
              search={{ domain: d.id }}
              className={`glass rounded-3xl p-6 transition-transform hover:-translate-y-1 ${i === 0 ? "sm:col-span-2" : ""}`}
            >
              <div className="flex items-start gap-3">
                <d.icon className={`h-6 w-6 ${TONE[d.tone]}`} />
                <div>
                  <h2 className="font-display text-2xl">{d.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{d.blurb}</p>
                </div>
                {i === 0 && (
                  <span className="ml-auto rounded-full bg-accent/15 px-3 py-1 text-[10px] uppercase tracking-widest text-accent">
                    Main focus
                  </span>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {d.fields.map((f) => (
                  <span
                    key={f.key}
                    className="rounded-full border border-border/70 bg-background/30 px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    {f.label}
                    {latest[f.key] != null && (
                      <strong className="ml-2 text-foreground">{latest[f.key]}</strong>
                    )}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </section>

      {/* Trend */}
      <section className="glass mt-6 rounded-3xl p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h2 className="font-display text-2xl">Trend at a glance</h2>
            <p className="text-sm text-muted-foreground">
              Symptom load and mental-health load, last 14 days.
            </p>
          </div>
          <button
            onClick={() => downloadSvgAsPng(chartRef.current, "tidal-14-day-trend.png")}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" /> Download chart
          </button>
        </div>
        <div ref={chartRef} className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={days}>
              <defs>
                <linearGradient id="loadFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="mindFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis domain={[0, 4]} stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 14,
                  color: "var(--color-popover-foreground)",
                }}
              />
              <Area
                type="monotone"
                dataKey="load"
                name="Overall load"
                stroke="var(--color-chart-1)"
                fill="url(#loadFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="mind"
                name="Mental health load"
                stroke="var(--color-chart-2)"
                fill="url(#mindFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent strip */}
      <section className="mt-6">
        <h2 className="font-display text-2xl">Recent entries</h2>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {entries.slice(0, 12).map((e) => (
            <div key={e.id} className="glass-soft min-w-44 rounded-2xl p-4">
              <p className="text-xs text-muted-foreground">
                {new Date(e.logged_at).toLocaleString(undefined, {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <p className="mt-2 font-display text-3xl">{entryLoad(e).toFixed(1)}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                symptom load
              </p>
            </div>
          ))}
          {!entries.length && (
            <p className="text-sm text-muted-foreground">
              Nothing logged yet — your first entry starts the picture.
            </p>
          )}
        </div>
      </section>

      {/* Body map */}
      <section className="glass mt-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Estrogen body map</p>
        </div>
        <h2 className="mt-3 max-w-xl font-display text-3xl leading-tight">
          Every part of the body where estrogen production affects you
        </h2>
        <div className="mt-8">
          <BodyMap />
        </div>
        <Link
          to="/learn"
          className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:opacity-80"
        >
          Read the full library <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}

function stageLabel(stage?: string) {
  switch (stage) {
    case "premenopause":
      return "Premenopause";
    case "perimenopause":
      return "Perimenopause";
    case "menopause":
      return "Menopause";
    case "postmenopause":
      return "Postmenopause";
    default:
      return "Stage not set";
  }
}

export function localISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function latestValues(entries: SymptomEntry[], keys: string[]) {
  const out: Record<string, number | string | null> = {};
  for (const key of keys) {
    const hit = entries.find(
      (e) => (e as unknown as Record<string, unknown>)[key] != null,
    );
    const raw = hit ? (hit as unknown as Record<string, unknown>)[key] : null;
    out[key] = typeof raw === "boolean" ? (raw ? "yes" : null) : (raw as number | null);
  }
  return out;
}

function buildTrend(entries: SymptomEntry[], count: number) {
  const days: { label: string; load: number; mind: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = localISO(d);
    const dayEntries = entries.filter((e) => e.entry_date === iso);
    const load = avg(dayEntries.map(entryLoad));
    const mind = avg(
      dayEntries.map((e) =>
        avg(
          [e.mood_swings, e.anxiety, e.irritability, e.brain_fog].filter(
            (v): v is number => typeof v === "number",
          ),
        ),
      ),
    );
    days.push({
      label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      load: Number(load.toFixed(2)),
      mind: Number(mind.toFixed(2)),
    });
  }
  return days;
}

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
