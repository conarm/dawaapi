import * as Tone from 'tone';
import { MegaNode } from './MegaNode';
import { writable, type Writable } from 'svelte/store';

export class MegaPhaser extends MegaNode {
    // TODO: Rename these to actual slider types
    slider1: Writable<number>;
    slider2: Writable<number>;
    slider3: Writable<number>;
    phaser: Tone.Phaser;
    id: string;

    constructor(initParam1: number, initParam2: number, initParam3: number, id: string) {
      super(id);

      this.slider1 = writable(initParam1);
      this.slider2 = writable(initParam2);
      this.slider3 = writable(initParam3);
      this.phaser = new Tone.Phaser({
        frequency: 15,
        octaves: 5,
        baseFrequency: 1000
    });

      this.slider1.subscribe((val) => {
        this.change_param_1(val);
      })

      this.slider2.subscribe((val) => {
        this.change_param_2(val);
      })
      
      this.slider3.subscribe((val) => {
        this.change_param_3(val);
      })

      this.id = id;
    }

    getNode(): Tone.Phaser {
        return this.phaser;
    }

    change_param_1(val: number) {
      this.phaser.set({frequency: val});
    }
    
    change_param_2(val: number) {
      this.phaser.set({octaves: val});
    }
    change_param_3(val: number) {
        this.phaser.set({baseFrequency: val});
      }
  }