import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";
import { Download, Printer } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchEntries, fetchProfile } from "@/lib/api";
import { DOMAINS, FIELD_LABELS, entryLoad, type SymptomEntry } from "@/lib/symptoms";
import { computeStreak } from "@/lib/gamify";
import { downloadSvgAsPng } from "@/lib/download";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Health status & doctor summary · Tidal" },
      {
        name: "description",
        content:
          "Your health status score, category-by-category averages and a doctor-ready summary of your tracking.",
      },
      { property: "og:title", content: "Health status & doctor summary · Tidal" },
      { property: "og:description", content: "Walk in with evidence, not apologies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsightsPage,
});

function avgOf(entries: SymptomEntry[], key: string) {
  const values = entries
    .map((e) => (e as unknown as Record<string, unknown>)[key])
    .filter((v): v is number => typeof v === "number");
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function InsightsPage() {
  const chartRef = useRef<HTMLDivElement>(null);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const { data: entries = [] } = useQuery({
    queryKey: ["entries", "all"],
    queryFn: () => fetchEntries(),
  });

  const recent = useMemo(() => entries.slice(0, 60), [entries]);

  const health = useMemo(() => {
    if (!recent.length) return { score: null as number | null, label: "Not enough data yet" };
    const load = recent.reduce((a, e) => a + entryLoad(e), 0) / recent.length;
    const rest = (avgOf(recent, "sleep_quality") + avgOf(recent, "energy_level")) / 2;
    const raw = 100 - load * 18 + (rest - 2) * 5;
    const score = Math.max(0, Math.min(100, Math.round(raw)));
    const label =
      score >= 80
        ? "Settled"
        : score >= 60
          ? "Manageable"
          : score >= 40
            ? "Turbulent"
            : "Needs support";
    return { score, label };
  }, [recent]);

  const { streak } = useMemo(() => computeStreak(entries), [entries]);

  const ranked = useMemo(() => {
    return DOMAINS.flatMap((d) => d.fields.filter((f) => f.kind === "scale"))
      .map((f) => ({
        key: f.key,
        label: FIELD_LABELS[f.key] ?? f.key,
        average: Number(avgOf(recent, f.key).toFixed(2)),
      }))
      .filter((r) => r.average > 0)
      .sort((a, b) => b.average - a.average);
  }, [recent]);

  const cycle = useMemo(() => {
    const periodDays = entries.filter((e) => e.period_day || e.flow_intensity !== null).length;
    return {
      periodDays,
      missed: entries.filter((e) => e.missed_period).length,
      spotting: entries.filter((e) => e.spotting).length,
      starts: entries.filter((e) => e.period_start).length,
      avgFlow: avgOf(entries, "flow_intensity").toFixed(1),
      avgCramps: avgOf(entries, "cramps").toFixed(1),
    };
  }, [entries]);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 md:pb-10">
      <header className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">Insights</h1>
          <p className="mt-2 text-muted-foreground">
            {entries.length} entries · {streak}-day streak · {stageLabel(profile?.stage)}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm hover:border-primary"
        >
          <Printer className="h-4 w-4" /> Doctor summary
        </button>
      </header>

      {/* Health status */}
      <section className="glass mt-6 rounded-3xl p-6 sm:p-7">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Health status</p>
        <div className="mt-3 flex flex-wrap items-center gap-6">
          <div>
            <p className="font-display text-6xl leading-none">{health.score ?? "—"}</p>
            <p className="text-sm text-muted-foreground">out of 100</p>
          </div>
          <div className="min-w-[200px] flex-1">
            <p className="font-display text-2xl">{health.label}</p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  (health.score ?? 0) >= 60
                    ? "bg-[color:var(--moss)]"
                    : (health.score ?? 0) >= 40
                      ? "bg-[color:var(--sunlit)]"
                      : "bg-[color:var(--bloom)]",
                )}
                style={{ width: `${health.score ?? 0}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Based on symptom load, sleep and energy across your last 60 entries.
            </p>
          </div>
        </div>
      </section>

      {/* Per-category averages, clearly separated */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {DOMAINS.map((d) => (
          <div key={d.id} className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2">
              <d.icon className="h-4 w-4 text-primary" />
              <h2 className="font-display text-xl">{d.title}</h2>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {d.fields
                .filter((f) => f.kind !== "toggle")
                .map((f) => (
                  <li key={f.key} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span>{avgOf(recent, f.key).toFixed(1)}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Cycle changes — separate section */}
      <section className="glass mt-6 rounded-3xl p-6">
        <h2 className="font-display text-2xl">Cycle changes</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Period days recorded", value: String(cycle.periodDays) },
            { label: "Periods started", value: String(cycle.starts) },
            { label: "Missed periods", value: String(cycle.missed) },
            { label: "Spotting days", value: String(cycle.spotting) },
            { label: "Average flow", value: `${cycle.avgFlow} / 4` },
            { label: "Average cramps", value: `${cycle.avgCramps} / 4` },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-secondary/40 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className="mt-1.5 font-display text-2xl">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ranking */}
      <section className="glass mt-6 rounded-3xl p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl">What dominates your record</h2>
          <button
            onClick={() => downloadSvgAsPng(chartRef.current, "tidal-symptom-ranking.png")}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" /> Download chart
          </button>
        </div>
        <div ref={chartRef} className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ranked} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid stroke="var(--color-border)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 4]}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={130}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 14,
                }}
              />
              <Bar
                dataKey="average"
                name="Average severity"
                fill="var(--color-chart-1)"
                radius={6}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {!ranked.length && (
          <p className="text-sm text-muted-foreground">Log a few entries to see your pattern.</p>
        )}
      </section>

      <section className="glass mt-6 rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-2xl">Take this to your appointment</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Doctors often see one symptom at a time. This is the whole pattern, dated and measured.
        </p>
        <ul className="mt-5 space-y-2 text-sm">
          {ranked.slice(0, 6).map((r) => (
            <li key={r.key} className="flex justify-between gap-4 border-b border-border/60 pb-2">
              <span>{r.label}</span>
              <span className="text-muted-foreground">average {r.average} / 4</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function stageLabel(stage?: string) {
  if (!stage || stage === "unsure") return "stage not set";
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}
