import TestColourNode from "./components/TestColourNode.svelte";
import SynthesizerNode from "./components/SynthesizerNode.svelte";
import AudioOutNode from "./components/AudioOutNode.svelte";
import PatternNode from "./components/PatternNode.svelte";
import DelayNode from "./components/DelayNode.svelte";
import ReverbNode from "./components/ReverbNode.svelte";
import { Position, type Edge } from "@xyflow/svelte";
import type { OmniOscillatorType } from "tone/build/esm/source/oscillator/OscillatorInterface";
import { writable } from "svelte/store";
import PhaserNode from "./components/PhaserNode.svelte";

export const defaultBPM = 150;
export const defaultEdges = writable<Edge[]>([]);

// Set node types
// The 'type' property on Nodes in the node array should match any of these typenames (or just not specify 'type')
export const nodeTypes = {
  cookie: TestColourNode,
  synth: SynthesizerNode,
  "audio-out": AudioOutNode,
  pattern: PatternNode,
  delay: DelayNode,
  reverb: ReverbNode,
  phaser: PhaserNode,
};

export const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

// TODO: Use the Tone.JS Note type for this or something? How to get an array of all notes...
export const pitches = [
  "C0",
  "D0",
  "E0",
  "F0",
  "G0",
  "A0",
  "B0",
  "C1",
  "D1",
  "E1",
  "F1",
  "G1",
  "A1",
  "B1",
  "C2",
  "D2",
  "E2",
  "F2",
  "G2",
  "A2",
  "B2",
  "C3",
  "D3",
  "E3",
  "F3",
  "G3",
  "A3",
  "B3",
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
  "D5",
  "E5",
  "F5",
  "G5",
  "A5",
  "B5",
  "C6",
  "D6",
  "E6",
  "F6",
  "G6",
  "A6",
  "B6",
  "C7",
  "D7",
  "E7",
  "F7",
  "G7",
  "A7",
  "B7",
  "C8",
  "D8",
  "E8",
  "F8",
  "G8",
  "A8",
  "B8",
];

export const shapes: OmniOscillatorType[] = [
  "sine",
  "square",
  "triangle",
  "sawtooth",
];

export const patterns: { [name: string] : any[]; } = {
  "pattern1": [
    { time: 0, note: "C4", dur: "4n" },  // Start of measure
    { time: "4n", note: "D4", dur: "4n" }, // Quarter note later
    { time: "2n", note: "E4", dur: "4n" }, // Halfway through measure
    { time: "2n + 4n", note: "F4", dur: "8n" } // Three-quarters through measure
  ],
  "pattern2": [ 
    { time: 0, note: "C4", dur: "4n" },
    { time: "1n", note: "G4", dur: "4n" },
    { time: "2n", note: "E4", dur: "4n" },
    { time: "3n", note: "G4", dur: "4n" },
  ],
  "pattern3": [
    { time: 0, note: "C4", dur: "4n" },
    { time: "2n", note: "G4", dur: "16n" },
  ],
  "pattern4": [
    { time: 0, note: "C4", dur: "4n" },
    { time: "2n", note: "G4", dur: "16n" },
  ],
  "pattern5": [
    { time: 0, note: "C4", dur: "4n" },
    { time: "2n", note: "G4", dur: "16n" },
  ],
  "pattern6": [
    { time: 0, note: "C4", dur: "4n" },
    { time: "2n", note: "G4", dur: "16n" },
  ],
  "pattern7": [
    { time: 0, note: "C4", dur: "4n" },
    { time: "2n", note: "G4", dur: "16n" },
  ],
  "pattern8": [
    { time: 0, note: "C4", dur: "4n" },
    { time: "2n", note: "G4", dur: "16n" },
  ],
  "pattern9": [
    { time: 0, note: "C4", dur: "4n" },
    { time: "2n", note: "G4", dur: "16n" },
  ],
}
