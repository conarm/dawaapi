import { writable, type Writable } from "svelte/store";
import * as Tone from "tone";
import { GenericWrapper } from "./GenericWrapper";

export class WrapperDelay extends GenericWrapper {
  delayTime: Writable<number>;
  feedback: Writable<number>;
  private delayObject: Tone.FeedbackDelay;
  type: string = "delay";

  constructor(id: string, initDelayTime: number, initFeedback: number) {
    super(id);

    // Set up Tone params
    this.delayTime = writable(initDelayTime);
    this.feedback = writable(initFeedback);

    // Initialise custom Tone object
    this.delayObject = new Tone.FeedbackDelay(0.5);
    this.delayObject.set({ wet: 0.8 });

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
