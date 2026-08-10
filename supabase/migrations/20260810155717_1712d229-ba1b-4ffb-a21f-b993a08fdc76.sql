CREATE TYPE public.life_stage AS ENUM ('premenopause','perimenopause','menopause','postmenopause','unsure');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  stage public.life_stage NOT NULL DEFAULT 'unsure',
  birth_year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.symptom_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  entry_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,

  mood SMALLINT,
  mood_swings SMALLINT,
  anxiety SMALLINT,
  irritability SMALLINT,
  brain_fog SMALLINT,
  mental_note TEXT,

  flow_intensity SMALLINT,
  spotting BOOLEAN NOT NULL DEFAULT false,
  missed_period BOOLEAN NOT NULL DEFAULT false,
  cycle_note TEXT,

  hot_flashes SMALLINT,
  night_sweats SMALLINT,
  weight_change SMALLINT,
  fatigue SMALLINT,
  joint_aches SMALLINT,
  physical_note TEXT,

  sleep_quality SMALLINT,
  night_wakings SMALLINT,
  energy_level SMALLINT,
  rest_note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX symptom_entries_user_date_idx ON public.symptom_entries (user_id, entry_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.symptom_entries TO authenticated;
GRANT ALL ON public.symptom_entries TO service_role;
ALTER TABLE public.symptom_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entries_select_own" ON public.symptom_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "entries_insert_own" ON public.symptom_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "entries_update_own" ON public.symptom_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "entries_delete_own" ON public.symptom_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER entries_set_updated_at BEFORE UPDATE ON public.symptom_entries
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();