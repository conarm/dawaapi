import * as Tone from 'tone';
import { MegaNode } from './MegaNode';
import { writable, type Writable } from 'svelte/store';

export class MegaPhaser extends MegaNode {
    sliderFrequency: Writable<number>;
    sliderOctaves: Writable<number>;
    sliderBaseFrequency: Writable<number>;
    phaser: Tone.Phaser;
    id: string;

    constructor(initParam1: number, initParam2: number, initParam3: number, id: string) {
      super(id);

      this.sliderFrequency = writable(initParam1);
      this.sliderOctaves = writable(initParam2);
      this.sliderBaseFrequency = writable(initParam3);
      this.phaser = new Tone.Phaser({
        frequency: 15,
        octaves: 5,
        baseFrequency: 1000
    });

      this.sliderFrequency.subscribe((val) => {
        this.change_frequency(val);
      })

      this.sliderOctaves.subscribe((val) => {
        this.change_octaves(val);
      })
      
      this.sliderBaseFrequency.subscribe((val) => {
        this.change_base_frequency(val);
      })

      this.id = id;
    }

    getNode(): Tone.Phaser {
        return this.phaser;
    }

    change_frequency(val: number) {
      this.phaser.set({frequency: val});
    }
    
    change_octaves(val: number) {
      this.phaser.set({octaves: val});
    }
    change_base_frequency(val: number) {
        this.phaser.set({baseFrequency: val});
      }
  }