import * as Tone from "tone";
import { WrapperNode } from "./WrapperNode";
import { writable, type Writable } from "svelte/store";

export class WrapperPhaser extends WrapperNode {
  frequency: Writable<number>;
  octaves: Writable<number>;
  baseFrequency: Writable<number>;
  private phaserObject: Tone.Phaser;
  type: string = "phaser";

  constructor(
    id: string,
    initFrequency: number,
    initOctaves: number,
    initBaseFrequency: number,
  ) {
    super(id);

    this.frequency = writable(initFrequency);
    this.octaves = writable(initOctaves);
    this.baseFrequency = writable(initBaseFrequency);
    this.phaserObject = new Tone.Phaser({
      frequency: 15,
      octaves: 5,
      baseFrequency: 1000,
    });

    this.frequency.subscribe((val) => {
      this.change_frequency(val);
    });

    this.octaves.subscribe((val) => {
      this.change_octaves(val);
    });

    this.baseFrequency.subscribe((val) => {
      this.change_base_frequency(val);
    });
  }

  getNode(): Tone.Phaser {
    return this.phaserObject;
  }

  change_frequency(val: number): void {
    this.phaserObject.set({ frequency: val });
  }

  change_octaves(val: number): void {
    this.phaserObject.set({ octaves: val });
  }
  change_base_frequency(val: number): void {
    this.phaserObject.set({ baseFrequency: val });
  }
}
