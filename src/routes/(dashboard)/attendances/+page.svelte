<script lang="ts">
  import attendances from "$lib/supabase/realtimes/attendances";
  import profiles from "$lib/supabase/realtimes/profiles";
  import { getany, saveToExcel } from "$lib";
  import { getPublicURLFormFullPath } from "$lib/supabase/storage";
  import {
    CalendarIcon,
    DownloadIcon,
    ImageIcon,
    SearchIcon,
  } from "lucide-svelte";

  let today = $state(true);

  const attendancesArr = $derived(
    Object.entries($attendances).filter((v) => {
      if (!today) return true;
      const todayDate = new Date().toDateString();
      const attendanceDate = new Date(v[1].created_at).toDateString();
      return todayDate === attendanceDate;
    }),
  );

  function download() {
    const data = attendancesArr.map(([id, e]) => {
      return {
        id,
        tanggal: e.created_at,
        nama: getany($profiles, [e.profile_id, "name"]),
        uid: getany($profiles, [e.profile_id, "uid"]),
        similarity: getany(e.data, ["similarity"], 0)! * 100,
        image: getPublicURLFormFullPath(getany(e.data, ["image"])),
      };
    });
    saveToExcel(data, "attendances.xlsx");
  }
</script>

<div class="overflow-auto w-full h-full">
  <div class="h-full max-w-[1024px] sm:w-full w-max m-auto p-3 overflow-hidden">
    <div class="my-4">
      <h2 class="text-white text-2xl font-semibold mb-2">Attendances</h2>
      <div class="flex items-center gap-2">
        <label class="input">
          <SearchIcon size={18} />
          <input type="search" class="grow" placeholder="Search" />
          <kbd class="kbd kbd-sm">⌘</kbd>
          <kbd class="kbd kbd-sm">K</kbd>
        </label>
        <button
          class="btn"
          class:btn-primary={today}
          onclick={() => (today = !today)}
          ><CalendarIcon size={18} /> Today</button
        >
        <button class="btn btn-primary" onclick={download}
          ><DownloadIcon size={18} /> Download</button
        >
      </div>
    </div>
    <div class="h-full w-full overflow-auto rounded-xl">
      <table class="table table-pin-rows bg-base-300">
        <thead>
          <tr>
            <th>Id</th>
            <th>Timestamp</th>
            <th>Profile</th>
            <th>Image</th>
            <th>Percentage</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {#each attendancesArr as [id, attendance]}
            <tr>
              <td>{id}</td>
              <td>{new Date(attendance.created_at).toLocaleString()}</td>
              <td>{getany($profiles, [attendance.profile_id, "name"])}</td>
              <td>
                <a
                  class="btn btn-circle"
                  href={getPublicURLFormFullPath(
                    getany(attendance, ["data", "image"]),
                  )}
                >
                  <ImageIcon size={18} />
                </a>
              </td>
              <td
                >{(
                  getany(attendance, ["data", "similarity"], 0)! * 100
                ).toFixed(2)}%</td
              >
              <td>
                {getany(attendance, ["data", "absen_type"], "in")!}
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="4">Empty</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
