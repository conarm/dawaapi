<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
   
    // TODO: what is this for - we don't use it...
    type $Props = NodeProps;
  </script>
   
  <div class="output">
    <!-- Add a target Handle to the left -->
    <Handle type="target" position={Position.Left} />
    <div>
      <b>Audio Out</b>
    </div>

    <!-- No source (output) -->
  </div>

  <style>
    .output {
      padding: 1rem;
      background: #fff;
      border: var(--xy-node-border, var(--xy-node-border-default));
      border-radius: var(--xy-node-border-radius, var(--xy-node-border-radius-default));
      font-size: 0.7rem;
    }
  </style>