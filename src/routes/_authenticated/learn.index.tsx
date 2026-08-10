import { createFileRoute, Link } from "@tanstack/react-router";
import { TOPICS } from "@/content/learn";

export const Route = createFileRoute("/_authenticated/learn/")({
  head: () => ({
    meta: [
      { title: "Learn · Tidal" },
      {
        name: "description",
        content:
          "The perimenopause library: stages, the neurology of the transition, misdiagnosis watch and global traditional medicine.",
      },
      { property: "og:title", content: "Learn · Tidal" },
      { property: "og:description", content: "Evidence-led reading for the transition." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="rise max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Library</p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
          What's actually happening to you
        </h1>
        <p className="mt-3 text-muted-foreground">
          Drawn from <em>The New Perimenopause</em> by Mary Claire Haver, MD, and from six
          traditional medicine systems that named this transition long before modern medicine did.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {TOPICS.map((t) => (
          <Link
            key={t.slug}
            to="/learn/$slug"
            params={{ slug: t.slug }}
            className="glass rounded-3xl p-6 transition-transform hover:-translate-y-1"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent">{t.kicker}</p>
            <h2 className="mt-3 font-display text-2xl">{t.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.summary}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
