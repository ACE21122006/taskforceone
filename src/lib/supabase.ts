import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://acvzmsdpibjoqjufkcko.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIn0.dummy";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getFriendlyErrorMessage(err: any): string {
  if (!err) return "An unknown error occurred.";
  const msg = typeof err === "string" ? err : err.message || err.error_description || String(err);
  const msgLower = msg.toLowerCase();
  
  if (
    msgLower.includes("invalid api key") ||
    msgLower.includes("api key") ||
    msgLower.includes("apikey") ||
    msgLower.includes("jwt") ||
    msgLower.includes("failed to fetch") ||
    msgLower.includes("network error") ||
    msgLower.includes("load failed")
  ) {
    return "Our systems are down for a moment. Please try again later.";
  }
  return msg;
}
