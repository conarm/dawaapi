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

  let megaMap = new Map()
  // let megaSynthMap = new Map();
  // let megaSynth1 = new MegaSynth("2", 0, 0, 0, 'none', false);
  // let megaSynth2 = new MegaSynth("3", 0, 0, 0, 'none', false);
  // let megaSynth3 = new MegaSynth("4", 0, 0, 0, 'none', false);
  // megaMap.set('2', megaSynth1);
  // megaMap.set('3', megaSynth2);
  // megaMap.set('4', megaSynth3);

  // let delay = new MegaDelay("5", 0, 0);
  // megaMap.set('5', delay);

  // let reverb = new MegaReverb("6", 0, 0);
  // megaMap.set('6', reverb);

  const nodes = writable<Node[]>([
    {
      id: '1',
      data: {  },
      position: { x: 350, y: 230 },
      type: 'audio-out',
    },
    // {
    //   id: '1',
    //   data: { color: writable('#ff4000') }, 
    //   position: { x: 200, y: 300 },
    //   type: 'colour',
    // },
    // {
    //   id: '2',
    //   data: { slider1: megaSynth1.volume, slider2: megaSynth1.pitch, slider3: megaSynth1.shape },
    //   position: { x: -600, y: 200 },
    //   type: 'synth',
    // },
    // {
    //   id: '3',
    //   data: { slider1: megaSynth2.slider1, slider2: megaSynth2.slider2, slider3: megaSynth2.slider3 },
    //   position: { x: -400, y: 0 },
    //   type: 'synth',
    // },
    // {
    //   id: '4',
    //   data: { slider1: megaSynth3.slider1, slider2: megaSynth3.slider2, slider3: megaSynth3.slider3 },
    //   position: { x: -200, y: -200 },
    //   type: 'synth',
    // },
    // {
    //   id: '6',
    //   data: { currentPattern: writable('pattern1') },
    //   position: { x: -600, y: -130 },
    //   type: 'pattern',
    // },
    // {
    //   id: '7',
    //   data: { slider1: delay.slider1, slider2: delay.slider2 },
    //   position: { x: -150, y: 30 },
    //   type: 'delay',
    // },
    // {
    //   id: '8',
    //   data: { slider1: reverb.slider1, slider2: reverb.slider2 },
    //   position: { x: 100, y: 30 },
    //   type: 'reverb',
    // },
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
                  if (!sourceMega.isConnected) {
                      console.log(`Enabling synth ${sourceMega.id}`);
                      sourceMega.enable();
                      sourceMega.connectToOutput();
                  }
              } else {
                sourceMega.connectToOutput();
              }

          // Connecting to anything else
          } else {
              if (sourceNode.type === "pattern" && targetNode.type === "synth") {
                targetMega.pattern = 'pattern1';
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
    console.log(params)
    if (params.nodes.length > 0) {
      params.nodes.forEach(node => {
        if (node.type == "synth" || node.type == "delay" || node.type == "reverb") {
          console.log("deleting " + node.type)
          let mega = getMegaObject(node)
          mega.disconnect();
          megaMap.delete(node.id)
        }
      });

      // Return now
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
      createNode(label, String(n.length + 2))
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
        return {
          id: id,
          data: { currentPattern: writable('pattern1') },
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
      let mega = getMegaObjectById(connection.source)
      
      let style = false
      if (mega == undefined) {
        console.log("dub dab")
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
</script>

<div style:height="100vh">
  <SvelteFlow
    {nodes}
    {edges}
    {nodeTypes}
    fitView
    ondelete = {disconnect}
    onedgecreate = {createEdge}
    >
    <Controls />  
    <Background />
    <MiniMap />
  </SvelteFlow>

  <!-- Make node-menu its own NodeMenu component -->
  <div class="node-menu">
    Add nodes: <hr>
    {#each Object.entries(nodeTypes) as [label]}
      {#if label != 'audio-out'}
        <button on:click={() => addNode(label)}>
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
    button {
      display: block;
      margin-bottom: 5px;
      padding: 5px;
      cursor: pointer;
    }
  </style>
</div>