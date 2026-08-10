import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Brain, Droplets, Flame, Moon, Waves } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import coveAsset from "@/assets/ocean-cove.png.asset.json";
import pathAsset from "@/assets/ocean-path.png.asset.json";
import { BodyMap } from "@/components/BodyMap";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tidal — Perimenopause & Menopause Symptom Tracker" },
      {
        name: "description",
        content:
          "Track perimenopause and menopause symptoms across mental health, cycle, physical signs and rest — with a doctor-ready summary and an evidence-led library.",
      },
      { property: "og:title", content: "Tidal — Perimenopause & Menopause Symptom Tracker" },
      {
        property: "og:description",
        content:
          "A calm, ocean-quiet place to track the transition — mental health first — and take the evidence to your doctor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    icon: Brain,
    title: "Mental health first",
    body: "Mood swings, anxiety, irritability and brain fog get the largest card on your home screen — because the brain changes before the body does.",
  },
  {
    icon: Droplets,
    title: "Cycle changes",
    body: "Flow length, missed periods and spotting, captured without judgement or guesswork.",
  },
  {
    icon: Flame,
    title: "Physical signs",
    body: "Hot flashes, night sweats, weight change, fatigue and the joint ache nobody connects to estrogen.",
  },
  {
    icon: Moon,
    title: "Rest & comfort",
    body: "Sleep quality, night waking and the energy that rest doesn't seem to fix.",
  },
];

function Landing() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[92vh] overflow-hidden">
        <img
          src={coveAsset.url}
          alt="Turquoise cove framed by pink oleander blossoms"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[image:linear-gradient(180deg,oklch(0.16_0.05_245/60%)_0%,oklch(0.16_0.05_245/55%)_45%,var(--background)_100%)]" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col px-5 py-8 sm:px-8">
          <div className="flex items-center gap-2">
            <span className="glow h-6 w-6 rounded-full bg-[image:var(--gradient-tide)]" />
            <span className="font-display text-2xl">Tidal</span>
            <Link
              to={signedIn ? "/home" : "/auth"}
              className="ml-auto rounded-full border border-border/70 bg-background/30 px-4 py-2 text-sm backdrop-blur-md transition-colors hover:bg-background/60"
            >
              {signedIn ? "Open your tracker" : "Sign in"}
            </Link>
          </div>

          <div className="rise my-auto max-w-2xl py-16">
            <p className="text-xs uppercase tracking-[0.35em] text-accent">
              Perimenopause · Menopause · Postmenopause
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] sm:text-7xl">
              The transition isn't in your head.
              <span className="text-tide block">It starts there.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/85 sm:text-lg">
              A quiet, beautiful place to track every symptom in one app — mental health first —
              and walk into your doctor's office with evidence instead of apologies.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to={signedIn ? "/home" : "/auth"}
                className="glow group inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-tide)] px-7 py-3.5 font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                {signedIn ? "Go to your tracker" : "Create your account"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#body-map"
                className="rounded-full border border-border px-6 py-3.5 text-sm text-foreground/85 transition-colors hover:bg-secondary/50"
              >
                See what estrogen touches
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
        <Waves className="mx-auto h-6 w-6 text-primary" />
        <h2 className="mt-6 font-display text-4xl leading-tight sm:text-5xl">
          So what is the problem with menopause?
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Symptoms arrive scattered across a dozen specialists. Fibromyalgia. Interstitial cystitis.
          Long COVID. Adrenal fatigue. Anxiety. Each one plausible on its own — and each one
          sometimes the same hormone transition, unnamed. Tidal keeps the whole picture in one
          place, so the pattern becomes impossible to dismiss.
        </p>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map(({ icon: Icon, title, body }, i) => (
            <article
              key={title}
              className={`glass rounded-3xl p-7 transition-transform hover:-translate-y-1 ${i === 0 ? "sm:col-span-2" : ""}`}
            >
              <Icon className={`h-6 w-6 ${i === 0 ? "text-accent" : "text-primary"}`} />
              <h3 className="mt-4 font-display text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Body map */}
      <section id="body-map" className="relative overflow-hidden py-24">
        <img
          src={pathAsset.url}
          alt="Sunlit water path running between palms and white sand"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-[image:linear-gradient(180deg,var(--background)_0%,oklch(0.19_0.048_240/85%)_40%,var(--background)_100%)]" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Estrogen body map</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Every part of the body where estrogen production affects you
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Estrogen receptors sit in the brain, bone, gut, skin, bladder, joints and vessels. Tap a
            region to see what changes when the supply falls away.
          </p>
          <div className="mt-12">
            <BodyMap />
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <blockquote className="glass rounded-3xl p-8 sm:p-12">
          <p className="font-display text-2xl leading-relaxed sm:text-3xl">
            “The reason for this isn't that your hormones are randomly changing — it's that your egg
            supply has changed in quantity and quality, and increasing levels of brain hormones are
            needed to stimulate the release of an egg.”
          </p>
          <footer className="mt-6 text-sm text-muted-foreground">
            Informed by <em>The New Perimenopause</em>, Mary Claire Haver, MD
          </footer>
        </blockquote>
      </section>

      <footer className="border-t border-border/50 px-5 py-10 text-center text-xs text-muted-foreground">
        Tidal is an educational symptom tracker. It does not provide medical advice, diagnosis or
        treatment.
      </footer>
    </main>
  );
}
