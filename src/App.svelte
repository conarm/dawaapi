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

  // Set node types
  // Set the 'type' property on Nodes in the node array to match any of these typenames
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
  ]

  class MegaSynth {
    // TODO: Rename these to actual slider types
    slider1: Writable<number>;
    slider2: Writable<number>;
    slider3: Writable<number>;
    myPitch: number;
    synth: Tone.Synth;
    isConnected: boolean;

    constructor(initVol: number, initPitch: number, initX: number) {
      this.isConnected = false;
      this.slider1 = writable(initVol);
      this.slider2 = writable(initPitch);
      // TODO: surely we don't need to track pitch, that's a bit overkill right? why does enable_synth run twice when you first connect the synth
      // TODO: also why the fuck does the synth not stop when deleted
      this.myPitch = initPitch;
      this.slider3 = writable(initX);
      this.synth = new Tone.Synth();
      this.synth.setNote(pitches[initPitch]);

      this.slider1.subscribe((val) => {
        this.change_synth_volume(val);
      })

      this.slider2.subscribe((val) => {
        this.change_synth_pitch(val);
      })
    }

    to_dest() {
      this.synth.toDestination();
    }

    enable_synth() {
      console.log("Synth enabled - triggering attack");
      this.isConnected = true;
      this.synth.triggerAttack(pitches[this.myPitch]); // Start a constant note
    }

    disable_synth() {
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
      this.myPitch = val;
    }
  }

  // TODO: implement the below maybe (or do an array of MSs to stop hardcoding)
  // let synths: Tone.Synth[] = [];

  // const slider_1_store = writable(-30);
  // const slider_2_store = writable(0);
  // const slider_2_store2 = writable(0);
  // const slider_3_store = writable(69);

  const megaSynth1 = new MegaSynth(0, 0, 0);
  const megaSynth2 = new MegaSynth(0, 0, 0);
  const megaSynth3 = new MegaSynth(0, 0, 0);

  // Set default nodes
  // If no type is selected the default node is used
  // Select a type with the type parameter - match the name to one of the names in the nodeTypes list
  // Match up the data parameter to the data parameter of the type used - default nodes have a label parameter
  const nodes = writable<Node[]>([
    {
      id: '1',
      data: { color: writable('#ff4000') }, 
      position: { x: 200, y: 0 },
      type: 'colour',
    },
    {
      id: '2',
      data: { slider1: megaSynth1.slider1, slider2: megaSynth1.slider2, slider3: megaSynth1.slider3 },
      position: { x: -50, y: 0 },
      type: 'synth',
    },
    {
      id: '3',
      data: { slider1: megaSynth2.slider1, slider2: megaSynth2.slider2, slider3: megaSynth2.slider3 },
      position: { x: -150, y: 0 },
      type: 'synth',
    },
    {
      id: '4',
      data: { slider1: megaSynth3.slider1, slider2: megaSynth3.slider2, slider3: megaSynth3.slider3 },
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


  // let synth1: Tone.Synth;
  // let synth2: Tone.Synth;
  // let isSynthConnected = false;
  onMount(async () => {
    // synth1 = new Tone.Synth().toDestination();
    // TODO: hardcoding is bad - don't do that
    megaSynth1.to_dest();
    megaSynth2.to_dest();
    megaSynth3.to_dest();
    // synth1.volume.value = -30; // Adjust volume if needed
    // synth2 = new Tone.Synth().toDestination();
    // synth2.volume.value = -30; // Adjust volume if needed
    await Tone.start(); // Start the audio context
  });

  // slider_1_store.subscribe((val) => {
  //   change_synth_volume(synth1, val);
  // })
  // slider_2_store.subscribe((val) => {
  //   change_synth_pitch(synth1, val);
  // })
  // slider_2_store2.subscribe((val) => {
  //   change_synth_pitch(synth2, val);
  // })

  // Watch for changes in edges to determine connections
  edges.subscribe((currentEdges) => {
    // Hardcoded synth

    // const synthToOutput = currentEdges.some(
    //     (edge) => edge.source === '2' && edge.target === '3'
    //   );

    // we want to see if there is some edge in the current edges where...
    // the source node is a synth and the target node is an audio-out
    // so... we can do get(nodes) to grab all the nodes as an array
    // then do .find on the result to return TRUE if one of the nodes matches the edge's source ID and the type is a 'synth'
    // AND one of the nodes matches the edge's target ID and the type is a 'audio-out'
    // TODO: can we make this more efficient?
      // const synthToOutput = currentEdges.some(
      //   (edge) => get(nodes).find(n => (n.id === edge.source && n.type === 'synth')) && get(nodes).find(n => n.id === edge.target && n.type === 'audio-out')
      // );

      // // If synth is connected to output
      // if (synthToOutput && !isSynthConnected) {
      //   enable_synth();
      // } else if (!synthToOutput && isSynthConnected) {
      //   disable_synth();
      // }

      // take 3(?) (generic)
      currentEdges.forEach(edge => {
        const nodesList = get(nodes);
        const sourceNode = nodesList.find(n => n.id === edge.source && n.type === 'synth');
        const targetNode = nodesList.find(n => n.id === edge.target && n.type === 'audio-out');

        if (sourceNode && targetNode) {
          // Perform your action here
          console.log(`Synth node (${sourceNode.id}) is connected to Audio-Out node (${targetNode.id})`);
          
          // TODO: hardcoding these is bad so don't do that
          if (sourceNode.id == '2' && !megaSynth1.isConnected) {
            console.log("Enabling synth 1");
            megaSynth1.enable_synth();
          }
          if (sourceNode.id == '3') {
            console.log("Enabling synth 2");
            megaSynth2.enable_synth();
          }
          if (sourceNode.id == '4') {
            console.log("Enabling synth 2");
            megaSynth3.enable_synth();
          }
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
