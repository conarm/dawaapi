<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';
   
  </script>
   
  <div class="colour">
    <!-- Add a target Handle to the left -->
    <Handle type="target" position={Position.Left} />

    <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG56dWpqa2kwN3Q2Mnd3M2R2dm55bnd2bnF2amNncjlnZDE1eTdqNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VIKa3CjZDCoymNcBY5/giphy.gif" height="100" />

    <!-- Add a source Handle to the right -->
    <Handle type="source" position={Position.Right} />
  </div>

  <style>
    .colour {
      padding: 1rem;
      background: #fff;
      border-radius: var(--xy-node-border-radius, var(--xy-node-border-radius-default));
      border: var(--xy-node-border, var(--xy-node-border-default));
      font-size: 0.7rem;
    }
    /* img {
      width: 20%;
      height: 20%;
    } */
  </style>