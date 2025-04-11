import type { Node } from '@xyflow/svelte'; // or 'reactflow' if it's the React version
import { megaMap } from './consts';
import { MegaSynth } from './meganodes/MegaSynth';
import { MegaDelay } from './meganodes/MegaDelay';
import { MegaReverb } from './meganodes/MegaReverb';
import { MegaPhaser } from './meganodes/MegaPhaser';
import { MegaPattern } from './meganodes/MegaPattern';

type NodeCreator = (id: string) => Node;

const nodeCreators: Record<string, NodeCreator> = {
  synth: (id) => {
    const inst = new MegaSynth(id, 0, 0, 0, '', false);
    megaMap.set(id, inst);
    return {
      id,
      type: 'synth',
      position: { x: 100, y: 100 },
      data: {
        slider1: inst.volume,
        slider2: inst.pitch,
        slider3: inst.shape,
      }
    };
  },

  delay: (id) => {
    const inst = new MegaDelay(id, 0, 0);
    megaMap.set(id, inst);
    return {
      id,
      type: 'delay',
      position: { x: 100, y: 100 },
      data: {
        slider1: inst.delayTime,
        slider2: inst.feedback,
      }
    };
  },

  reverb: (id) => {
    const inst = new MegaReverb(id, 0, 0);
    megaMap.set(id, inst);
    return {
      id,
      type: 'reverb',
      position: { x: 100, y: 100 },
      data: {
        slider1: inst.roomSize,
        slider2: inst.wet,
      }
    };
  },

  phaser: (id) => {
    const inst = new MegaPhaser(id, 15, 5, 1000);
    megaMap.set(id, inst);
    return {
      id,
      type: 'phaser',
      position: { x: 100, y: 100 },
      data: {
        slider1: inst.frequency,
        slider2: inst.octaves,
        slider3: inst.baseFrequency,
      }
    };
  },

  pattern: (id) => {
    const inst = new MegaPattern(id, 'pattern1');
    megaMap.set(id, inst);
    return {
      id,
      type: 'pattern',
      position: { x: 100, y: 100 },
      data: {
        currentPattern: inst.pattern,
      }
    };
  }
};

export function createNode(label: string, id: string): Node {
  const creator = nodeCreators[label];
  return creator ? creator(id) : nodeCreators['synth'](id); // TODO: Defaults to synth - correct behaviour?
}