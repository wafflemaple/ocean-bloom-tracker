import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tidal — Daily Perimenopause & Menopause Tracker" },
      {
        name: "description",
        content:
          "Track your perimenopause and menopause routine daily: mood, cycle, physical signs and rest — with streaks, gentle reminders and a doctor-ready summary.",
      },
      { property: "og:title", content: "Tidal — Daily Perimenopause & Menopause Tracker" },
      {
        property: "og:description",
        content: "A calm daily tracker for the transition, with timely, evidence-led guidance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/home" });
  },
  component: () => null,
});
