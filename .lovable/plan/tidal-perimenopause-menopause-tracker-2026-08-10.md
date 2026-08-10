# Tidal — Perimenopause & Menopause Tracker

An ocean-aesthetic symptom tracker with real accounts, daily logging across four symptom domains, and an education library grounded in *The New Perimenopause* plus the traditional-medicine framework you provided.

## Look and feel

Inspired by your two photos: turquoise shallows, deep sea blue, warm sunlit gold, sand, and soft coral-pink blooms.

- Palette: deep ocean navy base, aqua/turquoise primary, sunlit gold accent, sand and shell neutrals, coral for alerts.
- Typography: an elegant display serif for headings paired with a soft, rounded sans for body.
- Texture: layered gradient "water" backgrounds, glassy translucent cards, gentle wave dividers, soft glow shadows, slow ambient shimmer on the login and home hero.
- Motion: fade-and-rise on scroll, ripple feedback on taps, animated wave footer. Calm, never busy.

Your two uploaded photos are used as full-bleed atmosphere on the auth screen and the home hero (uploaded as CDN assets, not committed binaries).

## Accounts

Real accounts on Lovable Cloud — email + password sign-up and sign-in, plus Google sign-in. Every user gets a profile row (display name, optional stage: pre / peri / meno / post, birth year). All tracking data is private to the user via row-level security. Password reset flow included.

## Home screen (after login)

- Ocean hero with greeting, today's date, and current cycle-day / stage badge.
- "How are you today?" — one-tap entry into today's log.
- Four domain cards, mental health given top billing and the largest card:
  1. **Mental health** (primary) — mood swings, anxiety, irritability, brain fog, plus a mood scale and free-text note.
  2. **Cycle changes** — flow length, flow intensity, missed period, spotting.
  3. **Physical signs** — hot flashes (count + severity), night sweats, weight change, fatigue, joint aches.
  4. **Rest & comfort** — sleep quality, night waking count, energy level.
- Recent-days strip and a "trend at a glance" mini chart.

## Tracking

- One log per day per user; each domain is a section of the daily log, all optional.
- Severity sliders (0–4) and toggles, with a note field per domain.
- Calendar view: month grid coloured by dominant symptom load, tap a day to view or edit.
- Insights page: symptom frequency over 30/90 days, mental-health trend line, hot-flash counts, sleep vs mood overlay, and most-frequent symptoms.
- Export a symptom summary as a doctor-ready PDF/print sheet — this directly addresses the "doctor's misconception / lack of care" problem you raised.

## Learn library

Content sourced from your notes and the book excerpts you provided:

- **Stages explained** — premenopause, perimenopause, menopause, postmenopause, with the definitions and excerpts you quoted, each properly attributed to *The New Perimenopause*, Mary Claire Haver, MD.
- **Why perimenopause is chaotic** — the egg-supply / brain-hormone explanation and the estrogen–brain cascade (glucose metabolism, GABA, serotonin/dopamine/norepinephrine).
- **Misdiagnosis watch** — cards for fibromyalgia vs MSM, IC/BPS vs GSM, long COVID vs perimenopause, adrenal fatigue vs HPA-axis disruption, PCOS/thyroid considerations, each with a "Take to your doctor" checklist.
- **Traditional medicine atlas** — your six-symptom-cluster tables across Ayurveda, TCM, Unani, Siddha, TAM, and Native American systems, presented as browsable comparison cards, plus the five-pillar universal synthesis.
- **Estrogen body map** — where estrogen loss shows up head to toe.

Educational content only, with a clear not-medical-advice note.

## Pages

`/` public ocean landing with sign-in CTA · `/auth` sign in / sign up · `/reset-password` · `/home` dashboard · `/log` daily entry · `/calendar` · `/insights` · `/learn` and `/learn/$topic` · `/profile`

## Technical notes

- TanStack Start routes; protected app pages live under an authenticated layout, landing and auth stay public.
- Lovable Cloud: `profiles`, `daily_logs` (one row per user per date, JSON-free typed columns per domain), `symptom_events` for repeatable events like hot flashes. RLS scoped to `auth.uid()` with explicit grants on every table.
- Design tokens (ocean palette, gradients, glass shadows, wave shapes) defined in `src/styles.css`; no hardcoded colours in components.
- Library content stored as typed TS content modules so it renders fast and stays editable.
- The epub is reference material for content authoring; excerpts stay short and attributed, the book file is not shipped in the app.

## Build order

1. Design system + landing page
2. Cloud auth, profiles, protected layout
3. Daily log schema + logging UI
4. Home dashboard
5. Calendar + insights + doctor export
6. Learn library
