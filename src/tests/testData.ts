import {
    type Node,
    type Edge
  } from '@xyflow/svelte';
import { createNode } from '../NodeFactory';
import { generateNodeId } from '../helpers';

const audioOut: Node = {
    id: 'audio-out_1',
    data: {  },
    position: { x: 350, y: 230 },
    type: 'audio-out',
    deletable: false
}

// Generates one or more synths that send signals into the output
// The synthCount parameter sets the number of synths
export function generateSynthChainTestCase(synthCount = 1) {
    const nodes = [];
    const edges = [];

    // Create synths
    for (let i = 0; i < synthCount; i++) {
        const synth = createNode("synth", generateNodeId("synth"));
        nodes.push(synth);
    }
    nodes.push(audioOut);

    // Connect synths to audio-out
    for (let i = 0; i < synthCount; i++) {
        const source = nodes[i];
        const target = audioOut;
        edges.push({
            id: `${source.id}-${target.id}`,
            source: source.id,
            target: target.id
        });
    }

    return {
        nodes,
        edges
    };
}

// Generates one or more synths that send signals into a chain of reverb and delays
// The synthCount parameter sets the number of synths going into the chain
// The chainLength parameter sets the number of repeating reverb/delay nodes
export function generateSynthEffectsChainTestCase(synthCount = 5, chainLength = 3) {
    const nodes = [];
    const edges = [];

    // Create synths
    const synths = [];
    for (let i = 0; i < synthCount; i++) {
        const synth = createNode("synth", generateNodeId("synth"));
        synths.push(synth);
        nodes.push(synth);
    }

    // Create reverb/delay chain
    const chain = [];
    for (let i = 0; i < chainLength; i++) {
        const reverb = createNode("reverb", generateNodeId("reverb"));
        const delay = createNode("delay", generateNodeId("delay"));
        nodes.push(reverb, delay);
        chain.push(reverb, delay);
    }

    // Connect each synth to the start of the chain
    const firstInChain = chain[0];
    for (const synth of synths) {
        edges.push({
            id: `${synth.id}-${firstInChain.id}`,
            source: synth.id,
            target: firstInChain.id
        });
    }

    // Connect the chain together
    for (let i = 0; i < chain.length - 1; i++) {
        const source = chain[i];
        const target = chain[i + 1];
        edges.push({
            id: `${source.id}-${target.id}`,
            source: source.id,
            target: target.id
        });
    }

    // Add audioOut, connect to last node in chain
    nodes.push(audioOut);
    const lastInChain = chain[chain.length - 1];
    edges.push({
        id: `${lastInChain.id}-${audioOut.id}`,
        source: lastInChain.id,
        target: audioOut.id
    });

    return {
        nodes,
        edges
    };
}

// Generates a set number of disconnected nodes
// The nodeCount parameter sets the number of nodes
// The type parameter sets the type
export function generateDisconnectedNodesTestCase(nodeCount = 1, type = "synth") {
    const nodes = [];
    const edges: Edge[] = [];

    // Create synths
    const synths = [];
    for (let i = 0; i < nodeCount; i++) {
        const synth = createNode(type, generateNodeId(type));
        nodes.push(synth);
    }
    // Add audioOut, connect to last node in chain
    nodes.push(audioOut);

    return {
        nodes,
        edges
    };
}


