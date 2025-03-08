<script lang="ts">
  import { createMediaDevicesStore } from "$lib/stores/media-devices.svelte";
  import { CameraIcon } from "lucide-svelte";
  import LiveAttendance from "./live-attendance.svelte";

  let cameraId: string | undefined = $state();
  let open_streaming = $state(false);
  const cameras = createMediaDevicesStore({ video: true });

  function start() {
    open_streaming = true;
  }
</script>

{#if open_streaming}
  <LiveAttendance {cameraId} bind:open={open_streaming} />
{:else}
  <div class="w-full h-full flex items-center justify-center p-5">
    <div class="card bg-base-100 w-96 shadow-sm">
      <div class="card-body">
        <h2 class="card-title">Live Attendance</h2>
        <label class="select">
          <span class="label"><CameraIcon size={18} /></span>
          {#if $cameras}
            <select bind:value={cameraId}>
              {#each $cameras as camera}
                <option value={camera.deviceId}>{camera.label}</option>
              {/each}
            </select>
          {:else}
            <span class="loading loading-dots"></span>
          {/if}
        </label>
        <div class="card-actions justify-end">
          <button
            disabled={!cameraId?.length}
            onclick={start}
            class="btn btn-primary">Start</button
          >
        </div>
      </div>
    </div>
  </div>
{/if}
