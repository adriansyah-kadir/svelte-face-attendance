import { onDestroy, onMount } from "svelte";
import { writable } from "svelte/store";

export function extractVideoElementPosInfo(videoEl: HTMLVideoElement | undefined | null) {
  const { subscribe, set } = writable<{
    tx: number, ty: number, w: number, h: number
  }>({ tx: 0, ty: 0, w: 0, h: 0 })

  function calculate() {
    if (!videoEl) return;
    const ratio = videoEl.videoWidth / videoEl.videoHeight
    const r = videoEl.getBoundingClientRect()
    const wr = r.height * ratio
    const hr = r.width / ratio
    const w = wr > r.width ? r.width : wr
    const h = hr > r.height ? r.height : hr
    const wof = r.width - w
    const hof = r.height - h
    const tx = r.x + wof / 2
    const ty = r.y + hof / 2
    set({ tx, ty, w, h })

  }

  onMount(() => {
    calculate()
    window.addEventListener("resize", calculate)
    document.addEventListener("fullscreenchange", calculate)
    videoEl?.addEventListener("loadeddata", calculate)
  })

  onDestroy(() => {
    window.removeEventListener("resize", calculate)
    document.removeEventListener("fullscreenchange", calculate)
    videoEl?.removeEventListener("loadeddata", calculate)
  })

  return { subscribe }
}
