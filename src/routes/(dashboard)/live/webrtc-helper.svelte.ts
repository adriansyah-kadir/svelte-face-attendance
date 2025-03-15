import { toast } from "$lib/ui/widgets/Toaster.svelte";
import WebRTC from "$lib/webrtc";
import ky from "ky";

type Config = {
  onDetectionsMessage: RTCDataChannel["onmessage"];
  onVerificationsMessage: RTCDataChannel["onmessage"];
  server: string;
  absen_type: string;
};

async function connect(this: RTCPeerConnection, server: string, absen_type: string) {
  const answer = await ky
    .post(server, {
      json: {
        sdp: this.localDescription?.sdp,
        type: this.localDescription?.type,
        absen_type,
      },
    })
    .json<RTCSessionDescription>();
  this.setRemoteDescription(answer);
}

export function CreateWebRTC(config: Config) {
  const pc = WebRTC({
    async onNegotationNeeded() {
      const detections = this.createDataChannel("detections");
      const verifications = this.createDataChannel("verifications");

      detections.onmessage = config.onDetectionsMessage;
      verifications.onmessage = config.onVerificationsMessage;

      const offer = await this.createOffer();
      await this.setLocalDescription(offer);
    },
    async onIceGatheringStateChange() {
      toast(`initializing`, {
        id: "streaming-status",
        description: "iceGatheringState: " + this.iceGatheringState,
        type: "loading",
      });
      if (this.iceGatheringState === "complete") {
        connect.call(this, config.server, config.absen_type).catch((err) => {
          console.error(err);
          toast(`Error`, {
            id: "streaming-status",
            description: "gagal koneksi: " + config.server,
            type: "error",
          });
        });
      }
    },
    async onConnectionStateChange() {
      switch (this.connectionState) {
        case "connecting":
          toast(`connection`, {
            id: "streaming-status",
            type: "info",
            description: "connecting",
          });
          break;
        case "failed":
          toast(`connection`, {
            id: "streaming-status",
            type: "error",
            description: "failed",
          });
          break;
        case "disconnected":
          toast(`connection`, {
            id: "streaming-status",
            type: "warning",
            description: "disconnected",
          });
          break;
        case "connected":
          toast("connected", {
            description: "connected to: " + config.server,
            id: "streaming-status",
            type: "success",
          });
          break;
        default:
          break;
      }
    },
  });

  return pc;
}
