import { get, writable } from "svelte/store";
import type { Tables } from "../types";
import { getany, reduceObject } from "$lib";
import { getAttendances } from "../query";
import supabase from "..";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Attendance, Profile } from "$lib/types";
import profiles from "./profiles";
import { toast } from "$lib/ui/widgets/Toaster.svelte";

type Attendances = Record<number, Tables<"attendances">>;
type RealtimeCallback = (
  ev: RealtimePostgresChangesPayload<Attendance>
) => void;

function createChannel(cb: RealtimeCallback) {
  return supabase.channel("attendances").on<Tables<"attendances">>(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "attendances",
    },
    cb
  );
}

export default writable<Attendances>({}, (set, update) => {
  function edit(o: Attendance) {
    update((prev) => ({ ...prev, [o.id]: o }));
  }

  function remove(o: Attendance["id"]) {
    update((prev) => {
      delete prev[o];
      return prev;
    });
  }

  const channel = createChannel((ev) => {
    if (ev.eventType === "INSERT") {
      const attendance = ev.new;
      const profile = getany<Profile>(get(profiles), [attendance.profile_id]);
      const similarity = getany(attendance, ["data", "similarity"], 0)! * 100;
      toast("Attendance Success", {
        id: `attendance-${attendance.id}`,
        duration: 10000,
        description: `${profile?.name}: ${similarity.toFixed(2)}%`,
        type: "info",
      });
      edit(ev.new);
    } else if (ev.eventType === "UPDATE") edit(ev.new);
    else if (ev.old.id) remove(ev.old.id);
  });

  getAttendances()
    .then((e) => e.data ?? [])
    .then(reduceObject((e) => e.id))
    .then(set)
    .then(() => channel.subscribe());
});
