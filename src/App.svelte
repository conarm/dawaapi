<script lang="ts">
  import { writable } from 'svelte/store';
  import {
    SvelteFlow,
    Controls,
    Background,
    MiniMap,
    type Node,
    type Edge,
  } from '@xyflow/svelte';

  import '@xyflow/svelte/dist/style.css';
  import { onMount } from 'svelte';
  import * as Tone from 'tone';

  // Set default nodes
  const nodes = writable<Node[]>([
    {
      id: '1',
      data: { label: 'Synthesizer' },
      position: { x: 0, y: 0 },
    },
    {
      id: '2',
      data: { label: 'Output' },
      position: { x: 200, y: 200 },
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
  <SvelteFlow {nodes} {edges} fitView>
    <Controls />
    <Background />
    <MiniMap />
  </SvelteFlow>
</div>
