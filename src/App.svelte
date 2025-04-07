<script lang="ts">
  import { writable, get, type Writable } from 'svelte/store';
  import {
    SvelteFlow,
    Controls,
    Background,
    MiniMap,
    type Node,
    type Edge,
    type Connection,
  } from '@xyflow/svelte';
  import * as Tone from 'tone';
  import { defaultBPM, nodeTypes, defaultEdges } from './consts';
  import { onMount } from 'svelte';
  import '@xyflow/svelte/dist/style.css';
  import { MegaSynth } from './meganodes/MegaSynth';
  import { MegaDelay } from './meganodes/MegaDelay';
  import { MegaReverb } from './meganodes/MegaReverb';
  import { MegaPhaser } from './meganodes/MegaPhaser';
  import { MegaPattern } from './meganodes/MegaPattern';

  let showModal = false;
  function closeModal() {
    showModal = false;
  }
  
  let megaMap = new Map()
  const nodes = writable<Node[]>([
    {
      id: 'audio-out_1',
      data: {  },
      position: { x: 350, y: 230 },
      type: 'audio-out',
    },
  ]);

  // Set default edge
  let edges = defaultEdges;

  onMount(async () => {
    Tone.getTransport().bpm.value = defaultBPM;
    Tone.getTransport().start(); // Start the audio context
  });

  function getMegaObject(node: Node) {
    console.log(node)
    return megaMap.get(node.id || "0");
  }

  function getMegaObjectById(id: string) {
    return megaMap.get(id);
  }

  // Watch for changes in edges to determine connections
  edges.subscribe((currentEdges) => {
      // Update the routing when there is a change to our edges
      // TODO: Are we running this too much?
      updateAudioRouting(get(nodes), currentEdges);      
    });

    function updateAudioRouting(nodes: Node[], currentEdges: Edge[]) {
      function connectAudioNodes(sourceNode: Node, targetNode: Node) {
          // Get the associate mega (Tone) object for the source and target
          // Some do not have a mega object and don't need it, e.g. audio-out
          // For now pattern has no mega object either
          const sourceMega = getMegaObject(sourceNode);
          const targetMega = getMegaObject(targetNode);

          if ((!sourceMega || !targetMega) && targetNode.type != "audio-out" && sourceNode.type != "pattern") return;

          // Connecting to the output
          if (targetNode.type === "audio-out") {
              if (sourceNode.type === "synth") {
                      console.log(`Enabling synth ${sourceMega.id}`);
                      sourceMega.enable();
                      sourceMega.connectToOutput();
              } else {
                sourceMega.connectToOutput();
              }

          // Connecting to anything else
          } else {
              if (sourceNode.type === "pattern" && targetNode.type === "synth") {
                console.log("pattern: " + sourceMega.getPattern())
                targetMega.pattern = sourceMega.getPattern();
                if (targetMega.isConnected) {
                  targetMega.disable();
                  targetMega.enable();
                }
              } else {
                sourceMega.connect(targetMega)
              }
          }
      }

      // Allow node component indexing by ID
      const nodeMap = new Map(nodes.map(node => [node.id, node]));

      // For each edge, connect the source to the target
      currentEdges.forEach(edge => {
          const sourceNode = nodeMap.get(edge.source);
          const targetNode = nodeMap.get(edge.target);

          if (sourceNode && targetNode) {
            connectAudioNodes(sourceNode, targetNode);
          }
      });
  }

  function disconnect(params: { nodes: Node[]; edges: Edge[] }) {
    if (params.nodes.length > 0) {
      params.nodes.forEach(node => {
        if (node.type == "synth" || node.type == "delay" || node.type == "reverb" || node.type == "phaser") {
          console.log("deleting " + node.type)
          let mega = getMegaObject(node)
          mega.disconnect();
          megaMap.delete(node.id)
        }
      });

      return;
    }

    if (params.edges) {
      console.log("Looking at edges")
      const edge = params.edges[0]
      let megaSource = getMegaObjectById(edge.source)
      let megaTarget = getMegaObjectById(edge.target)
      if (megaTarget && megaSource) {
        megaSource.disconnect(megaTarget.getNode())
      }
      if (megaSource) {
        megaSource.disconnect();
        megaSource.disable();
      }
    }
  }

  function addNode(label: any) {
    nodes.update((n) => [
      ...n,
      createNode(label, label + '_' + Date.now().toString()) // TODO: Make an ID generator function
    ]);
  }

  function createNode(label: string, id: string): Node {
    switch(label) {
      // TODO: Have functions for node creation - don't hardcode it, this is jank
      // Can we combine megaSynth creation and node list updates
      case 'synth': {
        let newMegaSynth = new MegaSynth(id, 0, 0, 0, '', false);
        megaMap.set(id, newMegaSynth);
        return {
          id: id,
          type: label,
          position: { x: 100, y: 100 },
          data: { slider1: newMegaSynth.volume, slider2: newMegaSynth.pitch, slider3: newMegaSynth.shape },
        }
      }
      case 'delay': {
        let newMegaDelay = new MegaDelay(id, 0, 0);
        megaMap.set(id, newMegaDelay);
        return {
          id: id,
          type: label,
          position: { x: 100, y: 100 },
          data: { slider1: newMegaDelay.delayTime, slider2: newMegaDelay.feedback },
        }
      }
      case 'reverb': {
        let newMegaDelay = new MegaReverb(id, 0, 0);
        megaMap.set(id, newMegaDelay);
        return {
          id: id,
          type: label,
          position: { x: 100, y: 100 },
          data: { slider1: newMegaDelay.roomSize, slider2: newMegaDelay.wet },
        }
      }
      case 'phaser': {
        let newMegaPhaser = new MegaPhaser(id, 15, 5, 1000);
        megaMap.set(id, newMegaPhaser);
        return {
          id: id,
          type: label,
          position: { x: 100, y: 100 },
          data: { slider1: newMegaPhaser.frequency, slider2: newMegaPhaser.octaves, slider3: newMegaPhaser.baseFrequency },
        }
      }
      case 'pattern': {
        let newMegaPattern = new MegaPattern(id, 'pattern1');
        megaMap.set(id, newMegaPattern);
        return {
          id: id,
          data: { currentPattern: newMegaPattern.pattern },
          position: {  x: 100, y: 100 },
          type: 'pattern',
        }
      }
      default: {
        let newMegaSynth = new MegaSynth(id, 0, 0, 0, '', false);
        megaSynthMap.set(id, newMegaSynth);
        return {
          id: id,
          type: label,
          position: { x: 100, y: 100 },
          data: { slider1: newMegaSynth.volume, slider2: newMegaSynth.pitch, slider3: newMegaSynth.shape },
        }
      }
    }
  }

  function createEdge(connection: Connection): Edge {
      console.log("dab")
      console.log(connection)
      
      let style = false
      if (connection.source?.startsWith('pattern')) {
        style = true
      }

      // For each edge, connect the source to the target
      return {
        // Do not specify 'id' - let SvelteFlow handle this
        source: connection.source,
        target: connection.target,
        animated: style
      }
    }

    const isValidConnection = (connection) => {
      const { source, sourceHandle, target, targetHandle } = connection;
      console.log(source);
      // Block pattern edges to anything but synths, block any non-pattern edges to synths
      if ((source?.startsWith('pattern') && !target?.startsWith('synth')) ||
           !source?.startsWith('pattern') && target?.startsWith('synth')) {
        return false;
      }

      return true; // Block all other connections
    };
