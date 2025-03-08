import supabase from "$lib/supabase";
import type { PageLoad } from "./$types";

export const load: PageLoad = async (ev) => {
  ev.depends("members:list")
  return {
    members: supabase.from("members").select()
  }
}
