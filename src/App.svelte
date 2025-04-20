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
  import { defaultBPM, nodeTypes, wrapperMap, helpModalContent } from './consts';
  import { onMount } from 'svelte';
  import '@xyflow/svelte/dist/style.css';
  import { WrapperSynth } from './wrappers/SynthWrapper';
  import { WrapperPattern } from './wrappers/PatternWrapper';
  import { createNode } from './NodeFactory';
  import Modal from './components/common/Modal.svelte';
  import NodeMenu from './components/common/NodeMenu.svelte';

  let showHelp = false;

  function openHelp() {
    showHelp = true;
  }

  function closeHelp() {
    showHelp = false;
  }
  
  // Setup nodes - always start with a non-deletable audio-out
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
  let edges = writable<Edge[]>([]);

  // Start Tone Transport after page is rendered
  onMount(async () => {
    Tone.getTransport().bpm.value = defaultBPM;
    Tone.getTransport().start(); // Start the audio context
  });

  function getWrapperObjectById(id: string) {
    return wrapperMap.get(id);
  }

  // Update the audio routing using the appropriate Wrapper objects, based on the list of edges
  function updateAudioRouting(currentEdges: Edge[]) {
    // For each edge, connect the source to the target
    currentEdges.forEach(edge => {
      connectAudioNodes(edge.source, edge.target);
    });
    
    function connectAudioNodes(sourceId: string, targetId: string) {
        // Get the associate wrapper (Tone) object for the source and target
        // Some do not have a wrapper object and don't need it, e.g. audio-out
        // For now pattern has no wrapper object either
        const sourceWrapper = getWrapperObjectById(sourceId);
        const targetWrapper = getWrapperObjectById(targetId);

        // Connecting to the output
        // sourceWrapper WrapperNode, targetWrapper null
        if (targetId.startsWith("audio-out") && sourceWrapper) {
            if (sourceId.startsWith("synth")) {
                (sourceWrapper as WrapperSynth).enable(); // TODO: casting is bad
                sourceWrapper.connectToOutput();
            } else {
              sourceWrapper.connectToOutput();
            }

        // Connecting to anything else
        } else if (sourceWrapper && targetWrapper) {
            if (sourceId.startsWith("pattern") && targetId.startsWith("synth")) {
              // TODO: This allows pattern setting on edge creation but not when it changes on the pattern node
              (targetWrapper as WrapperSynth).pattern = (sourceWrapper as WrapperPattern).getPattern();
              if (targetWrapper.isConnected) {
                (targetWrapper as WrapperSynth).disable();
                (targetWrapper as WrapperSynth).enable(); // TODO: again - casting is bad
              }
            } else {
              sourceWrapper.connect(targetWrapper)
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
          let wrapper = getWrapperObjectById(node.id)
          if (wrapper) {
            wrapper.disconnect();
            wrapperMap.delete(node.id)
          }
        }
      });

      return;
    }

    if (params.edges) {
      const edge = params.edges[0]
      let wrapperSource = getWrapperObjectById(edge.source)

      // Check if the edge is from a synth or an effect
      if (edge.source?.startsWith('synth') && wrapperSource) {
        wrapperSource.disconnect();
        (wrapperSource as WrapperSynth).disable(); // TODO: bad cast
        return;
      }

      if (!edge.source?.startsWith('synth') && !edge.source?.startsWith('pattern') &&  edge.source?.startsWith('audio-out') && wrapperSource) {
        let wrapperTarget = getWrapperObjectById(edge.target)
        if (wrapperTarget) {
          wrapperSource.disconnect(wrapperTarget.getNode()) // TODO: bad cast
        }
        return;
      }

      if (!edge.source?.startsWith('synth') && !edge.source?.startsWith('pattern') &&  !edge.source?.startsWith('audio-out') && wrapperSource) {
        wrapperSource.disconnect()
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

  // Run when a node-node connection is attempted
  function onConnect(): void {
    updateAudioRouting(get(edges));
  }

  // Run when a connection is at validation stage
  const isValidConnection = (connection) => {
    const { source, sourceHandle, target, targetHandle } = connection;
    // Block pattern edges to anything but synths, block any non-pattern edges to synths
    if ((source?.startsWith('pattern') && !target?.startsWith('synth')) ||
          !source?.startsWith('pattern') && target?.startsWith('synth')) {
      return false;
    }
    return true; // Allow all other connections
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

  <button class="help-button" on:click={openHelp}>
    ?
  </button>

  <NodeMenu {nodeTypes} {addNode} />
  
  {#if showHelp}
    <Modal closeModal={closeHelp} title={helpModalContent.title} body={helpModalContent.body} />
  {/if}
  <style>
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
  </style>
</div>