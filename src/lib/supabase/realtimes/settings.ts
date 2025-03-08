import { readable, writable } from "svelte/store";
import type { Tables } from "../types";
import { getany, reduceObject } from "$lib";
import supabase from "..";
import { getSettings } from "../query";

type Settings = Record<string, Tables<"settings">>

const settings = writable<Settings>({}, (set, update) => {
  const channel = supabase
    .channel("settings")
    .on<Tables<"settings">>(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "settings",
      },
      (ev) => {
        if (ev.eventType === "UPDATE" || ev.eventType === "INSERT") {
          update((prev) => ({ ...prev, [ev.new.key]: ev.new }));
        }
      }
    )

  getSettings()
    .then(e => e.data ?? [])
    .then(reduceObject(e => e.key))
    .then(set)
    .then(() => channel.subscribe())
}
);

export const backend_server = readable<string | undefined>(undefined, (set) => {
  settings.subscribe(v => {
    const server = getany<string>(v, ["BACKEND_SERVER", "value"])
    set(server)
  })
})

export default settings
