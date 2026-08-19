import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bell, Check, Flame, Sparkles, Trophy } from "lucide-react";
import { fetchEntries, fetchProfile } from "@/lib/api";
import { DOMAINS, entryLoad, todayISO } from "@/lib/symptoms";
import { buildProgress, suggestion } from "@/lib/gamify";
import { BodyFigure } from "@/components/BodyFigure";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Your daily routine · Tidal" },
      {
        name: "description",
        content:
          "Your calm daily tracker: today's routine, streak, gentle guidance and a rotatable body guide.",
      },
      { property: "og:title", content: "Your daily routine · Tidal" },
      { property: "og:description", content: "Keep the habit, see the pattern, feel steadier." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const TONE: Record<string, string> = {
  primary: "text-primary",
  bloom: "text-[color:var(--bloom)]",
  accent: "text-[color:var(--sunlit)]",
  moss: "text-[color:var(--moss)]",
};

function HomePage() {
  const today = todayISO();
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries", "all"],
    queryFn: () => fetchEntries(),
  });

  const progress = useMemo(() => buildProgress(entries, today), [entries, today]);
  const tip = useMemo(() => suggestion(entries), [entries]);

  const trend = useMemo(() => {
    const days: { day: string; load: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayEntries = entries.filter((e) => e.entry_date === key);
      const load = dayEntries.length
        ? dayEntries.reduce((a, e) => a + entryLoad(e), 0) / dayEntries.length
        : 0;
      days.push({ day: key.slice(5), load: Number(load.toFixed(2)) });
    }
    return days;
  }, [entries]);

  const name = profile?.display_name?.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-10">
      <header className="rise">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">
          {greeting}
          {name ? `, ${name}` : ""}.
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Finish today's routine — it takes about a minute, and it keeps your record whole.
        </p>
      </header>

      {/* Routine ring + streak */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="glass rounded-3xl p-6">
          <div className="flex flex-wrap items-center gap-6">
            <RoutineRing pct={progress.ringPct} done={progress.questsDone} total={5} />
            <div className="min-w-[180px] flex-1">
              <h2 className="font-display text-2xl">Today's routine</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {progress.questsDone === 5
                  ? "Complete. Beautifully done — rest now."
                  : `${5 - progress.questsDone} small steps left.`}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Badge icon={Flame} label={`${progress.streak}-day streak`} />
                <Badge icon={Trophy} label={`Level ${progress.level} · ${progress.levelName}`} />
                <Badge icon={Sparkles} label={`${progress.points} pts`} />
              </div>
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-[image:var(--gradient-tide)] transition-all"
                    style={{
                      width: `${Math.min(100, (progress.intoLevel / progress.levelSpan) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {progress.intoLevel} / {progress.levelSpan} to the next level
                </p>
              </div>
            </div>
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {progress.quests.map((q) => (
              <li key={q.id}>
                <Link
                  to="/log"
                  search={q.domain ? { domain: q.domain } : {}}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors",
                    q.done
                      ? "border-[color:var(--moss)]/50 bg-[color:var(--moss)]/10"
                      : "border-border hover:border-primary",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border",
                      q.done
                        ? "border-transparent bg-[color:var(--moss)]/70 text-primary-foreground"
                        : "border-border",
                    )}
                  >
                    {q.done && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span className="flex-1">{q.label}</span>
                  <span className="text-xs text-muted-foreground">+{q.points}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4">
          <div className="glass rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Timely guidance
            </p>
            <h2 className="mt-2 font-display text-2xl">{tip.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
          </div>
          <ReminderCard />
        </div>
      </section>

      {/* Categories */}
      <section className="mt-6">
        <h2 className="font-display text-2xl">Track by category</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DOMAINS.map((d) => (
            <Link
              key={d.id}
              to="/log"
              search={{ domain: d.id }}
              className="glass rounded-3xl p-5 transition-transform hover:-translate-y-1"
            >
              <d.icon className={cn("h-5 w-5", TONE[d.tone])} />
              <h3 className="mt-3 font-display text-xl">{d.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Body guide */}
      <section className="mt-8">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <h2 className="font-display text-2xl">Where do you feel it?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Rotate the figure, tap an area, and it takes you straight to the right log.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <BodyFigure />
        </div>
      </section>

      {/* Trend */}
      <section className="glass mt-8 rounded-3xl p-6">
        <h2 className="font-display text-2xl">Last 14 days</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Average symptom load per day, 0 (calm) to 4 (severe).
        </p>
        <div className="mt-5 h-56">
          {isLoading ? (
            <div className="h-full animate-pulse rounded-2xl bg-secondary/60" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="loadFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis domain={[0, 4]} stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 14,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="load"
                  stroke="var(--color-chart-1)"
                  fill="url(#loadFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </main>
  );
}

function Badge({ icon: Icon, label }: { icon: typeof Flame; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {label}
    </span>
  );
}

function RoutineRing({ pct, done, total }: { pct: number; done: number; total: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--color-secondary)" strokeWidth="9" />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl">
          {done}/{total}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">steps</span>
      </div>
    </div>
  );
}

const REMINDER_KEY = "tidal-reminder";

function ReminderCard() {
  const [time, setTime] = useState("20:00");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(REMINDER_KEY);
    if (saved) {
      setEnabled(true);
      setTime(saved);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      const now = new Date();
      const stamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const firedKey = `tidal-fired-${todayISO()}`;
      if (stamp === time && !window.localStorage.getItem(firedKey)) {
        window.localStorage.setItem(firedKey, "1");
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Tidal", { body: "A minute for today's routine?" });
        }
      }
    }, 30_000);
    return () => window.clearInterval(id);
  }, [enabled, time]);

  async function toggle() {
    if (enabled) {
      setEnabled(false);
      window.localStorage.removeItem(REMINDER_KEY);
      return;
    }
    if ("Notification" in window && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
    setEnabled(true);
    window.localStorage.setItem(REMINDER_KEY, time);
  }

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Daily reminder</p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        A single quiet nudge, at the time that suits you.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <input
          type="time"
          value={time}
          onChange={(e) => {
            setTime(e.target.value);
            if (enabled) window.localStorage.setItem(REMINDER_KEY, e.target.value);
          }}
          className="rounded-full border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={toggle}
          className={cn(
            "rounded-full px-4 py-2 text-sm transition-colors",
            enabled
              ? "bg-primary/15 text-primary"
              : "border border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {enabled ? "Reminder on" : "Turn on"}
        </button>
      </div>
    </div>
  );
}
