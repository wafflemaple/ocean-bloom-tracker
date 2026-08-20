import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Droplets, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createEntry, fetchEntries } from "@/lib/api";
import { SCALE_LABELS, todayISO, type SymptomEntry } from "@/lib/symptoms";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/cycle")({
  head: () => ({
    meta: [
      { title: "Cycle & period · Tidal" },
      {
        name: "description",
        content:
          "Record a regular menstrual cycle plus perimenopausal changes: flow, cramps, spotting and missed periods.",
      },
      { property: "og:title", content: "Cycle & period · Tidal" },
      { property: "og:description", content: "Your cycle, kept separately and clearly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CyclePage,
});

function CyclePage() {
  const qc = useQueryClient();
  const [flow, setFlow] = useState<number | null>(null);
  const [cramps, setCramps] = useState<number | null>(null);
  const [start, setStart] = useState(false);
  const [spotting, setSpotting] = useState(false);
  const [note, setNote] = useState("");

  const { data: entries = [] } = useQuery({
    queryKey: ["entries", "all"],
    queryFn: () => fetchEntries(),
  });

  const stats = useMemo(() => cycleStats(entries), [entries]);

  const save = useMutation({
    mutationFn: () =>
      createEntry(
        {
          period_day: true,
          period_start: start,
          spotting,
          flow_intensity: flow,
          cramps,
          cycle_note: note || null,
        },
        todayISO(),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entries"] });
      toast.success("Cycle day recorded.");
      setNote("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  return (
    <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 md:pb-10">
      <header className="rise">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Cycle changes</p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">Cycle & period</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Track a regular menstrual cycle here, and the changes that come with the transition —
          shorter gaps, skipped months, heavier or lighter flow.
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Average cycle length" value={stats.avgLength ? `${stats.avgLength} days` : "—"} sub="between period starts" />
        <Stat label="Last period started" value={stats.lastStart ?? "—"} sub={stats.daysSince !== null ? `${stats.daysSince} days ago` : "not recorded"} />
        <Stat label="Next expected" value={stats.nextExpected ?? "—"} sub="estimate from your record" />
      </section>

      <section className="glass mt-5 rounded-3xl p-6 sm:p-7">
        <div className="flex items-start gap-3">
          <Droplets className="mt-1 h-5 w-5 text-[color:var(--bloom)]" />
          <div>
            <h2 className="font-display text-2xl">Record today</h2>
            <p className="text-sm text-muted-foreground">Only fill in what applies.</p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <Toggle label="This is the first day of my period" on={start} onChange={setStart} />
          <Toggle label="Spotting only" on={spotting} onChange={setSpotting} />
          <Scale label="Flow intensity" value={flow} onChange={setFlow} />
          <Scale label="Cramps" value={cramps} onChange={setCramps} />
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Note</label>
            <textarea
              rows={3}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Clots, pain relief taken, anything unusual…"
              className="mt-1.5 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary"
            />
          </div>
        </div>

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="glow mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[image:var(--gradient-tide)] py-3.5 font-medium text-primary-foreground disabled:opacity-50"
        >
          {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save cycle day
        </button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Missed a period instead?{" "}
          <Link to="/log" search={{ domain: "cycle" }} className="text-primary">
            Record it in the full log
          </Link>
        </p>
      </section>

      <section className="glass mt-5 rounded-3xl p-6">
        <h2 className="font-display text-2xl">Recent cycle history</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {stats.periodDays.slice(0, 12).map((d) => (
            <li
              key={d.date}
              className="flex items-center justify-between border-b border-border/60 pb-2"
            >
              <span>{d.date}</span>
              <span className="text-muted-foreground">
                {d.start ? "Period started" : d.spotting ? "Spotting" : "Period day"}
                {typeof d.flow === "number" ? ` · flow ${SCALE_LABELS[d.flow]}` : ""}
              </span>
            </li>
          ))}
          {!stats.periodDays.length && (
            <li className="text-muted-foreground">Nothing recorded yet.</li>
          )}
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="glass rounded-3xl p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-sm transition-colors",
        on ? "border-primary bg-primary/10" : "border-border",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "flex h-6 w-11 items-center rounded-full px-0.5 transition-colors",
          on ? "bg-primary" : "bg-secondary",
        )}
      >
        <span
          className={cn("h-5 w-5 rounded-full bg-card transition-transform", on && "translate-x-5")}
        />
      </span>
    </button>
  );
}

function Scale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">
          {value === null ? "not set" : SCALE_LABELS[value]}
        </p>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {SCALE_LABELS.map((l, i) => (
          <button
            key={l}
            onClick={() => onChange(i)}
            aria-pressed={value === i}
            className={cn(
              "rounded-xl border py-3 text-xs transition-colors",
              value === i
                ? "border-primary bg-primary/12 text-primary"
                : "border-border text-muted-foreground hover:border-primary/60",
            )}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}

function cycleStats(entries: SymptomEntry[]) {
  const periodDays = entries
    .filter((e) => e.period_day || e.period_start || e.spotting || e.flow_intensity !== null)
    .map((e) => ({
      date: e.entry_date,
      start: e.period_start,
      spotting: e.spotting,
      flow: e.flow_intensity,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const starts = [...new Set(periodDays.filter((d) => d.start).map((d) => d.date))].sort();
  let avgLength: number | null = null;
  if (starts.length >= 2) {
    const gaps: number[] = [];
    for (let i = 1; i < starts.length; i++) {
      gaps.push((Date.parse(starts[i]!) - Date.parse(starts[i - 1]!)) / 86_400_000);
    }
    avgLength = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  }

  const lastStart = starts.length ? starts[starts.length - 1]! : null;
  const daysSince = lastStart
    ? Math.round((Date.now() - Date.parse(lastStart)) / 86_400_000)
    : null;
  const nextExpected =
    lastStart && avgLength
      ? new Date(Date.parse(lastStart) + avgLength * 86_400_000).toISOString().slice(0, 10)
      : null;

  return { periodDays, avgLength, lastStart, daysSince, nextExpected };
}
