<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';
   
    // TODO: what is this for - we don't use it...
    type $Props = NodeProps;
   
    // Set up node data
    // TODO: add extra values here - name, wave type, amplitude, etc... think of the Tone params
    export let data: { 
      slider1: Writable<number>,
      slider2: Writable<number>,
      slider3: Writable<number>,
    };
   
    const { slider1, slider2, slider3 } = data;
  </script>
   
  <div class="sliders">
    <!-- No input (target) -->
    <div>
      Disfunctional Synthesizer
      <hr>
    </div>
    <div>
      <i>Amplitude: </i><strong>{$slider1}</strong>
    </div>
    <input
      class="nodrag"
      type="range"
      min="0"
      max="100"
      step="1"
      on:input={(evt) => slider1.set(Number(evt.currentTarget?.value))}
      value={$slider1}
    />

    <div>
      <i>Pitch: </i><strong>{$slider2}</strong>
    </div>
    <input
      class="nodrag"
      type="range"
      min="0"
      max="100"
      step="1"
      on:input={(evt) => slider2.set(Number(evt.currentTarget?.value))}
      value={$slider2}
    />

    <div>
      <i>Shape: </i><strong>{$slider3}</strong>
    </div>
    <input
      class="nodrag"
      type="range"
      min="0"
      max="100"
      step="1"
      on:input={(evt) => slider3.set(Number(evt.currentTarget?.value))}
      value={$slider3}
    />

    <!-- Add a source Handle to the right -->
    <Handle type="source" position={Position.Right} />
  </div>

  <!-- TODO: what's a rem? -->
  <style>
    .sliders {
      padding: 1rem;
      background: #fff;
      border: var(--xy-node-border, var(--xy-node-border-default));
      border-radius: var(--xy-node-border-radius, var(--xy-node-border-radius-default));
      font-size: 0.7rem;
    }
  </style>