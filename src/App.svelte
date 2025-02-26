<script lang="ts">
  import { writable, get, type Writable } from 'svelte/store';
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
  import AudioOutNode from './components/AudioOutNode.svelte';
  import PatternNode from './components/PatternNode.svelte';
  import DelayNode from './components/DelayNode.svelte';
  import ReverbNode from './components/ReverbNode.svelte';
  import { onMount } from 'svelte';
  import * as Tone from 'tone';

  import '@xyflow/svelte/dist/style.css';
    import type { OmniOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';

  const defaultBPM = 150;

  // Set node types
  // The 'type' property on Nodes in the node array should match any of these typenames (or just not specify 'type')
  // TODO: Move these into another const
  const nodeTypes = {
    'colour': TestColourNode,
    'synth': SynthesizerNode,
    'audio-out': AudioOutNode,
    'pattern': PatternNode,
    'delay': DelayNode,
    'reverb': ReverbNode,
  };

  const nodeDefaults = {
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  };

  const pitches = [
    "C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "A4",
    "B4",
    "C5",
    "D5",
    "E5",
    "F5",
    "G5",
    "A5",
    "B5",
  ];

  const shapes: OmniOscillatorType[] = [
    "sine",
    "square",
    "triangle",
    "sawtooth",
  ];

  class MegaSynth {
    // TODO: Rename these to actual slider types
    slider1: Writable<number>;
    slider2: Writable<number>;
    slider3: Writable<number>;
    pitch: number;
    synth: Tone.Synth;
    isConnected: boolean;
    id: string;
    pattern: string;
    part: Tone.Part;

    constructor(initVol: number, initPitch: number, initX: number, id: string, pattern: string) {
      this.isConnected = false;
      this.slider1 = writable(initVol);
      this.slider2 = writable(initPitch);
      // TODO: surely we don't need to track pitch, that's a bit overkill right? why does enable_synth run twice when you first connect the synth
      this.pitch = initPitch;
      this.slider3 = writable(initX);
      this.synth = new Tone.Synth();

      this.slider1.subscribe((val) => {
        this.change_synth_volume(val);
      })

      this.slider2.subscribe((val) => {
        this.change_synth_pitch(val);
      })

      this.slider3.subscribe((val) => {
        this.change_synth_shape(val);
      })

      this.id = id;

      // TODO: don't hardcode pattern through constructor - allow for pattern to be set by a dropdown or an input node
      this.pattern = pattern;

      // set melody
      this.part = new Tone.Part((time, event) => 
        { this.synth.triggerAttackRelease(event.note, event.dur, time)},
        [{ time : 0, note : "C4", dur : "4n"}, { time : "4n + 8n", note : "E4", dur : "8n"}, { time : "2n", note : "G4", dur : "16n"}, { time : "2n + 8t", note : "B4", dur : "4n"}])    
    }

    enable() {
      console.log("Synth enabled - triggering attack");
      this.isConnected = true;
      if (this.pattern == 'pattern1') {
        this.part.loop = true;
        this.part.start();
      } else {
        this.synth.triggerAttack(pitches[this.pitch]); // Start a constant note
      }
      Tone.getTransport().start();
    }

    disable() {
      console.log("Synth disabled - triggering release");
      this.isConnected = false;
      this.synth.triggerRelease(); // Stop the note
      // TODO: keep this here?
      this.synth.disconnect;
    }

    change_synth_volume(val: number) {
      console.log("Volume changed");
      this.synth.set({
        volume: val
      })
      }
    
    change_synth_pitch(val: number) {
      console.log("Pitch changed");
      this.synth.setNote(pitches[val]);
      this.pitch = val;
    }
    
    change_synth_shape(val: number) {
      console.log("Pitch changed");
      this.synth.oscillator.type = shapes[val];
    }
  }

  class MegaDelay {
    // TODO: Rename these to actual slider types
    slider1: Writable<number>;
    slider2: Writable<number>;
    delay: Tone.FeedbackDelay;
    id: string;

    constructor(initParam1: number, initParam2: number, initParam3: number, id: string) {
      this.slider1 = writable(initParam1);
      this.slider2 = writable(initParam2);
      this.delay = new Tone.FeedbackDelay(0.5);

      this.slider1.subscribe((val) => {
        this.change_delay_param_1(val);
      })

      this.slider2.subscribe((val) => {
        this.change_delay_param_2(val);
      })

      this.id = id;
    }

    change_delay_param_1(val: number) {
      console.log("Param 1 changed");
      this.delay.set({delayTime: val});
    }
    
    change_delay_param_2(val: number) {
      this.delay.set({feedback: val});
    }
  }

  class MegaReverb {
    // TODO: Rename these to actual slider types
    slider1: Writable<number>;
    slider2: Writable<number>;
    reverb: Tone.JCReverb;
    id: string;

    constructor(initParam1: number, initParam2: number, initParam3: number, id: string) {
      this.slider1 = writable(initParam1);
      this.slider2 = writable(initParam2);
      this.reverb = new Tone.JCReverb(0.5);

      this.slider1.subscribe((val) => {
        this.change_reverb_param_1(val);
      })

      this.slider2.subscribe((val) => {
        this.change_reverb_param_2(val);
      })

      this.id = id;
    }

    change_reverb_param_1(val: number) {
      console.log("Param 1 changed");
      this.reverb.set({roomSize: val});
    }
    
    change_reverb_param_2(val: number) {
      this.reverb.set({wet: val});
    }
  }

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
      position: { x: -400, y: 200 },
      type: 'synth',
    },
    {
      id: '3',
      data: { slider1: megaSynth2.slider1, slider2: megaSynth2.slider2, slider3: megaSynth2.slider3 },
      position: { x: -180, y: 0 },
      type: 'synth',
    },
    {
      id: '4',
      data: { slider1: megaSynth3.slider1, slider2: megaSynth3.slider2, slider3: megaSynth3.slider3 },
      position: { x: 100, y: -200 },
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
      position: { x: -450, y: -130 },
      type: 'pattern',
    },
    {
      id: '7',
      data: { slider1: delay.slider1, slider2: delay.slider2 },
      position: { x: 60, y: 30 },
      type: 'delay',
    },
    {
      id: '8',
      data: { slider1: reverb.slider1, slider2: reverb.slider2 },
      position: { x: 60, y: 30 },
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

        // TODO: Genericise all of this shite instead of checking for each possible node/edge combination - some kind of traversal?
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
</script>

<div style:height="100vh">
  <SvelteFlow {nodes} {edges} {nodeTypes} fitView>
    <Controls />
    <Background />
    <MiniMap />
  </SvelteFlow>
</div>