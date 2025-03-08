import { zip } from "$lib";
import { writable } from "svelte/store";

export class Detection {
  constructor(
    readonly topx: number,
    readonly topy: number,
    readonly botx: number,
    readonly boty: number,
    readonly score: number,
    readonly id?: number,
  ) { }

  static fromArray(array: number[]) {
    return new Detection(
      array[0],
      array[1],
      array[2],
      array[3],
      array[5],
      array[4],
    );
  }
}

const textDecoder = new TextDecoder("utf-8");

/**
  * @yields topx, topy, botx, boty, id
  */
type Boxes = number[]

type JsonData = {
  boxes: Boxes[],
  scores: number[]
}

export default function createDetectionsFeed() {
  const { subscribe, set } = writable<Detection[]>([])

  function feed(ev: MessageEvent) {
    const data = ev.data instanceof ArrayBuffer ? textDecoder.decode(ev.data) : ev.data as string
    const json: JsonData = JSON.parse(data)
    const boxes = json.boxes
    const scores = json.scores
    set(zip(boxes, scores).map(([bbox, score]) => {
      const [topx, topy, botx, boty, id] = bbox;
      return new Detection(topx, topy, botx, boty, score, id);
    }))
  }

  return {
    subscribe,
    feed
  }
}
