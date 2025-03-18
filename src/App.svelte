<script lang="ts">
  import { writable, get, type Writable } from 'svelte/store';
  import {
    SvelteFlow,
    Controls,
    Background,
    MiniMap,
    type Node,
    type Edge,
  } from '@xyflow/svelte';
  import * as Tone from 'tone';
  import { defaultBPM, nodeTypes } from './consts';
  import { onMount } from 'svelte';


  import '@xyflow/svelte/dist/style.css';

  import { MegaSynth } from './meganodes/MegaSynth';
  import { MegaDelay } from './meganodes/MegaDelay';
  import { MegaReverb } from './meganodes/MegaReverb';

  let megaSynthMap = new Map();
  let megaSynth1 = new MegaSynth(0, 0, 0, "2", 'none');
  let megaSynth2 = new MegaSynth(0, 0, 0, "3", 'none');
  let megaSynth3 = new MegaSynth(0, 0, 0, "4", 'none');
  megaSynthMap.set('2', megaSynth1);
  megaSynthMap.set('3', megaSynth2);
  megaSynthMap.set('4', megaSynth3);

  let megaDelayMap = new Map();
  let delay = new MegaDelay(0, 0, 0, "7");
  megaDelayMap.set('7', delay);

  let megaReverbMap = new Map();
  let reverb = new MegaReverb(0, 0, 0, "7");
  megaReverbMap.set('8', reverb);

  // Set default nodes
  const nodes = writable<Node[]>([
    {
      id: '1',
      data: { color: writable('#ff4000') }, 
      position: { x: 200, y: 300 },
      type: 'colour',
    },
    {
      id: '2',
      data: { slider1: megaSynth1.slider1, slider2: megaSynth1.slider2, slider3: megaSynth1.slider3 },
      position: { x: -600, y: 200 },
      type: 'synth',
    },
    {
      id: '3',
      data: { slider1: megaSynth2.slider1, slider2: megaSynth2.slider2, slider3: megaSynth2.slider3 },
      position: { x: -400, y: 0 },
      type: 'synth',
    },
    {
      id: '4',
      data: { slider1: megaSynth3.slider1, slider2: megaSynth3.slider2, slider3: megaSynth3.slider3 },
      position: { x: -200, y: -200 },
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
      position: { x: -600, y: -130 },
      type: 'pattern',
    },
    {
      id: '7',
      data: { slider1: delay.slider1, slider2: delay.slider2 },
      position: { x: -150, y: 30 },
      type: 'delay',
    },
    {
      id: '8',
      data: { slider1: reverb.slider1, slider2: reverb.slider2 },
      position: { x: 100, y: 30 },
      type: 'reverb',
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
      // Notes:
      // If a delay node is connected to a synth then we do synth.connect(delay)
      // Then if our synth is already connected and playing then it will work
      // If we add another delay

      // Update the routing when there is a change
      updateAudioRouting(get(nodes), currentEdges);      
    });

    function updateAudioRouting(nodes: Node[], currentEdges: Edge[]) {
      // TODO: Make sure things aren't happening twice!
      currentEdges.forEach(edge => {
        // Outies
        const patternNodeOut = nodes.find(n => n.id === edge.source && n.type === 'pattern');
        const synthNodeOut = nodes.find(n => n.id === edge.source && n.type === 'synth');
        const delayNodeOut = nodes.find(n => n.id === edge.source && n.type === 'delay');
        const reverbNodeOut = nodes.find(n => n.id === edge.source && n.type === 'reverb');

        // Innies
        const synthNodeIn = nodes.find(n => n.id === edge.target && n.type === 'synth');
        const delayNodeIn = nodes.find(n => n.id === edge.target && n.type === 'delay');
        const reverbNodeIn = nodes.find(n => n.id === edge.target && n.type === 'reverb');
        const outNodeIn = nodes.find(n => n.id === edge.target && n.type === 'audio-out');        

        // TODO: Genericise all of this instead of checking for each possible node/edge combination - some kind of traversal?
        // The section below only works given a pattern, synth, delay and audio-out node
        // ================================= Call toDest() for nodes connected to output =================================
        // Are we connected to the Audio-Out node?
        // If we are, we really want to be calling toDestination on whatever is right before the output
        // This is provided we have logic setup to call connect() on all the prior nodes in the chain
        
        // Synth to Audio-Out
        if (synthNodeOut && outNodeIn) {
          console.log(`Synth node (${synthNodeOut.id}) is connected to Audio-Out node (${outNodeIn.id})`);
          let megaSynth = megaSynthMap.get(synthNodeOut.id)
          if (!megaSynth.isConnected) {
            console.log(`Enabling megasynth ${megaSynth.id}`)
            megaSynth.enable();
            // TODO: put toDest() in a function?
            megaSynth.synth.toDestination();
          }
        }

        // Delay to Audio-Out
        if (delayNodeOut && outNodeIn) {
          let delayNode = megaDelayMap.get(delayNodeOut.id);
          console.log(`Delay node (${delayNodeOut.id}) is connected to Audio-Out node (${outNodeIn.id}) - calling toDest()`);
          // TODO: put toDest() in a function?
          delayNode.delay.toDestination();
        }

        // Reverb to Audio-Out
        if (reverbNodeOut && outNodeIn) {
          let reverbNode = megaReverbMap.get(reverbNodeOut.id);
          console.log(`Reverb node (${reverbNodeOut.id}) is connected to Audio-Out node (${outNodeIn.id}) - calling toDest()`);
          // TODO: put toDest() in a function?
          reverbNode.reverb.toDestination();
        }

        // ===================== Call connect() for nodes not connected to output but connected to other nodes =====================
        // SYNTH IN
        // Pattern to synth
        if (patternNodeOut && synthNodeIn) {
          // A pattern is connected to a synth
          console.log(`Audio-out node (${patternNodeOut.id}) is connected to Synth node (${synthNodeIn.id})`);
          let megaSynth = megaSynthMap.get(synthNodeIn.id)
          console.log(megaSynth)
          console.log(megaSynthMap);
          if (synthNodeIn.id == megaSynth.id) {
            console.log(`Enabling pattern ${megaSynth.id}`)
            megaSynth.pattern = 'pattern1';
            // TODO: it's a bit funny to have to enable/disable here, no? surely there's a new function that can be made
            megaSynth.disable();
            megaSynth.enable();
          }
        }
        
        // SYNTH OUT
        // Synth to delay
        if (synthNodeOut && delayNodeIn) {
          // Connect synth to delay
          console.log(`Synth node (${synthNodeOut.id}) is connected to Delay node (${delayNodeIn.id})`);
          let megaSynth = megaSynthMap.get(synthNodeOut.id)
          let megaDelay = megaDelayMap.get(delayNodeIn.id)
          console.log(`Connecting delay to ${megaSynth.id}`)
          // TODO: the delay specification is hardcoded here - we need some way of doing it dynamically
          // Note: obviously looping over EVERYTHING is bad...
          megaSynth.synth.connect(megaDelay.delay)
          megaSynth.enable();
        }
        // Synth to reverb
        if (synthNodeOut && reverbNodeIn) {
          // Connect synth to reverb
          console.log(`Synth node (${synthNodeOut.id}) is connected to Reverb node (${reverbNodeIn.id})`);
          let megaSynth = megaSynthMap.get(synthNodeOut.id)
          let megaReverb = megaReverbMap.get(reverbNodeIn.id)
          console.log(`Connecting reverb to ${megaSynth.id}`)
          // TODO: the delay specification is hardcoded here - we need some way of doing it dynamically
          // Note: obviously looping over EVERYTHING is bad...
          megaSynth.synth.connect(megaReverb.reverb)
          // megaSynth.enable();
        }

        // EFFECTS
        // Delay to reverb
        if (delayNodeOut && reverbNodeIn) {
          // Connect synth to reverb
          console.log(`Delay node (${delayNodeOut.id}) is connected to Reverb node (${reverbNodeIn.id})`);
          let megaDelay = megaDelayMap.get(delayNodeOut.id)
          let megaReverb = megaReverbMap.get(reverbNodeIn.id)
          console.log(`Connecting reverb to ${megaDelay.id}`)
          // TODO: the delay specification is hardcoded here - we need some way of doing it dynamically
          // Note: obviously looping over EVERYTHING is bad...
          megaDelay.delay.connect(megaReverb.reverb)
        }

        // Reverb to delay
        if (reverbNodeOut && delayNodeIn) {
          // Connect synth to delay
          console.log(`Reverb node (${reverbNodeOut.id}) is connected to Delay node (${delayNodeIn.id})`);
          let megaReverb = megaReverbMap.get(reverbNodeOut.id)
          let megaDelay = megaDelayMap.get(delayNodeIn.id)
          console.log(`Connecting delay to ${megaReverb.id}`)
          // TODO: the delay specification is hardcoded here - we need some way of doing it dynamically
          // Note: obviously looping over EVERYTHING is bad...
          megaReverb.reverb.connect(megaDelay.delay)
        }
      });
    };

    function addNode(label: any) {
      nodes.update((n) => [
        ...n,
        createNode(label, String(n.length + 2))
    ]);
  }

  function createNode(label: string, id: string): Node {
    switch(label) {
      // TODO: Have functions for node creation - don't hardcode it, this is jank
      // Can we combine megaSynth creation and node list updates
      // TODO: Also this is also only working for the synth...
      case 'synth': {
        let newMegaSynth = new MegaSynth(0, 0, 0, "2", 'none');
        megaSynthMap.set(id, newMegaSynth);
        return {
          id: id,
          type: label,
          position: { x: 100, y: 100 },
          data: { slider1: newMegaSynth.slider1, slider2: newMegaSynth.slider2, slider3: newMegaSynth.slider3 },
        }
      }
      default: {
        let newMegaSynth = new MegaSynth(0, 0, 0, "2", 'none');
        megaSynthMap.set(id, newMegaSynth);
        return {
          id: id,
          type: label,
          position: { x: 100, y: 100 },
          data: { slider1: newMegaSynth.slider1, slider2: newMegaSynth.slider2, slider3: newMegaSynth.slider3 },
        }
      }
    }
  }
</script>

<div style:height="100vh">
  <SvelteFlow {nodes} {edges} {nodeTypes} fitView>
    <Controls />  
    <Background />
    <MiniMap />
  </SvelteFlow>

  <!-- Make node-menu its own NodeMenu component -->
  <div class="node-menu">
    {#each Object.entries(nodeTypes) as [label]}
      <button on:click={() => addNode(label)}>
        {label}
      </button>
    {/each}
  </div>
  
  <style>
    .node-menu {
      position: absolute;
      top: 10px;
      left: 10px;
      background: white;
      padding: 10px;
      border: 1px solid #ddd;
      box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
    }
    /* genericise this styling - how is this best done in svelte? */
    button {
      display: block;
      margin-bottom: 5px;
      padding: 5px;
      cursor: pointer;
    }
  </style>
</div>