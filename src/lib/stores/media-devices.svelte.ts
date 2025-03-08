import { writable } from "svelte/store";


export function createMediaDevicesStore(constrains: MediaStreamConstraints) {
  const media_devices = writable<MediaDeviceStoreValue>(undefined)

  async function initialize() {
    const media = await navigator.mediaDevices.getUserMedia(constrains);
    media.getTracks()[0].stop()
    const devices = await navigator.mediaDevices.enumerateDevices();
    media_devices.set(devices.filter(e => !!e.label))
  }

  $effect(() => {
    initialize()
  })

  return {
    subscribe: media_devices.subscribe
  };
}

export type MediaDeviceStore = ReturnType<typeof createMediaDevicesStore>
export type MediaDeviceStoreValue = MediaDeviceInfo[] | undefined
