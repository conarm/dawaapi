<script lang="ts">
  import { writable, get } from 'svelte/store';
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

  const slider_1_store = writable(-30);
  const slider_2_store = writable(4);
  const slider_3_store = writable(69);

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
      data: { slider1: slider_1_store, slider2: slider_2_store, slider3: slider_3_store },
      position: { x: -50, y: 0 },
      type: 'synth',
    },
    {
      id: '3',
      data: {  },
      position: { x: 200, y: 200 },
      type: 'audio-out',
    },
  ]);

  // Set default edges
  const edges = writable<Edge[]>([
    // {
    //   id: '1-2',
    //   source: '1',
    //   target: '2',
    // },
  ]);


  let synth: Tone.Synth;
  let isSynthConnected = false;
  onMount(async () => {
    synth = new Tone.Synth().toDestination();
    synth.volume.value = -30; // Adjust volume if needed
    await Tone.start(); // Start the audio context
  });

  slider_1_store.subscribe((val) => {
    change_synth_volume(val);
  })

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
      const synthToOutput = currentEdges.some(
        (edge) => get(nodes).find(n => (n.id === edge.source && n.type === 'synth')) && get(nodes).find(n => n.id === edge.target && n.type === 'audio-out')
      );

      // If synth is connected to output
      if (synthToOutput && !isSynthConnected) {
        enable_synth();
      } else if (!synthToOutput && isSynthConnected) {
        disable_synth();
      }
    });

  function enable_synth() {
    isSynthConnected = true;
    synth.triggerAttack("C4"); // Start a constant note
  }

  function disable_synth() {
    isSynthConnected = false;
    synth.triggerRelease(); // Stop the note
  }

  function change_synth_volume(val: number) {
    if (isSynthConnected)
      synth.set({
        volume: val
      })
    }
</script>

<div style:height="100vh">
  <SvelteFlow {nodes} {edges} {nodeTypes} fitView>
    <Controls />
    <Background />
    <MiniMap />
  </SvelteFlow>
</div>
