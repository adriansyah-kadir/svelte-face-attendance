import { isIPv4 } from "$lib";
import { toast } from "$lib/ui/widgets/Toaster.svelte";
import WebRTC from "$lib/webrtc";
import ky from "ky";

type Config = {
  onDetectionsMessage: RTCDataChannel["onmessage"];
  onVerificationsMessage: RTCDataChannel["onmessage"];
  server: string;
  attendance_type: string;
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
    webrtcConfig: {
      iceServers: [
        { urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19305"] },
        {
          urls: "turn:relay1.expressturn.com:3478",
          username: "efYDQRDBLZG2XIHJE3",
          credential: "S9G2fDPfhpGh5ZCD"
        }
      ],
      iceTransportPolicy: "all",
    },
    async onNegotationNeeded() {
      const detections = this.createDataChannel("detections");
      const verifications = this.createDataChannel("verifications");

      detections.onmessage = config.onDetectionsMessage;
      verifications.onmessage = config.onVerificationsMessage;

      const offer = await this.createOffer();
      await this.setLocalDescription(offer);
    },
    async onIceCandidate(ev) {
      if (ev.candidate && (ev.candidate?.type === "relay" || ev.candidate?.type === "srflx" || ev.candidate?.type === "prflx") && ev.candidate.relatedAddress && isIPv4(ev.candidate.relatedAddress)) {
        this.onicecandidate = null
        connect.call(this, config.server, config.attendance_type).catch(err => {
          console.error(err);
          toast(`Error`, {
            id: "streaming-status",
            description: "gagal koneksi: " + config.server,
            type: "error",
          });
        })
      }
    },
    async onIceGatheringStateChange() {
      toast(`initializing`, {
        id: "streaming-status",
        description: "iceGatheringState: " + this.iceGatheringState,
        type: "loading",
      });
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
