import { createClient } from "@supabase/supabase-js";

// ─── Supabase client (single shared instance) ──────────────────────────────
// NOTE: In a real deployment these should come from environment variables
// (import.meta.env.VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) rather than
// being hardcoded, so different environments (dev/staging/prod) can point
// to different projects without code changes.
export const SUPABASE_URL = "https://zqiceeuhgkfnskrxbmvr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxaWNlZXVoZ2tmbnNrcnhibXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTA4MzQsImV4cCI6MjA5NjQ4NjgzNH0.m1RlNq4bVX1o-XeVz_qGtnbTad8UNAmGh1Q_c37Fe4Q";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
