import TestColourNode from './components/TestColourNode.svelte';
import SynthesizerNode from './components/SynthesizerNode.svelte';
import AudioOutNode from './components/AudioOutNode.svelte';
import PatternNode from './components/PatternNode.svelte';
import DelayNode from './components/DelayNode.svelte';
import ReverbNode from './components/ReverbNode.svelte';
import {
    Position,
  } from '@xyflow/svelte';

export const defaultBPM = 150;
import type { OmniOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';

// Set node types
// The 'type' property on Nodes in the node array should match any of these typenames (or just not specify 'type')
// TODO: Move these into a special const for access anywhere
export const nodeTypes = {
  'colour': TestColourNode,
  'synth': SynthesizerNode,
  'audio-out': AudioOutNode,
  'pattern': PatternNode,
  'delay': DelayNode,
  'reverb': ReverbNode,
};

export const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left
};

// TODO: Use the Tone.JS Note type for this or something? How to get an array of all notes...
export const pitches = [
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
];

export const shapes: OmniOscillatorType[] = [
  "sine",
  "square",
  "triangle",
  "sawtooth",
];