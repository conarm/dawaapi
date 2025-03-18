import { writable, type Writable } from 'svelte/store';
import * as Tone from 'tone';

export class MegaDelay {
    // TODO: Rename these to actual slider types
    slider1: Writable<number>;
    slider2: Writable<number>;
    delay: Tone.FeedbackDelay;
    id: string;

    constructor(initParam1: number, initParam2: number, initParam3: number, id: string) {
      this.slider1 = writable(initParam1);
      this.slider2 = writable(initParam2);
      this.delay = new Tone.FeedbackDelay(0.5);

      this.slider1.subscribe((val) => {
        this.change_delay_param_1(val);
      })

      this.slider2.subscribe((val) => {
        this.change_delay_param_2(val);
      })

      this.id = id;
    }

    change_delay_param_1(val: number) {
      console.log("Param 1 changed");
      this.delay.set({delayTime: val});
    }
    
    change_delay_param_2(val: number) {
      this.delay.set({feedback: val});
    }
  }