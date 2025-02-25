<script lang="ts">
  import { writable, get, type Writable } from 'svelte/store';
  import {
    SvelteFlow,
    Controls,
    Background,
    MiniMap,
    Position,
    type Node,
    type Edge,
  } from '@xyflow/svelte';
  import TestColourNode from './components/TestColourNode.svelte';
  import SynthesizerNode from './components/SynthesizerNode.svelte';
  import AudioOutNode from './components/AudioOutNode.svelte';
  import PatternNode from './components/PatternNode.svelte';
  import { onMount } from 'svelte';
  import * as Tone from 'tone';

  import '@xyflow/svelte/dist/style.css';
    import type { OmniOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';

  const defaultBPM = 150;

  // Set node types
  // The 'type' property on Nodes in the node array should match any of these typenames (or just not specify 'type')
  // TODO: Move these into another const
  const nodeTypes = {
    'colour': TestColourNode,
    'synth': SynthesizerNode,
    'audio-out': AudioOutNode,
    'pattern': PatternNode,
  };

  const nodeDefaults = {
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  };

  const pitches = [
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

  const shapes: OmniOscillatorType[] = [
    "sine",
    "square",
    "triangle",
    "sawtooth",
  ];

  class MegaSynth {
    // TODO: Rename these to actual slider types
    slider1: Writable<number>;
    slider2: Writable<number>;
    slider3: Writable<number>;
    pitch: number;
    synth: Tone.Synth;
    isConnected: boolean;
    id: string;
    pattern: string;
    part: Tone.Part;

    constructor(initVol: number, initPitch: number, initX: number, id: string, pattern: string) {
      this.isConnected = false;
      this.slider1 = writable(initVol);
      this.slider2 = writable(initPitch);
      // TODO: surely we don't need to track pitch, that's a bit overkill right? why does enable_synth run twice when you first connect the synth
      this.pitch = initPitch;
      this.slider3 = writable(initX);
      this.synth = new Tone.Synth();

      this.slider1.subscribe((val) => {
        this.change_synth_volume(val);
      })

      this.slider2.subscribe((val) => {
        this.change_synth_pitch(val);
      })

      this.slider3.subscribe((val) => {
        this.change_synth_shape(val);
      })

      this.id = id;

      // TODO: don't hardcode pattern through constructor - allow for pattern to be set by a dropdown or an input node
      this.pattern = pattern;

      this.synth.toDestination();

      // set melody
      this.part = new Tone.Part((time, event) => 
        { this.synth.triggerAttackRelease(event.note, event.dur, time)},
        [{ time : 0, note : "C4", dur : "4n"}, { time : "4n + 8n", note : "E4", dur : "8n"}, { time : "2n", note : "G4", dur : "16n"}, { time : "2n + 8t", note : "B4", dur : "4n"}])    
    }

    enable() {
      console.log("Synth enabled - triggering attack");
      this.isConnected = true;
      if (this.pattern == 'pattern1') {
        this.part.loop = true;
        this.part.start();
      } else {
        this.synth.triggerAttack(pitches[this.pitch]); // Start a constant note
      }
      Tone.getTransport().start();
    }

    disable() {
      console.log("Synth disabled - triggering release");
      this.isConnected = false;
      this.synth.triggerRelease(); // Stop the note
    }

    change_synth_volume(val: number) {
      console.log("Volume changed");
      this.synth.set({
        volume: val
      })
      }
    
    change_synth_pitch(val: number) {
      console.log("Pitch changed");
      this.synth.setNote(pitches[val]);
      this.pitch = val;
    }
    
    change_synth_shape(val: number) {
      console.log("Pitch changed");
      this.synth.oscillator.type = shapes[val];
    }
  }

  let megaSynths: MegaSynth[] = [
    new MegaSynth(0, 0, 0, "2", 'none'),
    new MegaSynth(0, 0, 0, "3", 'none'),
    new MegaSynth(0, 0, 0, "4", 'none')
  ];

  // Set default nodes
  const nodes = writable<Node[]>([
    {
      id: '1',
      data: { color: writable('#ff4000') }, 
      position: { x: 200, y: 300 },
      type: 'colour',
    },
    {
      id: megaSynths[0].id,
      data: { slider1: megaSynths[0].slider1, slider2: megaSynths[0].slider2, slider3: megaSynths[0].slider3 },
      position: { x: -400, y: 200 },
      type: 'synth',
    },
    {
      id: megaSynths[1].id,
      data: { slider1: megaSynths[1].slider1, slider2: megaSynths[1].slider2, slider3: megaSynths[1].slider3 },
      position: { x: -180, y: 0 },
      type: 'synth',
    },
    {
      id: megaSynths[2].id,
      data: { slider1: megaSynths[2].slider1, slider2: megaSynths[2].slider2, slider3: megaSynths[2].slider3 },
      position: { x: 40, y: -200 },
      type: 'synth',
    },
    {
      id: '5',
      data: {  },
      position: { x: 350, y: 230 },
      type: 'audio-out',
    },
    {
      id: '6',
      data: { currentPattern: writable('pattern1') },
      position: { x: -450, y: -130 },
      type: 'pattern',
    },
  ]);

  // Set default edges
  const edges = writable<Edge[]>([
  ]);

  onMount(async () => {
    Tone.getTransport().bpm.value = defaultBPM;
    Tone.getTransport().start(); // Start the audio context
  });

  // Watch for changes in edges to determine connections
  edges.subscribe((currentEdges) => {
      // For each edge, check if it goes from a synth to an output
      // If it does (i.e. source is a synth, output is an audio-out) then enable the synth if it isn't already
      // We want to disable a synth if a synth is 'connected' but no edge goes from it to audio-out
      // TODO: How . . .
      currentEdges.forEach(edge => {
        const nodesList = get(nodes);
        const patternNodeOut = nodesList.find(n => n.id === edge.source && n.type === 'pattern');
        const synthNodeIn = nodesList.find(n => n.id === edge.target && n.type === 'synth');
        const synthNodeOut = nodesList.find(n => n.id === edge.source && n.type === 'synth');
        const outNodeIn = nodesList.find(n => n.id === edge.target && n.type === 'audio-out');

        if (synthNodeOut && outNodeIn) {
          // A synth is connected to a target
          console.log(`Synth node (${synthNodeOut.id}) is connected to Audio-Out node (${outNodeIn.id})`);
          megaSynths.forEach(megaSynth => {
            if (synthNodeOut.id == megaSynth.id && !megaSynth.isConnected) {
              console.log(`Enabling megasynth ${megaSynth.id}`)
              megaSynth.enable();
            }
          });
        }
        if (patternNodeOut && synthNodeIn) {
          // A pattern is connected to a synth
          console.log(`Synth node (${patternNodeOut.id}) is connected to Audio-Out node (${synthNodeIn.id})`);
          megaSynths.forEach(megaSynth => {
            if (synthNodeIn.id == megaSynth.id) {
              console.log(`Enabling pattern ${megaSynth.id}`)
              megaSynth.pattern = 'pattern1';
              megaSynth.disable();
              megaSynth.enable();
            }
          });
        }
      });
    });
</script>

<div style:height="100vh">
  <SvelteFlow {nodes} {edges} {nodeTypes} fitView>
    <Controls />
    <Background />
    <MiniMap />
  </SvelteFlow>
</div>