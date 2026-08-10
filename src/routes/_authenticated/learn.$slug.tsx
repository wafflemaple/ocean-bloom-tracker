import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { TOPICS } from "@/content/learn";

export const Route = createFileRoute("/_authenticated/learn/$slug")({
  loader: ({ params }) => {
    const topic = TOPICS.find((t) => t.slug === params.slug);
    if (!topic) throw notFound();
    return topic;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Learn"} · Tidal` },
      { name: "description", content: loaderData?.summary ?? "Perimenopause library." },
      { property: "og:title", content: `${loaderData?.title ?? "Learn"} · Tidal` },
      { property: "og:description", content: loaderData?.summary ?? "Perimenopause library." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => <Fallback message="This chapter didn't load." />,
  notFoundComponent: () => <Fallback message="That chapter doesn't exist." />,
  component: TopicPage,
});

function Fallback({ message }: { message: string }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="font-display text-3xl">{message}</p>
      <Link to="/learn" className="mt-6 inline-block text-primary">
        Back to the library
      </Link>
    </main>
  );
}

function TopicPage() {
  const topic = Route.useLoaderData();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        to="/learn"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Library
      </Link>

      <header className="rise mt-6">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">{topic.kicker}</p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{topic.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{topic.summary}</p>
      </header>

      <div className="mt-10 space-y-8">
        {topic.sections.map((s, i) => (
          <section key={i} className="glass rounded-3xl p-6 sm:p-8">
            <h2 className="font-display text-2xl">{s.heading}</h2>
            {s.body?.map((p, j) => (
              <p key={j} className="mt-4 leading-relaxed text-foreground/85">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-4 space-y-2">
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {s.excerpt && (
              <blockquote className="mt-5 rounded-2xl border-l-2 border-accent bg-background/30 p-5">
                <p className="font-display text-xl leading-relaxed">“{s.excerpt.text}”</p>
                {s.excerpt.source && (
                  <footer className="mt-3 text-xs text-muted-foreground">
                    {s.excerpt.source}
                  </footer>
                )}
              </blockquote>
            )}
            {s.table && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {s.table.columns.map((c) => (
                        <th key={c} className="border-b border-border pb-2 pr-4 font-normal">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((row, r) => (
                      <tr key={r} className="align-top">
                        {row.map((cell, c) => (
                          <td key={c} className="border-b border-border/50 py-3 pr-4">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        Educational content only — not medical advice, diagnosis or treatment.
      </p>
    </main>
  );
}
