<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';
   
    // TODO: what is this for - we don't use it...
    type $Props = NodeProps;
   
    // Set up node data
    // TODO: add extra values here - name, wave type, amplitude, etc... think of the Tone params
    export let data: { 
      currentPattern: Writable<string>,
    };

    let patterns = ["pattern1"]
   
    const { currentPattern } = data;
  </script>
   
  <div class="sliders">
    <!-- No input (target) -->
    <div>
    <b>Pattern</b>
      <hr>
    </div>
    <div>
      <i>Pattern: </i>{$currentPattern}
    </div>
    <select
		value={$currentPattern}
        on:input={(evt) => currentPattern.set(String(evt.currentTarget?.value))}
	>
		{#each patterns as pattern}
			<option value={pattern}>
				{pattern}
			</option>
		{/each}
	</select>

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