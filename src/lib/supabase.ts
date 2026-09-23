import { createClient } from "@supabase/supabase-js";

export type Joke = {
  id: number;
  setup: string;
  punchline: string;
};

export async function getJokes(): Promise<Joke[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("jokes")
    .select("id, setup, punchline")
    .order("id");

  if (error) {
    throw new Error(`Unable to load jokes: ${error.message}`);
  }

  return data;
}
