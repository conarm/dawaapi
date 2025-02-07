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
  import { onMount } from 'svelte';
  import * as Tone from 'tone';

  import '@xyflow/svelte/dist/style.css';
    import type { OmniOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';

  // Set node types
  // The 'type' property on Nodes in the node array should match any of these typenames (or just not specify 'type')
  const nodeTypes = {
    'colour': TestColourNode,
    'synth': SynthesizerNode,
    'audio-out': AudioOutNode,
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
  ]

  const shapes: OmniOscillatorType[] = [
    "sine",
    "square",
    "triangle",
    "sawtooth",
  ]

  class MegaSynth {
    // TODO: Rename these to actual slider types
    slider1: Writable<number>;
    slider2: Writable<number>;
    slider3: Writable<number>;
    pitch: number;
    synth: Tone.Synth;
    isConnected: boolean;
    id: string;

    constructor(initVol: number, initPitch: number, initX: number, id: string) {
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

      this.synth.toDestination();
    }

    enable() {
      console.log("Synth enabled - triggering attack");
      this.isConnected = true;
      this.synth.triggerAttack(pitches[this.pitch]); // Start a constant note
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
    new MegaSynth(0, 0, 0, "2"),
    new MegaSynth(0, 0, 0, "3"),
    new MegaSynth(0, 0, 0, "4")
  ];

  // Set default nodes
  const nodes = writable<Node[]>([
    {
      id: '1',
      data: { color: writable('#ff4000') }, 
      position: { x: 200, y: 0 },
      type: 'colour',
    },
    {
      id: megaSynths[0].id,
      data: { slider1: megaSynths[0].slider1, slider2: megaSynths[0].slider2, slider3: megaSynths[0].slider3 },
      position: { x: -50, y: 0 },
      type: 'synth',
    },
    {
      id: megaSynths[1].id,
      data: { slider1: megaSynths[1].slider1, slider2: megaSynths[1].slider2, slider3: megaSynths[1].slider3 },
      position: { x: -150, y: 0 },
      type: 'synth',
    },
    {
      id: megaSynths[2].id,
      data: { slider1: megaSynths[2].slider1, slider2: megaSynths[2].slider2, slider3: megaSynths[2].slider3 },
      position: { x: -150, y: 0 },
      type: 'synth',
    },
    {
      id: '5',
      data: {  },
      position: { x: 200, y: 200 },
      type: 'audio-out',
    },
  ]);

  // Set default edges
  const edges = writable<Edge[]>([
  ]);

  onMount(async () => {
    await Tone.start(); // Start the audio context
  });

  // Watch for changes in edges to determine connections
  edges.subscribe((currentEdges) => {
      // For each edge, check if it goes from a synth to an output
      // If it does (i.e. source is a synth, output is an audio-out) then enable the synth if it isn't already
      // We want to disable a synth if a synth is 'connected' but no edge goes from it to audio-out
      // How the fuck . . .
      currentEdges.forEach(edge => {
        const nodesList = get(nodes);
        const sourceNode = nodesList.find(n => n.id === edge.source && n.type === 'synth');
        const targetNode = nodesList.find(n => n.id === edge.target && n.type === 'audio-out');

        if (sourceNode && targetNode) {
          // Perform your action here
          console.log(`Synth node (${sourceNode.id}) is connected to Audio-Out node (${targetNode.id})`);
          megaSynths.forEach(megaSynth => {
            if (sourceNode.id == megaSynth.id && !megaSynth.isConnected) {
              console.log(`Enabling megasynth ${megaSynth.id}`)
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
