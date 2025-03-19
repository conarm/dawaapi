import { writable, type Writable } from 'svelte/store';
import * as Tone from 'tone';
import { MegaNode } from './MegaNode';

export class MegaReverb extends MegaNode {
    // TODO: Rename these to actual slider types
    slider1: Writable<number>;
    slider2: Writable<number>;
    reverb: Tone.JCReverb;
    id: string;

    constructor(initParam1: number, initParam2: number, initParam3: number, id: string) {
      super(id);

      this.slider1 = writable(initParam1);
      this.slider2 = writable(initParam2);
      this.reverb = new Tone.JCReverb(0.5);

      this.slider1.subscribe((val) => {
        this.change_reverb_param_1(val);
      })

      this.slider2.subscribe((val) => {
        this.change_reverb_param_2(val);
      })

      this.id = id;
    }

    getNode(): Tone.JCReverb {
        return this.reverb;
    }

    change_reverb_param_1(val: number) {
      console.log("Param 1 changed");
      this.reverb.set({roomSize: val});
    }
    
    change_reverb_param_2(val: number) {
      this.reverb.set({wet: val});
    }
  }