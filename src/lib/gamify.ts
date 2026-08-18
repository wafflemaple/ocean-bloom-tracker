import { DOMAINS, domainsTouched, entryLoad, type SymptomEntry } from "@/lib/symptoms";

export type Quest = {
  id: string;
  label: string;
  hint: string;
  done: boolean;
  points: number;
  domain?: (typeof DOMAINS)[number]["id"];
};

export type Progress = {
  streak: number;
  bestStreak: number;
  points: number;
  level: number;
  levelName: string;
  intoLevel: number;
  levelSpan: number;
  quests: Quest[];
  questsDone: number;
  ringPct: number;
  daysTracked: number;
};

const LEVELS = [
  { at: 0, name: "First ripple" },
  { at: 60, name: "Steady tide" },
  { at: 180, name: "Deep current" },
  { at: 400, name: "Moon-keeper" },
  { at: 750, name: "Tide-reader" },
  { at: 1200, name: "Ocean-calm" },
];

function dayKeys(entries: SymptomEntry[]): Set<string> {
  return new Set(entries.map((e) => e.entry_date));
}

function shift(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function computeStreak(entries: SymptomEntry[]): { streak: number; best: number } {
  const days = dayKeys(entries);
  const today = new Date();
  let streak = 0;
  const startOffset = days.has(shift(today, 0)) ? 0 : days.has(shift(today, -1)) ? -1 : null;
  if (startOffset !== null) {
    let i = startOffset;
    while (days.has(shift(today, i))) {
      streak += 1;
      i -= 1;
    }
  }

  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    if (prev) {
      const gap = (Date.parse(day) - Date.parse(prev)) / 86_400_000;
      run = gap === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = day;
  }
  return { streak, best: Math.max(best, streak) };
}

export function buildProgress(entries: SymptomEntry[], todayKey: string): Progress {
  const todays = entries.filter((e) => e.entry_date === todayKey);
  const touchedToday = new Set(todays.flatMap(domainsTouched));
  const { streak, best } = computeStreak(entries);
  const daysTracked = dayKeys(entries).size;

  const quests: Quest[] = [
    ...DOMAINS.map((d) => ({
      id: d.id,
      label: d.title,
      hint: d.blurb,
      done: touchedToday.has(d.id),
      points: 10,
      domain: d.id,
    })),
    {
      id: "note",
      label: "Add one note",
      hint: "A sentence about your day makes patterns readable later.",
      done: todays.some((e) =>
        [e.mental_note, e.cycle_note, e.physical_note, e.rest_note].some(
          (n) => (n ?? "").trim().length > 0,
        ),
      ),
      points: 10,
    },
  ];

  const questsDone = quests.filter((q) => q.done).length;
  const points = daysTracked * 20 + entries.length * 5 + best * 15;
  const tier = [...LEVELS].reverse().find((l) => points >= l.at) ?? LEVELS[0]!;
  const index = LEVELS.indexOf(tier);
  const next = LEVELS[index + 1];
  const levelSpan = next ? next.at - tier.at : 400;

  return {
    streak,
    bestStreak: best,
    points,
    level: index + 1,
    levelName: tier.name,
    intoLevel: points - tier.at,
    levelSpan,
    quests,
    questsDone,
    ringPct: Math.round((questsDone / quests.length) * 100),
    daysTracked,
  };
}

/** Gentle, timely suggestion based on the last few days. */
export function suggestion(entries: SymptomEntry[]): { title: string; body: string } {
  const recent = entries.slice(0, 14);
  const avg = (pick: (e: SymptomEntry) => number | null) => {
    const values = recent.map(pick).filter((v): v is number => typeof v === "number");
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  };

  if (!entries.length) {
    return {
      title: "Start with one minute",
      body: "Open Log and rate your sleep and mood. One entry is enough to begin the pattern.",
    };
  }
  if (avg((e) => e.sleep_quality) > 0 && avg((e) => e.sleep_quality) < 2) {
    return {
      title: "Protect the last hour before bed",
      body: "Fragmented sleep is one of the earliest transition signals. Cool the room, dim the lights and keep the hour before bed screen-free — then log tomorrow's sleep to see if it moves.",
    };
  }
  if (avg((e) => e.anxiety) >= 2.2) {
    return {
      title: "Try a 6-minute breath break",
      body: "Falling estrogen disrupts GABA calming. Slow breathing at about six breaths a minute steadies the same system — put it right after your morning log.",
    };
  }
  if (avg((e) => e.hot_flashes) >= 2) {
    return {
      title: "Map your triggers",
      body: "Note what preceded each flash — caffeine, alcohol, heat, stress. Two weeks of notes usually reveals two or three reliable triggers.",
    };
  }
  if (avg((e) => e.joint_aches) >= 2) {
    return {
      title: "Strength beats rest here",
      body: "Musculoskeletal syndrome of menopause responds to loading. Two short resistance sessions a week, then track the ache score.",
    };
  }
  const load = recent.length ? recent.reduce((a, e) => a + entryLoad(e), 0) / recent.length : 0;
  if (load < 1) {
    return {
      title: "A calm fortnight",
      body: "Your load is low. Keep the daily habit going — the record matters most when things change.",
    };
  }
  return {
    title: "Bring the pattern to your doctor",
    body: "You have enough data for a summary. Insights prints a dated, measured picture so nothing gets dismissed as stress.",
  };
}
