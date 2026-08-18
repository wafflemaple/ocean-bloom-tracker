ALTER TABLE public.symptom_entries
  ADD COLUMN IF NOT EXISTS period_day boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cramps smallint,
  ADD COLUMN IF NOT EXISTS period_start boolean NOT NULL DEFAULT false;