import { createClient } from "@supabase/supabase-js";

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class WebSocket {};
}

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vetyyyemzhqinqoeqakz.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZldHl5eWVtemhxaW5xb2VxYWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNzA2OTYsImV4cCI6MjEwNzY0NjY5Nn0.xJnXjekIYjzw1QRP9MkFFfku6NPzfePgGwyy6mR1QoI";

// Public client for browser and server requests
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
  },
});

// Helper for testing Supabase database connectivity
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from("HotelConfig")
      .select("name, phone, address")
      .limit(1)
      .single();

    if (error) {
      return { connected: false, error: error.message };
    }

    return { connected: true, data };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}
