import { writable } from "svelte/store";
import type { Tables } from "../types";
import { getProfiles } from "../query";
import { reduceObject } from "$lib";
import supabase from "..";

type Profiles = Record<string, Tables<"profiles">>

const profiles = writable<Profiles>(undefined, (set, update) => {
  const channel = supabase
    .channel("profiles")
    .on<Tables<"profiles">>(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "profiles",
      },
      (ev) => {
        if (ev.eventType === "UPDATE" || ev.eventType === "INSERT") {
          update((prev) => ({ ...prev, [ev.new.id]: ev.new }));
        } else {
          update(prev => {
            if (ev.old.id && prev) delete prev[ev.old.id];
            return prev
          })
        }
      }
    )

  getProfiles()
    .then(e => e.data ?? [])
    .then(reduceObject(e => e.id))
    .then(set)
    .then(() => channel.subscribe())
}
);

export default profiles;
