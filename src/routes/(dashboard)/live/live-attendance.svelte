<script lang="ts">
  import { extractVideoElementPosInfo } from "$lib/stores/video-pos-info.svelte";
  import Toaster, { dismiss, toast } from "$lib/ui/widgets/Toaster.svelte";
  import Webcam from "$lib/ui/widgets/Webcam.svelte";
  import { CheckIcon, InfoIcon, LogOutIcon } from "lucide-svelte";
  import { untrack } from "svelte";
  import { CreateWebRTC } from "./webrtc-helper.svelte";
  import { backend_server } from "$lib/supabase/realtimes/settings";
  import profiles from "$lib/supabase/realtimes/profiles";
  import { getany } from "$lib";
  import type { Profile } from "$lib/types";
  import createDetectionsFeed, {
    Detection,
  } from "$lib/stores/detections-feed.svelte";
  import createVerificationsFeed, {
    type Verification,
  } from "$lib/stores/verifications-feed.svelte";

  let {
    ipwebcam,
    cameraId,
    absen_type,
    open = $bindable(),
  }: {
    ipwebcam?: string;
    cameraId?: string;
    open?: boolean;
    absen_type?: string;
  } = $props();

  let webrtc: RTCPeerConnection | undefined = $state();
  let video: HTMLVideoElement | undefined = $state();
  let stream: MediaStream | undefined = $state();
  let container: HTMLElement;

  const detections = createDetectionsFeed();
  const verifications = createVerificationsFeed();
  const videoPosInfo = $derived(extractVideoElementPosInfo(video));

  // setup webrtc video track
  $effect(() => {
    if (webrtc && stream) {
      container.requestFullscreen();
      for (const t of stream.getVideoTracks()) webrtc.addTrack(t);
    }
  });

  // initialize webrtc
  $effect(() => {
    toast("initializing", {
      id: "streaming-status",
      duration: null,
      description: "Loading...",
      type: "loading",
      action: ExitButton,
    });

    webrtc = CreateWebRTC({
      onDetectionsMessage: untrack(() => detections.feed),
      onVerificationsMessage: untrack(() => verifications.feed),
      server: $backend_server + "/offer",
      absen_type: absen_type ?? "in",
    });

    return () => {
      webrtc?.close();
      dismiss("streaming-status");
    };
  });
</script>

<div
  bind:this={container}
  onfullscreenchange={() => {
    open = document.fullscreenElement === container;
  }}
>
  <Toaster />
  <Webcam
    bind:stream
    bind:video
    class="w-full h-full"
    deviceId={cameraId}
    src={ipwebcam}
  />

  {#if $videoPosInfo.tx > 0 || $videoPosInfo.ty > 0 || $videoPosInfo.w > 0 || $videoPosInfo.h > 0}
    {#each $detections as detection}
      {@render DetectionBox({ ...$videoPosInfo, detection })}
    {/each}
  {/if}
</div>

{#snippet ExitButton()}
  <button
    class="btn btn-circle btn-soft btn-error btn-sm"
    onclick={() => (open = false)}><LogOutIcon size={18} /></button
  >
{/snippet}

{#snippet DetectionBox({
  tx,
  ty,
  w,
  h,
  detection,
}: {
  tx: number;
  ty: number;
  w: number;
  h: number;
  detection: Detection;
})}
  {@const topx = detection.topx * w + tx}
  {@const topy = detection.topy * h + ty}
  {@const botx = detection.botx * w + tx}
  {@const boty = detection.boty * h + ty}
  {@const verified = getany<Verification>($verifications, [detection.id])}
  {@const profile = getany<Profile>($profiles, [verified?.label])}
  {@const status = verified?.extra.status ?? "idle"}
  {@const color =
    status === "success" ? "green" : status === "loading" ? "blue" : "red"}
  <div
    class="fixed ring-4 ring-blue-600"
    style="top: {topy}px; left: {topx}px; width: {botx -
      topx}px; height: {boty - topy}px;"
  >
    <div
      class="text-black text-nowrap whitespace-nowrap flex items-center gap-3 p-1 w-fit min-w-full"
      style="background-color: {color};"
    >
      <div>
        {#if status === "loading"}
          <span class="loading loading-spinner loading-xs"></span>
        {:else if status === "success"}
          <CheckIcon size={18} />
        {:else}
          <InfoIcon size={18} />
        {/if}
      </div>
      {profile?.name ?? "Unknown"}
      {verified && (verified.similarity * 100).toFixed(2)} %
    </div>
  </div>
{/snippet}