</script>

<div style:height="100vh">
  <SvelteFlow
    {nodes}
    {edges}
    {nodeTypes}
    fitView
    ondelete = {disconnect}
    onedgecreate = {createEdge}
    isValidConnection={isValidConnection}
    >
    <Controls />  
    <Background />
    <MiniMap />
  </SvelteFlow>

  <button class="help-button" on:click={() => showModal = true}>
    ?
  </button>

  {#if showModal}
    <div class="help-modal-overlay" aria-hidden="true" on:click={closeModal}> <!-- TODO: WHAT IS ARIA HIDDEN FOR -->
      <div class="help-modal">
        <button class="close-help-button" on:click={closeModal}>&times;</button>
        <h2>Help</h2>
        <p>Help is on the way</p>
      </div>
    </div>
  {/if}

  <div class="node-menu">
    Add nodes:<hr>
    {#each Object.entries(nodeTypes) as [label]}
      {#if label != 'audio-out'}
        <button class="node-button" on:click={() => addNode(label)}>
          {label}
        </button>
      {/if}
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
    /* TODO: Genericise this styling - how is this best done in svelte? */
    .node-button {
      display: block;
      margin-bottom: 5px;
      padding: 5px;
      cursor: pointer;
    }
   .help-button {
    position: fixed !important;
    top: 1rem !important;
    right: 1rem !important;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #646464;
    color: white;
    border: none;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    z-index: 1000;
  }

  .help-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* slightly transparent */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }

  .help-modal {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    position: relative;
  }

  .close-help-button {
    position: absolute;
    top: 0.5rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
  </style>
</div>