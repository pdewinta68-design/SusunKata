import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("YOUR_PROJECT")) {
    throw new Error("Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu.");
  }

  return createBrowserClient(url, key);
}
