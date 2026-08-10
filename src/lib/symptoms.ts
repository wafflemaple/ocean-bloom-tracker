import { Brain, Droplets, Flame, Moon, type LucideIcon } from "lucide-react";

export type FieldKind = "scale" | "count" | "toggle";

export type SymptomField = {
  key: string;
  label: string;
  kind: FieldKind;
  hint?: string;
  max?: number;
};

export type SymptomDomain = {
  id: "mental" | "cycle" | "physical" | "rest";
  title: string;
  blurb: string;
  icon: LucideIcon;
  tone: "primary" | "bloom" | "accent" | "moss";
  noteKey: string;
  fields: SymptomField[];
};

export const SCALE_LABELS = ["None", "Mild", "Moderate", "Strong", "Severe"];

export const DOMAINS: SymptomDomain[] = [
  {
    id: "mental",
    title: "Mental health",
    blurb: "The brain often changes before the body does. This is where we look first.",
    icon: Brain,
    tone: "primary",
    noteKey: "mental_note",
    fields: [
      { key: "mood", label: "Overall mood", kind: "scale", hint: "0 low · 4 bright" },
      { key: "mood_swings", label: "Mood swings", kind: "scale" },
      { key: "anxiety", label: "Anxiety", kind: "scale" },
      { key: "irritability", label: "Irritability", kind: "scale" },
      { key: "brain_fog", label: "Brain fog", kind: "scale" },
    ],
  },
  {
    id: "cycle",
    title: "Cycle changes",
    blurb: "Flow length, missed periods and spotting.",
    icon: Droplets,
    tone: "bloom",
    noteKey: "cycle_note",
    fields: [
      { key: "flow_intensity", label: "Flow intensity", kind: "scale" },
      { key: "spotting", label: "Spotting", kind: "toggle" },
      { key: "missed_period", label: "Missed period", kind: "toggle" },
    ],
  },
  {
    id: "physical",
    title: "Physical signs",
    blurb: "Hot flashes, night sweats, weight, fatigue and joints.",
    icon: Flame,
    tone: "accent",
    noteKey: "physical_note",
    fields: [
      { key: "hot_flashes", label: "Hot flashes", kind: "count", hint: "how many so far", max: 20 },
      { key: "night_sweats", label: "Night sweats", kind: "scale" },
      { key: "weight_change", label: "Weight change felt", kind: "scale" },
      { key: "fatigue", label: "Fatigue", kind: "scale" },
      { key: "joint_aches", label: "Joint / muscle aches", kind: "scale" },
    ],
  },
  {
    id: "rest",
    title: "Rest & comfort",
    blurb: "Sleep quality, night waking and energy.",
    icon: Moon,
    tone: "moss",
    noteKey: "rest_note",
    fields: [
      { key: "sleep_quality", label: "Sleep quality", kind: "scale", hint: "0 poor · 4 restorative" },
      { key: "night_wakings", label: "Night wakings", kind: "count", max: 10 },
      { key: "energy_level", label: "Energy level", kind: "scale", hint: "0 empty · 4 full" },
    ],
  },
];

export const ALL_SCALE_KEYS = DOMAINS.flatMap((d) =>
  d.fields.filter((f) => f.kind === "scale").map((f) => f.key),
);

export const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  DOMAINS.flatMap((d) => d.fields.map((f) => [f.key, f.label])),
);

export type SymptomEntry = {
  id: string;
  logged_at: string;
  entry_date: string;
  mood: number | null;
  mood_swings: number | null;
  anxiety: number | null;
  irritability: number | null;
  brain_fog: number | null;
  mental_note: string | null;
  flow_intensity: number | null;
  spotting: boolean;
  missed_period: boolean;
  cycle_note: string | null;
  hot_flashes: number | null;
  night_sweats: number | null;
  weight_change: number | null;
  fatigue: number | null;
  joint_aches: number | null;
  physical_note: string | null;
  sleep_quality: number | null;
  night_wakings: number | null;
  energy_level: number | null;
  rest_note: string | null;
};

/** Burden score for a day: mean of the "bad-when-high" scales, 0-4. */
export function entryLoad(entry: SymptomEntry): number {
  const keys = [
    "mood_swings",
    "anxiety",
    "irritability",
    "brain_fog",
    "night_sweats",
    "fatigue",
    "joint_aches",
    "weight_change",
  ] as const;
  const values = keys
    .map((k) => entry[k])
    .filter((v): v is number => typeof v === "number" && v > 0);
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
