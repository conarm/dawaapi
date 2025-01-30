<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';
   
    // TODO: what is this for - we don't use it...
    type $Props = NodeProps;
   
    // Set up node data
    // TODO: add extra values here - name, wave type, amplitude, etc... think of the Tone params
    export let data: { 
      slider1: Writable<number> 
    };
   
    const { slider1 } = data;
  </script>
   
  <div class="sliders">
    <!-- Add a target Handle to the left -->
    <Handle type="target" position={Position.Left} />
    <div>
      Slider1: <strong>{$slider1}</strong>
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

    <!-- Add a source Handle to the right -->
    <Handle type="source" position={Position.Right} />
  </div>

  <!-- TODO: what's a rem? -->
  <style>
    .sliders {
      padding: 1rem;
      background: #fff;
      border: var(--xy-node-border, var(--xy-node-border-default));
      font-size: 0.7rem;
    }
  </style>