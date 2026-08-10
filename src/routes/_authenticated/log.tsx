import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { createEntry } from "@/lib/api";
import { DOMAINS, SCALE_LABELS, todayISO, type SymptomDomain } from "@/lib/symptoms";

const searchSchema = z.object({
  domain: z.enum(["mental", "cycle", "physical", "rest"]).optional(),
});

export const Route = createFileRoute("/_authenticated/log")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Log how you feel · Tidal" },
      {
        name: "description",
        content: "Record mental health, cycle, physical and rest symptoms in under a minute.",
      },
      { property: "og:title", content: "Log how you feel · Tidal" },
      { property: "og:description", content: "One minute now saves a year of guesswork later." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LogPage,
});

const TONE: Record<string, string> = {
  primary: "text-primary",
  bloom: "text-[color:var(--bloom)]",
  accent: "text-accent",
  moss: "text-[color:var(--moss)]",
};

function LogPage() {
  const { domain } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, number | boolean | string>>({});
  const [date, setDate] = useState(todayISO());

  const active = domain ? DOMAINS.filter((d) => d.id === domain) : DOMAINS;

  const mutation = useMutation({
    mutationFn: () => createEntry(values, date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entries"] });
      toast.success("Logged. That's the tide recorded.");
      navigate({ to: "/home" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const set = (key: string, value: number | boolean | string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const filled = Object.values(values).filter((v) => v !== "" && v !== false).length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="rise">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">How are you right now?</h1>
        <p className="mt-2 text-muted-foreground">
          Log as often as you like — hot flashes and moods rarely wait for bedtime.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">For</label>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-full border border-input bg-background/40 px-4 py-2 text-sm outline-none focus:border-primary"
          />
          {domain && (
            <button
              onClick={() => navigate({ to: "/log", search: {} })}
              className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Show all categories
            </button>
          )}
        </div>
      </header>

      <div className="mt-8 space-y-5">
        {active.map((d) => (
          <DomainCard key={d.id} domain={d} values={values} set={set} />
        ))}
      </div>

      <div className="sticky bottom-20 z-30 mt-8 md:bottom-6">
        <button
          disabled={mutation.isPending || filled === 0}
          onClick={() => mutation.mutate()}
          className="glow flex w-full items-center justify-center gap-2 rounded-2xl bg-[image:var(--gradient-tide)] py-4 font-medium text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-50"
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Save entry
        </button>
      </div>
    </main>
  );
}

function DomainCard({
  domain,
  values,
  set,
}: {
  domain: SymptomDomain;
  values: Record<string, number | boolean | string>;
  set: (key: string, value: number | boolean | string) => void;
}) {
  return (
    <section className="glass rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <domain.icon className={`h-5 w-5 ${TONE[domain.tone]}`} />
        <h2 className="font-display text-2xl">{domain.title}</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{domain.blurb}</p>

      <div className="mt-6 space-y-6">
        {domain.fields.map((f) => (
          <div key={f.key}>
            <div className="flex items-baseline justify-between gap-3">
              <label className="text-sm font-medium">{f.label}</label>
              {f.hint && <span className="text-xs text-muted-foreground">{f.hint}</span>}
            </div>

            {f.kind === "scale" && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {SCALE_LABELS.map((label, i) => {
                  const selected = values[f.key] === i;
                  return (
                    <button
                      key={label}
                      onClick={() => set(f.key, i)}
                      className={`rounded-2xl border px-2 py-3 text-[11px] transition-all ${
                        selected
                          ? "border-primary bg-primary/20 text-foreground"
                          : "border-border bg-background/30 text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <span className="block font-display text-lg">{i}</span>
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {f.kind === "count" && (
              <div className="mt-3 flex items-center gap-4">
                <button
                  onClick={() => set(f.key, Math.max(0, Number(values[f.key] ?? 0) - 1))}
                  className="rounded-full border border-border p-2.5 hover:border-primary"
                  aria-label={`Decrease ${f.label}`}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-display text-3xl">{Number(values[f.key] ?? 0)}</span>
                <button
                  onClick={() =>
                    set(f.key, Math.min(f.max ?? 20, Number(values[f.key] ?? 0) + 1))
                  }
                  className="rounded-full border border-border p-2.5 hover:border-primary"
                  aria-label={`Increase ${f.label}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}

            {f.kind === "toggle" && (
              <button
                onClick={() => set(f.key, !values[f.key])}
                className={`mt-3 rounded-full border px-5 py-2.5 text-sm transition-colors ${
                  values[f.key]
                    ? "border-primary bg-primary/20"
                    : "border-border bg-background/30 text-muted-foreground"
                }`}
              >
                {values[f.key] ? "Yes" : "No"}
              </button>
            )}
          </div>
        ))}

        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea
            rows={3}
            maxLength={1000}
            value={String(values[domain.noteKey] ?? "")}
            onChange={(e) => set(domain.noteKey, e.target.value)}
            placeholder="Anything you want your future self — or your doctor — to read."
            className="mt-2 w-full resize-none rounded-2xl border border-input bg-background/40 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary"
          />
        </div>
      </div>
    </section>
  );
}
