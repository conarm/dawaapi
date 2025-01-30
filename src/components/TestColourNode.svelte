<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';
   
    // TODO: what is this for - we don't use it...
    type $Props = NodeProps;
   
    // Set up node data
    // TODO: add extra values here - name, wave type, amplitude, etc... think of the Tone params
    export let data: { 
        color: Writable<string> 
    };
   
    const { color } = data;
  </script>
   
  <div class="colour">
    <!-- Add a target Handle to the left -->
    <Handle type="target" position={Position.Left} />
    <div>
      color: <strong>{$color}</strong>
    </div>

    <!-- Add a colour input - on input, set the color value of the node data -->
    <!-- TODO: what's the need for nodrag? -->
    <input
      class="nodrag"
      type="color"
      on:input={(evt) => data.color.set(evt.currentTarget?.value)}
      value={$color}
    />

    <!-- Add a source Handle to the right -->
    <Handle type="source" position={Position.Right} />
  </div>

  <!-- TODO: what's a rem? -->
  <style>
    .colour {
      padding: 1rem;
      background: #fff;
      border: var(--xy-node-border, var(--xy-node-border-default));
      font-size: 0.7rem;
    }
  </style>