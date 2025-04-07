import * as Tone from "tone";
import { MegaNode } from "./MegaNode";
import { writable, type Writable } from "svelte/store";

export class MegaPattern extends MegaNode {
    pattern: Writable<string>;
    private patternString: string;
    type: string = "pattern";

  constructor(id: string, initPattern: string) {
    super(id);

    this.pattern = writable(initPattern)
    this.patternString = initPattern;

    this.pattern.subscribe((val) => {
      this.change_pattern(val);
    });
  }

  getNode(): Tone.AMOscillator {
    return new Tone.AMOscillator; // TODO: Get rid, this is a workaround
  }

  getPattern(): string {
    return this.patternString;
  }

  change_pattern(val: string): void {
    this.patternString = val;
  }
}