import { writable, type Writable } from "svelte/store";
import * as Tone from "tone";
import { MegaNode } from "./MegaNode";

export class MegaDelay extends MegaNode {
  delayTime: Writable<number>;
  feedback: Writable<number>;
  private delayObject: Tone.FeedbackDelay;

  constructor(id: string, initDelayTime: number, initFeedback: number) {
    super(id);

    this.delayTime = writable(initDelayTime);
    this.feedback = writable(initFeedback);
    this.delayObject = new Tone.FeedbackDelay(0.5);

    this.delayTime.subscribe((val) => {
      this.change_delay_time(val);
    });

    this.feedback.subscribe((val) => {
      this.change_feedback(val);
    });
  }

  getNode(): Tone.FeedbackDelay {
    return this.delayObject;
  }

  change_delay_time(val: number): void {
    this.delayObject.set({ delayTime: val });
  }

  change_feedback(val: number): void {
    this.delayObject.set({ feedback: val });
  }
}
