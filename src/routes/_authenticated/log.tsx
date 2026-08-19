import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { createEntry } from "@/lib/api";
import {
  DOMAINS,
  SCALE_LABELS,
  todayISO,
  type SymptomDomain,
  type SymptomField,
} from "@/lib/symptoms";
import { cn } from "@/lib/utils";

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
        content: "Record rest, mood, physical signs and your cycle — one calm category at a time.",
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
  accent: "text-[color:var(--sunlit)]",
  moss: "text-[color:var(--moss)]",
};

function LogPage() {
  const { domain } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, number | boolean | string>>({});
  const [date, setDate] = useState(todayISO());
  const [current, setCurrent] = useState<SymptomDomain["id"]>(domain ?? "rest");

  const active = DOMAINS.find((d) => d.id === current) ?? DOMAINS[0]!;

  const mutation = useMutation({
    mutationFn: () => createEntry(values, date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entries"] });
      toast.success("Saved. That's today's step done.");
      navigate({ to: "/home" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const set = (key: string, value: number | boolean | string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const filledIn = (d: SymptomDomain) =>
    d.fields.some((f) => {
      const v = values[f.key];
      return typeof v === "number" || v === true;
    }) || (values[d.noteKey] as string | undefined)?.trim();

  const filled = Object.values(values).filter((v) => v !== "" && v !== false).length;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6 md:pb-10">
      <header className="rise">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">How are you right now?</h1>
        <p className="mt-2 text-muted-foreground">
          Pick a category on the left. Everything you fill in saves together as one entry.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">For</label>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-full border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </header>

      <div className="mt-6 grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
        {/* Category rail */}
        <nav className="flex gap-2 overflow-x-auto pb-1 md:sticky md:top-20 md:h-fit md:flex-col md:overflow-visible">
          {DOMAINS.map((d) => (
            <button
              key={d.id}
              onClick={() => setCurrent(d.id)}
              className={cn(
                "flex min-w-[150px] items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors md:min-w-0",
                current === d.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <d.icon className={cn("h-4 w-4 shrink-0", TONE[d.tone])} />
              <span className="flex-1">{d.title}</span>
              {filledIn(d) && <Check className="h-3.5 w-3.5 text-[color:var(--moss)]" />}
            </button>
          ))}
        </nav>

        <DomainPanel key={active.id} domain={active} values={values} set={set} />
      </div>

      <div className="sticky bottom-20 z-30 mt-6 md:bottom-6">
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

function DomainPanel({
  domain,
  values,
  set,
}: {
  domain: SymptomDomain;
  values: Record<string, number | boolean | string>;
  set: (key: string, value: number | boolean | string) => void;
}) {
  const Icon = domain.icon;
  return (
    <section className="glass rise rounded-3xl p-6 sm:p-7">
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-1 h-5 w-5", TONE[domain.tone])} />
        <div>
          <h2 className="font-display text-2xl">{domain.title}</h2>
          <p className="text-sm text-muted-foreground">{domain.blurb}</p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {domain.fields.map((f) => (
          <Field key={f.key} field={f} value={values[f.key]} set={set} />
        ))}

        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Note</label>
          <textarea
            rows={3}
            maxLength={500}
            value={(values[domain.noteKey] as string) ?? ""}
            onChange={(e) => set(domain.noteKey, e.target.value)}
            placeholder="Anything worth remembering?"
            className="mt-1.5 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary"
          />
        </div>
      </div>
    </section>
  );
}

function Field({
  field,
  value,
  set,
}: {
  field: SymptomField;
  value: number | boolean | string | undefined;
  set: (key: string, value: number | boolean | string) => void;
}) {
  if (field.kind === "toggle") {
    const on = value === true;
    return (
      <button
        onClick={() => set(field.key, !on)}
        aria-pressed={on}
        className={cn(
          "flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-sm transition-colors",
          on ? "border-primary bg-primary/10 text-foreground" : "border-border",
        )}
      >
        <span>{field.label}</span>
        <span
          className={cn(
            "flex h-6 w-11 items-center rounded-full px-0.5 transition-colors",
            on ? "bg-primary" : "bg-secondary",
          )}
        >
          <span
            className={cn(
              "h-5 w-5 rounded-full bg-card transition-transform",
              on && "translate-x-5",
            )}
          />
        </span>
      </button>
    );
  }

  if (field.kind === "count") {
    const n = typeof value === "number" ? value : 0;
    return (
      <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
        <div>
          <p className="text-sm">{field.label}</p>
          {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => set(field.key, Math.max(0, n - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-primary"
            aria-label={`Decrease ${field.label}`}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center font-display text-2xl">{n}</span>
          <button
            onClick={() => set(field.key, Math.min(field.max ?? 20, n + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-primary"
            aria-label={`Increase ${field.label}`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const selected = typeof value === "number" ? value : null;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm">{field.label}</p>
        <p className="text-xs text-muted-foreground">
          {selected === null ? (field.hint ?? "not set") : SCALE_LABELS[selected]}
        </p>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {SCALE_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => set(field.key, i)}
            aria-pressed={selected === i}
            className={cn(
              "rounded-xl border py-3 text-xs transition-colors",
              selected === i
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
