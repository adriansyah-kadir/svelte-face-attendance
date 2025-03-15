import { writable } from "svelte/store";

type Config = {
  webrtcConfig?: RTCConfiguration;
  onIceGatheringStateChange?: (this: RTCPeerConnection) => void;
  onIceConnectionStateChange?: (this: RTCPeerConnection) => void;
  onIceCandidate?: (this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) => void;
  onIceCandidateError?: (ev: RTCPeerConnectionIceErrorEvent) => void;
  onTrack?: (ev: RTCTrackEvent) => void;
  onDataChannel?: (ev: RTCDataChannelEvent) => void;
  onNegotationNeeded?: (this: RTCPeerConnection) => void;
  onSignalingStateChange?: (this: RTCPeerConnection) => void;
  onConnectionStateChange?: (this: RTCPeerConnection) => void;
  pc?: RTCPeerConnection;
};
export default function WebRTC(config: Config) {
  const pc = config.pc ?? new RTCPeerConnection(config.webrtcConfig);

  if (config.onIceGatheringStateChange)
    pc.addEventListener(
      "icegatheringstatechange",
      config.onIceGatheringStateChange
    );
  if (config.onIceConnectionStateChange)
    pc.addEventListener(
      "iceconnectionstatechange",
      config.onIceConnectionStateChange
    );
  // if (config.onIceCandidate)
  //   pc.addEventListener("icecandidate", config.onIceCandidate);
  if (config.onIceCandidate)
    pc.onicecandidate = config.onIceCandidate;
  if (config.onIceCandidateError)
    pc.addEventListener("icecandidateerror", config.onIceCandidateError);
  if (config.onTrack) pc.addEventListener("track", config.onTrack);
  if (config.onDataChannel)
    pc.addEventListener("datachannel", config.onDataChannel);
  if (config.onNegotationNeeded)
    pc.addEventListener("negotiationneeded", config.onNegotationNeeded);
  if (config.onSignalingStateChange)
    pc.addEventListener("signalingstatechange", config.onSignalingStateChange);
  if (config.onConnectionStateChange)
    pc.addEventListener(
      "connectionstatechange",
      config.onConnectionStateChange
    );

  return pc;
}

export function WebRTCInfo(pc?: RTCPeerConnection, m?: MediaStreamTrack) {
  const info = writable<{
    "outbound-rtp"?: RTCOutboundRtpStreamStats;
  }>({ "outbound-rtp": undefined });

  async function update() {
    for (const [k, v] of (await pc?.getStats(m)) ?? []) {
      if (v.type === "outbound-rtp") {
        info.update((p) => ({ ...p, "outbound-rtp": v }));
      }
    }
  }

  update();

  return {
    subscribe: info.subscribe,
    update,
  };
}
