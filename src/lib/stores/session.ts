import { browser } from "$app/environment";
import supabase from "$lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { readable } from "svelte/store";

const session = readable<SessionValue>(undefined, (set) => {
  if (browser) {
    supabase.auth.onAuthStateChange((_, session) => {
      set(session);
    });
  }
});

export type SessionValue = Session | null | undefined;

export default session;
