// Supabase client is dynamically loaded to allow running without integration during design
export async function getSupabase() {
  try {
    const mod = await import("@/integrations/supabase/client");
    return (mod as any).supabase as any;
  } catch (e) {
    throw new Error("Supabase is not connected. Please connect Supabase in the project to enable backend features.");
  }
}

export type EntryType = "income" | "expense";

export interface FinanceEntry {
  id?: string;
  user_id?: string;
  type: EntryType;
  amount: number;
  category: string;
  date: string; // ISO string
  note?: string | null;
  created_at?: string;
}

export interface Profile {
  id?: string;
  user_id?: string;
  shop_name?: string;
  owner_name?: string;
  created_at?: string;
}

const TABLE_INCOME = "incomes";
const TABLE_EXPENSE = "expenses";
const TABLE_PROFILE = "profiles";

export async function getSession() {
  const supabase = await getSupabase();
  return await supabase.auth.getSession();
}

export async function signUp(email: string, password: string) {
  const supabase = await getSupabase();
  return await supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  const supabase = await getSupabase();
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = await getSupabase();
  return await supabase.auth.signOut();
}

export async function upsertProfile(profile: Profile) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from(TABLE_PROFILE).upsert(profile).select().single();
  if (error) throw error;
  return data as Profile;
}

export async function fetchProfile() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from(TABLE_PROFILE).select("*").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function addEntry(entry: FinanceEntry) {
  const supabase = await getSupabase();
  const table = entry.type === "income" ? TABLE_INCOME : TABLE_EXPENSE;

  // Ensure we don't insert the `type` field (not present in tables) and set user_id explicitly
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const { type, ...rest } = entry as any;
  const payload = { ...rest, user_id: userId };

  const { data, error } = await supabase.from(table).insert(payload).select().single();
  if (error) throw error;
  return data as FinanceEntry;
}

export async function fetchEntries(type: EntryType, from?: string, to?: string) {
  const supabase = await getSupabase();
  const table = type === "income" ? TABLE_INCOME : TABLE_EXPENSE;
  let query = supabase.from(table).select("*").order("date", { ascending: false });
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FinanceEntry[];
}

export async function removeEntry(type: EntryType, id: string) {
  const supabase = await getSupabase();
  const table = type === "income" ? TABLE_INCOME : TABLE_EXPENSE;
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}
