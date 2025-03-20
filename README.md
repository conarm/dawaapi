# Individual Project - Web Audio API DAW

## Introduction

A node-based piece of audio synthesis software, as a layer on top of, and making use of, the Web Audio API. It aims to provide an accessible DAW as a PWA, allowing users to access the application using a browser from anywhere, without an installation overhead.

## Installation

```sh
npm install
```

## Development

```sh
npm run dev
```

## Build

```sh
npm run build
```

## User Guide

### Usage

A range of nodes can be added to the canvas. These nodes can either generate an audio signal or apply effects to an audio signal. Nodes can be added by left-clicking the appropriate buttons on the node menu.

Nodes can be connected by dragging the connection dots to the left and right of each node. The left connection dot is an input and the right connection dot is an output. To connect any node X to any node Y, click and drag from node X's right-hand dot (node X's output) to node Y's left-hand dot (node Y's input).

Not all nodes have both connection dots.

### Audio generator nodes

Audio generator nodes should not have any input, since they are found at the start of a chain. Currently you can connect a pattern node, however in the future this may change.

 - Synth

### Audio effect nodes

 - Delay
 - Reverb
 - Phaser

### Audio output node

There is a single Audio Output node. Any chain connected to this node will output audio to the browser. Note that you will not hear anything unless an audio chain goes into this node.