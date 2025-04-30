import type { Node } from "@xyflow/svelte";
import { wrapperMap } from "./consts";
import { WrapperSynth } from "./wrappers/SynthWrapper";
import { WrapperDelay } from "./wrappers/DelayWrapper";
import { WrapperReverb } from "./wrappers/ReverbWrapper";
import { WrapperPhaser } from "./wrappers/PhaserWrapper";
import { WrapperPattern } from "./wrappers/PatternWrapper";

type NodeCreator = (id: string) => Node;

const nodeCreators: Record<string, NodeCreator> = {
  synth: (id) => {
    const inst = new WrapperSynth(id, 0, 10, 0, "", false);
    wrapperMap.set(id, inst);
    return {
      id,
      type: "synth",
      position: { x: 100, y: 100 },
      data: {
        slider1: inst.volume,
        slider2: inst.pitch,
        slider3: inst.shape,
      },
    };
  },

  delay: (id) => {
    const inst = new WrapperDelay(id, 0, 0);
    wrapperMap.set(id, inst);
    return {
      id,
      type: "delay",
      position: { x: 100, y: 100 },
      data: {
        slider1: inst.delayTime,
        slider2: inst.feedback,
      },
    };
  },

  reverb: (id) => {
    const inst = new WrapperReverb(id, 0, 0);
    wrapperMap.set(id, inst);
    return {
      id,
      type: "reverb",
      position: { x: 100, y: 100 },
      data: {
        slider1: inst.roomSize,
        slider2: inst.wet,
      },
    };
  },

  phaser: (id) => {
    const inst = new WrapperPhaser(id, 15, 5, 1000);
    wrapperMap.set(id, inst);
    return {
      id,
      type: "phaser",
      position: { x: 100, y: 100 },
      data: {
        slider1: inst.frequency,
        slider2: inst.octaves,
        slider3: inst.baseFrequency,
      },
    };
  },

  pattern: (id) => {
    const inst = new WrapperPattern(id, "pattern1");
    wrapperMap.set(id, inst);
    return {
      id,
      type: "pattern",
      position: { x: 100, y: 100 },
      data: {
        currentPattern: inst.pattern,
      },
    };
  },
};

export function createNode(label: string, id: string): Node {
  const creator = nodeCreators[label];
  // Get the appropriate SvelteFlow Node object for the label and id
  return creator ? creator(id) : nodeCreators["synth"](id); // TODO: Defaults to synth - correct behaviour?
}
