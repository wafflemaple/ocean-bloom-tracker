import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";
import { Download, Printer } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchEntries, fetchProfile } from "@/lib/api";
import { ALL_SCALE_KEYS, FIELD_LABELS, entryLoad } from "@/lib/symptoms";
import { downloadSvgAsPng } from "@/lib/download";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Insights & doctor summary · Tidal" },
      {
        name: "description",
        content: "See which symptoms dominate and print a doctor-ready summary of your tracking.",
      },
      { property: "og:title", content: "Insights & doctor summary · Tidal" },
      { property: "og:description", content: "Walk in with evidence, not apologies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const chartRef = useRef<HTMLDivElement>(null);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const { data: entries = [] } = useQuery({
    queryKey: ["entries", "all"],
    queryFn: () => fetchEntries(),
  });

  const ranked = useMemo(() => {
    return ALL_SCALE_KEYS.map((key) => {
      const values = entries
        .map((e) => (e as unknown as Record<string, unknown>)[key])
        .filter((v): v is number => typeof v === "number");
      const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      return { key, label: FIELD_LABELS[key] ?? key, average: Number(average.toFixed(2)) };
    })
      .filter((r) => r.average > 0)
      .sort((a, b) => b.average - a.average);
  }, [entries]);

  const hotFlashTotal = entries.reduce((a, e) => a + (e.hot_flashes ?? 0), 0);
  const avgLoad = entries.length
    ? entries.reduce((a, e) => a + entryLoad(e), 0) / entries.length
    : 0;
  const missedPeriods = entries.filter((e) => e.missed_period).length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">Insights</h1>
          <p className="mt-2 text-muted-foreground">
            {entries.length} entries recorded · {stageLabel(profile?.stage)}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm hover:border-primary"
        >
          <Printer className="h-4 w-4" /> Doctor summary
        </button>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Average symptom load", value: avgLoad.toFixed(1), sub: "out of 4" },
          { label: "Hot flashes logged", value: String(hotFlashTotal), sub: "total" },
          { label: "Missed periods", value: String(missedPeriods), sub: "recorded" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-3xl p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className="mt-3 font-display text-4xl">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </section>

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
              <XAxis type="number" domain={[0, 4]} stroke="var(--color-muted-foreground)" fontSize={11} />
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
              <Bar dataKey="average" name="Average severity" fill="var(--color-chart-1)" radius={6} />
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
            <li key={r.key} className="flex justify-between gap-4 border-b border-border/50 pb-2">
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
