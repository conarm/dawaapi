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
  import { defaultBPM, nodeTypes, defaultEdges, megaMap } from './consts';
  import { onMount } from 'svelte';
  import '@xyflow/svelte/dist/style.css';
  import { MegaSynth } from './meganodes/MegaSynth';
  import { MegaPattern } from './meganodes/MegaPattern';
  import { createNode } from './NodeFactory';

  let showModal = false;
  function closeModal() {
    showModal = false;
  }
  
  const nodes = writable<Node[]>([
    {
      id: 'audio-out_1',
      data: {  },
      position: { x: 350, y: 230 },
      type: 'audio-out',
      deletable: false
    },
  ]);

  // Set default edge
  let edges = defaultEdges;

  onMount(async () => {
    Tone.getTransport().bpm.value = defaultBPM;
    Tone.getTransport().start(); // Start the audio context
  });

  function getMegaObjectById(id: string) {
    return megaMap.get(id);
  }

  function updateAudioRouting(nodes: Node[], currentEdges: Edge[]) {
    // For each edge, connect the source to the target
    currentEdges.forEach(edge => {
      connectAudioNodes(edge.source, edge.target);
    });
    
    function connectAudioNodes(sourceId: string, targetId: string) {
        // Get the associate mega (Tone) object for the source and target
        // Some do not have a mega object and don't need it, e.g. audio-out
        // For now pattern has no mega object either
        const sourceMega = getMegaObjectById(sourceId);
        const targetMega = getMegaObjectById(targetId);

        // Connecting to the output
        // sourceMega MegaNode, targetMega null
        if (targetId.startsWith("audio-out") && sourceMega) {
            if (sourceId.startsWith("synth")) {
                (sourceMega as MegaSynth).enable(); // TODO: casting is bad
                sourceMega.connectToOutput();
            } else {
              sourceMega.connectToOutput();
            }

        // Connecting to anything else
        } else if (sourceMega && targetMega) {
            if (sourceId.startsWith("pattern") && targetId.startsWith("synth")) {
              // TODO: This allows pattern setting on edge creation but not when it changes on the pattern node
              (targetMega as MegaSynth).pattern = (sourceMega as MegaPattern).getPattern();
              if (targetMega.isConnected) {
                (targetMega as MegaSynth).disable();
                (targetMega as MegaSynth).enable(); // TODO: again - casting is bad
              }
            } else {
              sourceMega.connect(targetMega)
            }
        }
    }
  }

  function addNode(label: any) {
    nodes.update((n) => [
      ...n,
      createNode(label, label + '_' + Date.now().toString()) // TODO: Make an ID generator function
    ]);
  }

  function onDelete(params: { nodes: Node[]; edges: Edge[] }) {
    if (params.nodes.length > 0) {
      params.nodes.forEach(node => {
        if (node.type == "synth" || node.type == "delay" || node.type == "reverb" || node.type == "phaser") {
          let mega = getMegaObjectById(node.id)
          if (mega) {
            mega.disconnect();
            megaMap.delete(node.id)
          }
        }
      });

      return;
    }

    if (params.edges) {
      const edge = params.edges[0]
      let megaSource = getMegaObjectById(edge.source)

      // Check if the edge is from a synth or an effect
      if (edge.source?.startsWith('synth') && megaSource) {
        megaSource.disconnect();
        (megaSource as MegaSynth).disable(); // TODO: bad cast
        return;
      }

      if (!edge.source?.startsWith('synth') && !edge.source?.startsWith('pattern') &&  edge.source?.startsWith('audio-out') && megaSource) {
        let megaTarget = getMegaObjectById(edge.target)
        if (megaTarget) {
          megaSource.disconnect(megaTarget.getNode()) // TODO: bad cast
        }
        return;
      }

      if (!edge.source?.startsWith('synth') && !edge.source?.startsWith('pattern') &&  !edge.source?.startsWith('audio-out') && megaSource) {
        megaSource.disconnect()
        return;
      }
    }
  }

  function onEdgeCreate(connection: Connection): Edge {
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

  function onConnect(connection: Connection): void {
    // TODO: do something with connection? make it so that we aren't updating the whole audio graph each time?
    updateAudioRouting(get(nodes), get(edges));
  }

  const isValidConnection = (connection) => {
    const { source, sourceHandle, target, targetHandle } = connection;
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
    ondelete = {onDelete}
    onedgecreate = {onEdgeCreate}
    onconnect = {onConnect}
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
        <p>A range of nodes can be added to the canvas. These nodes can either generate an audio signal or apply effects to an audio signal. Nodes can be added by left-clicking the appropriate buttons on the node menu. Nodes can be connected by dragging the connection dots to the left and right of each node. The left connection dot is an input and the right connection dot is an output. To connect any node X to any node Y, click and drag from node X's right-hand dot (node X's output) to node Y's left-hand dot (node Y's input). Not all nodes have both connection dots.</p>

          
          <h3>Audio generator nodes</h3>
          
          Audio generator nodes should not have any input, since they are found at the start of a chain. Currently you can connect a pattern node, however in the future this may change.
          <ul>
            <li>Synth</li>
          </ul>
          
          <h3>Audio effect nodes</h3>
          <ul>
              <li>Delay</li>
              <li>Reverb</li>
              <li>Phaser</li>
          </ul>
          <h3>Audio output node</h3>
          <p>There is a single Audio Output node. Any chain connected to this node will output audio to the browser. Note that you will not hear anything unless an audio chain goes into this node.</p>
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
    max-width: 80%;
    width: 90%;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    position: relative;
    overflow: auto; /* TODO: make it scrollable with loads of text */
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