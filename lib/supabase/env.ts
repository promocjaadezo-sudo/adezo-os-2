type SupabaseEnv = {
  url: string;
  anonKey: string;
};

const SUPABASE_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

export function getSupabaseEnv(): Partial<SupabaseEnv> {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function requireSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      `Missing Supabase environment variable: ${SUPABASE_URL_KEY}. Add it to .env.local and restart Next.js.`
    );
  }

  if (!anonKey) {
    throw new Error(
      `Missing Supabase environment variable: ${SUPABASE_ANON_KEY}. Add it to .env.local and restart Next.js.`
    );
  }

  if (url.includes("your-project.supabase.co")) {
    throw new Error(
      `Supabase URL is still a placeholder in ${SUPABASE_URL_KEY}. Set your real project URL from Supabase API settings.`
    );
  }

  if (anonKey === "your-anon-key") {
    throw new Error(
      `Supabase anon key is still a placeholder in ${SUPABASE_ANON_KEY}. Set your real anon key from Supabase API settings.`
    );
  }

  return {
    url,
    anonKey,
  };
}
