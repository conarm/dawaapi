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
  import { defaultBPM, nodeTypes, wrapperMap, helpModalContent, groupedNodeTypes } from './consts';
  import { onMount } from 'svelte';
  import '@xyflow/svelte/dist/style.css';
  import { WrapperSynth } from './wrappers/SynthWrapper';
  import { WrapperPattern } from './wrappers/PatternWrapper';
  import { createNode } from './NodeFactory';
  import Modal from './components/ui/Modal.svelte';
  import NodeMenu from './components/ui/NodeMenu.svelte';
  import { generateSynthEffectsChainTestCase, generateSynthChainTestCase, generateDisconnectedNodesTestCase } from './tests/testData';
  import { generateNodeId } from './helpers';

  let showHelp = false;

  function openHelp() {
    showHelp = true;
  }

  function closeHelp() {
    showHelp = false;
  }
  
  const testMode = false;

  let initialNodes: Node[] = [{
        id: 'audio-out_1',
        data: {  },
        position: { x: 350, y: 230 },
        type: 'audio-out',
        deletable: false
      }];

  let initialEdges: Edge[] = [];

  if (testMode) {
    // const testCase = generateSynthEffectsChainTestCase(3, 5);

    // const testCase = generateSynthChainTestCase(1)
    // const testCase = generateSynthChainTestCase(5)
    // const testCase = generateSynthChainTestCase(9)
    // const testCase = generateSynthChainTestCase(13)
    // const testCase = generateSynthChainTestCase(17)
    // const testCase = generateSynthChainTestCase(21)
    // const testCase = generateSynthChainTestCase(25)
    // const testCase = generateSynthChainTestCase(29)
    // const testCase = generateSynthChainTestCase(33)
    // const testCase = generateSynthChainTestCase(37)
    // const testCase = generateSynthChainTestCase(41)
    // const testCase = generateSynthChainTestCase(45)
    // const testCase = generateSynthChainTestCase(49)
    // const testCase = generateSynthChainTestCase(53)
    // const testCase = generateSynthChainTestCase(57)
    const testCase = generateSynthChainTestCase(120)
    
    initialNodes = testCase.nodes;
    initialEdges = testCase.edges;
  }

  const nodes = writable<Node[]>(initialNodes)
  const edges = writable<Edge[]>(initialEdges)
  

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
        const sourceWrapper = getWrapperObjectById(sourceId);
        const targetWrapper = getWrapperObjectById(targetId);

        // Connecting to the output
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
      createNode(label, generateNodeId(label))
    ]);
  }

  // Disconnect appropriate wrappers on node/edge deletion
  function onDelete(params: { nodes: Node[]; edges: Edge[] }): void {
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
    }

    if (params.edges) {
      const edge = params.edges[0]
      let wrapperSource = getWrapperObjectById(edge.source)
      let wrapperTarget = getWrapperObjectById(edge.target)

      // Check if the edge is from a synth or an effect
      if (edge.source?.startsWith('synth') && wrapperSource && wrapperTarget) {
        wrapperSource.disconnect(wrapperTarget.getNode());
        // (wrapperSource as WrapperSynth).disable(); // TODO: bad cast
        return;
      }

      // Check if the edge is from a synth to the audio output
      if (edge.source?.startsWith('synth') && wrapperSource && !wrapperTarget) {
        wrapperSource.disconnect(Tone.getDestination());
        return;
      }

      // Check if the edge is from anything to a wrapper
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

      if (edge.source?.startsWith('pattern')) {
        let wrapperTarget = getWrapperObjectById(edge.target);
        (wrapperTarget as WrapperSynth).pattern = '';
        (wrapperTarget as WrapperSynth).disable();
        (wrapperTarget as WrapperSynth).enable();
      }
    }
  }

  // Apply appropriate styles on edge creation
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

  // Update routing on node-node connection attempt
  function onConnect(): void {
    updateAudioRouting(get(edges));
  }

  // Validate when a connection is at validation stage
  const isValidConnection = (connection: Connection) => {
    const { source, sourceHandle, target, targetHandle } = connection;

    // Block pattern edges to anything but synths, block any non-pattern edges to synths
    if ((source?.startsWith('pattern') && !target?.startsWith('synth')) ||
          !source?.startsWith('pattern') && target?.startsWith('synth')) {
      return false;
    }

    // Block more than one edge going into a synth from ny pattern
    if (source?.startsWith('pattern')) {
      const incoming = get(edges).filter(edge => edge.target === target);
      if (incoming.length > 0) { // use 0 because this runs before the edge is applied
        return false
      }
    }
    
    // Allow all other connections
    return true;
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

  <NodeMenu {groupedNodeTypes} {addNode} />
  
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