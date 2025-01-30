<script lang="ts">
  import { writable } from 'svelte/store';
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
  import { onMount } from 'svelte';
  import * as Tone from 'tone';

  import '@xyflow/svelte/dist/style.css';

  // Set node types
  // Set the 'type' property on Nodes in the node array to match any of these typenames
  const nodeTypes = {
    'colour': TestColourNode,
    'synth': SynthesizerNode,
  };

  const nodeDefaults = {
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  };

  // Set default nodes
  // If no type is selected the default node is used
  // Select a type with the type parameter - match the name to one of the names in the nodeTypes list
  // Match up the data parameter to the data parameter of the type used - default nodes have a label parameter
  const nodes = writable<Node[]>([
    {
      id: '1',
      data: { label: 'Synth' },
      position: { x: 0, y: 0 },
    },
    {
      id: '2',
      data: { label: 'Output' },
      position: { x: 200, y: 200 },
      ...nodeDefaults
    },
    {
      id: '3',
      data: { color: writable('#ff4000') }, 
      position: { x: 200, y: 0 },
      type: 'colour',
    },
    {
      id: '4',
      data: { slider1: writable(50) },
      position: { x: 150, y: 100 },
      type: 'synth',
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
    synth.volume.value = -12; // Adjust volume if needed
    await Tone.start(); // Start the audio context
  });

  // Watch for changes in edges to determine connections
  edges.subscribe((currentEdges) => {
    // Hardcoded synth
      const synthToOutput = currentEdges.some(
        (edge) => edge.source === '1' && edge.target === '2'
      );

      // If synth is connected to output
      if (synthToOutput && !isSynthConnected) {
        isSynthConnected = true;
        synth.triggerAttack("C4"); // Start a constant note
      } else if (!synthToOutput && isSynthConnected) {
        isSynthConnected = false;
        synth.triggerRelease(); // Stop the note
      }
    });
</script>

<div style:height="100vh">
  <SvelteFlow {nodes} {edges} {nodeTypes} fitView>
    <Controls />
    <Background />
    <MiniMap />
  </SvelteFlow>
</div>
