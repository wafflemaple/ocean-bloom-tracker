import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchProfile, saveProfile, type Profile } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile · Tidal" },
      { name: "description", content: "Set your name, stage and birth year, or sign out." },
      { property: "og:title", content: "Your profile · Tidal" },
      { property: "og:description", content: "Your private Tidal account settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const STAGES: { value: Profile["stage"]; label: string; hint: string }[] = [
  { value: "premenopause", label: "Premenopause", hint: "Cycles still regular" },
  { value: "perimenopause", label: "Perimenopause", hint: "Cycles changing, symptoms started" },
  { value: "menopause", label: "Menopause", hint: "12 months without a period" },
  { value: "postmenopause", label: "Postmenopause", hint: "Beyond that point" },
  { value: "unsure", label: "Not sure yet", hint: "That's very common" },
];

function ProfilePage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const [name, setName] = useState("");
  const [stage, setStage] = useState<Profile["stage"]>("unsure");
  const [birthYear, setBirthYear] = useState("");

  useEffect(() => {
    if (!data) return;
    setName(data.display_name ?? "");
    setStage(data.stage);
    setBirthYear(data.birth_year ? String(data.birth_year) : "");
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      saveProfile({
        display_name: name.trim() || null,
        stage,
        birth_year: birthYear ? Number(birthYear) : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Saved.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">Your profile</h1>
      <p className="mt-2 text-muted-foreground">Only you can see anything you record here.</p>

      <section className="glass mt-8 rounded-3xl p-6 sm:p-8">
        <label className="text-xs uppercase tracking-widest text-muted-foreground">Name</label>
        <input
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-2xl border border-input bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary"
        />

        <p className="mt-7 text-xs uppercase tracking-widest text-muted-foreground">Your stage</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {STAGES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStage(s.value)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                stage === s.value ? "border-primary bg-primary/15" : "border-border bg-background/30"
              }`}
            >
              <span className="block text-sm font-medium">{s.label}</span>
              <span className="text-xs text-muted-foreground">{s.hint}</span>
            </button>
          ))}
        </div>

        <label className="mt-7 block text-xs uppercase tracking-widest text-muted-foreground">
          Birth year
        </label>
        <input
          inputMode="numeric"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="1978"
          className="mt-1.5 w-40 rounded-2xl border border-input bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary"
        />

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="glow mt-8 w-full rounded-2xl bg-[image:var(--gradient-tide)] py-3.5 font-medium text-primary-foreground disabled:opacity-60"
        >
          Save profile
        </button>
      </section>

      <button
        onClick={signOut}
        className="mt-6 w-full rounded-2xl border border-border py-3.5 text-sm text-muted-foreground hover:text-foreground"
      >
        Sign out
      </button>
    </main>
  );
}
