import { supabase } from "@/integrations/supabase/client";
import type { SymptomEntry } from "@/lib/symptoms";

export type Profile = {
  id: string;
  display_name: string | null;
  stage: "premenopause" | "perimenopause" | "menopause" | "postmenopause" | "unsure";
  birth_year: number | null;
};

export async function fetchProfile(): Promise<Profile | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, stage, birth_year")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function saveProfile(patch: Partial<Profile>): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: auth.user.id, ...patch }, { onConflict: "id" });
  if (error) throw error;
}

export async function fetchEntries(sinceISO?: string): Promise<SymptomEntry[]> {
  let query = supabase
    .from("symptom_entries")
    .select("*")
    .order("logged_at", { ascending: false })
    .limit(500);
  if (sinceISO) query = query.gte("entry_date", sinceISO);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as SymptomEntry[];
}

export async function createEntry(
  values: Record<string, unknown>,
  entryDate: string,
): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not signed in");
  const { error } = await supabase.from("symptom_entries").insert({
    ...values,
    user_id: auth.user.id,
    entry_date: entryDate,
  } as never);
  if (error) throw error;
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from("symptom_entries").delete().eq("id", id);
  if (error) throw error;
}
