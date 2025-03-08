import { writable } from "svelte/store";

export type Verification = {
  similarity: number;
  label: string;
  extra: Record<string, any>;
};

export type Verifications = Record<number, Verification | undefined>;

const textDecoder = new TextDecoder("utf-8");

export default function createVerificationsFeed() {
  const { subscribe, set } = writable<Verifications>([]);

  function feed(ev: MessageEvent) {
    const data =
      ev.data instanceof ArrayBuffer
        ? textDecoder.decode(ev.data)
        : (ev.data as string);
    const json: Verifications = JSON.parse(data);
    set(json);
  }

  return {
    subscribe,
    feed,
  };
}
