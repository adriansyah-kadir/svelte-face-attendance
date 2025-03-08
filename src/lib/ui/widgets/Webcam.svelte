<script lang="ts">
  import { dev } from "$app/environment";
  import { onDestroy, onMount, untrack } from "svelte";
  import type { HTMLVideoAttributes } from "svelte/elements";

  let {
    deviceId,
    video = $bindable(),
    videoWidth = $bindable(),
    videoHeight = $bindable(),
    stream = $bindable(),
    loaded = $bindable(false),
    ...videoProps
  }: {
    stream?: MediaStream;
    deviceId?: string;
    video?: HTMLVideoElement;
    videoWidth?: number;
    videoHeight?: number;
    loaded?: boolean;
  } & HTMLVideoAttributes = $props();

  function clean() {
    if (video?.srcObject) video.srcObject = null;
    if (stream) stream.getTracks().forEach((e) => e.stop());
  }

  async function setStreamDevice(deviceId: string) {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
    });
  }

  $effect(() => {
    if (video && deviceId && stream) video.srcObject = stream;
    else if (
      video &&
      videoProps.src &&
      loaded &&
      "captureStream" in video &&
      typeof video.captureStream === "function"
    ) {
      stream = video.captureStream();
    }
  });

  onMount(() => {
    clean();
    if (deviceId) setStreamDevice(deviceId);
    return clean;
  });
</script>

<video
  {...videoProps}
  bind:this={video}
  bind:videoWidth
  bind:videoHeight
  autoplay
  onloadeddata={function (ev) {
    loaded = true;
    videoProps.onloadeddata?.call(this, ev);
  }}
>
  {#if videoProps.src}
    <source src={videoProps.src} type="video/mp4" />
  {/if}
</video>
