import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchEntries } from "@/lib/api";
import { entryLoad, FIELD_LABELS, type SymptomEntry } from "@/lib/symptoms";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Your calendar · Tidal" },
      { name: "description", content: "A month view of symptom load, cycle days and notes." },
      { property: "og:title", content: "Your calendar · Tidal" },
      { property: "og:description", content: "See the pattern month by month." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const { data: entries = [] } = useQuery({
    queryKey: ["entries", "all"],
    queryFn: () => fetchEntries(),
  });

  const byDay = useMemo(() => {
    const map = new Map<string, SymptomEntry[]>();
    for (const e of entries) {
      const list = map.get(e.entry_date) ?? [];
      list.push(e);
      map.set(e.entry_date, list);
    }
    return map;
  }, [entries]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const selectedEntries = selected ? (byDay.get(selected) ?? []) : [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl">
          {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </h1>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="rounded-full border border-border px-4 py-2 text-sm hover:border-primary"
          >
            Previous
          </button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="rounded-full border border-border px-4 py-2 text-sm hover:border-primary"
          >
            Next
          </button>
        </div>
      </header>

      <div className="glass mt-6 rounded-3xl p-4 sm:p-6">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <span key={d} className="py-2">
              {d}
            </span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {cells.map((d, i) => {
            if (!d) return <span key={`e${i}`} />;
            const key = iso(d);
            const dayEntries = byDay.get(key) ?? [];
            const load = dayEntries.length
              ? dayEntries.reduce((a, e) => a + entryLoad(e), 0) / dayEntries.length
              : 0;
            const flow = dayEntries.some((e) => (e.flow_intensity ?? 0) > 0);
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`relative aspect-square rounded-xl border text-xs transition-colors ${
                  selected === key ? "border-primary" : "border-border/60"
                } ${dayEntries.length ? "" : "text-muted-foreground/60"}`}
                style={
                  load
                    ? {
                        background: `color-mix(in oklab, var(--color-chart-1) ${Math.round(load * 22)}%, transparent)`,
                      }
                    : undefined
                }
              >
                {d.getDate()}
                {flow && (
                  <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[color:var(--bloom)]" />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Shading = average symptom load · pink dot = flow recorded
        </p>
      </div>

      {selected && (
        <section className="glass mt-6 rounded-3xl p-6">
          <h2 className="font-display text-2xl">
            {new Date(`${selected}T00:00:00`).toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h2>
          {!selectedEntries.length && (
            <p className="mt-2 text-sm text-muted-foreground">Nothing logged this day.</p>
          )}
          <div className="mt-4 space-y-4">
            {selectedEntries.map((e) => (
              <article key={e.id} className="glass-soft rounded-2xl p-4">
                <p className="text-xs text-muted-foreground">
                  {new Date(e.logged_at).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(FIELD_LABELS).map(([key, label]) => {
                    const value = (e as unknown as Record<string, unknown>)[key];
                    if (value == null || value === false || value === 0) return null;
                    return (
                      <span
                        key={key}
                        className="rounded-full border border-border/70 px-3 py-1 text-xs"
                      >
                        {label}
                        <strong className="ml-1.5">
                          {typeof value === "boolean" ? "yes" : String(value)}
                        </strong>
                      </span>
                    );
                  })}
                </div>
                {[e.mental_note, e.cycle_note, e.physical_note, e.rest_note]
                  .filter(Boolean)
                  .map((note, i) => (
                    <p key={i} className="mt-3 text-sm italic text-muted-foreground">
                      “{note}”
                    </p>
                  ))}
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
