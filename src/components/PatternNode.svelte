<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';
   
    // Set up node data
    export let data: { 
      currentPattern: Writable<string>,
    };

    let patterns = ["pattern1"]
   
    const { currentPattern } = data;

    let showInfo = false;
  </script>
   
  <div class="sliders">
    <!-- Info Button -->
    <button class="info-button" on:click={() => showInfo = !showInfo}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12" y2="8"></line>
      </svg>
    </button>

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
  <!-- Info Popup -->
  {#if showInfo}
  <div class="info-popup">
      <div class="info-content">
          <h3>Pattern</h3>
          <p>This node plays a Synthesizer.</p>
          <button class="close-button" on:click={() => showInfo = false}>Close</button>
      </div>
  </div>
  {/if}

  <!-- TODO: what's a rem? -->
  <style>
    .sliders {
      padding: 1rem;
      background: #fff;
      border: var(--xy-node-border, var(--xy-node-border-default));
      border-radius: var(--xy-node-border-radius, var(--xy-node-border-radius-default));
      font-size: 0.7rem;
    }

    
  /* Info button */
  .info-button {
    position: absolute;
    top: 5px;
    right: 5px;
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
  }

  /* Info popup */
  .info-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    z-index: 100;
  }

  /* Info content */
  .info-content {
    text-align: center;
  }

  /* Close button */
  .close-button {
    margin-top: 10px;
    padding: 5px 10px;
    border: none;
    background: red;
    color: white;
    cursor: pointer;
    border-radius: 5px;
  }
  </style>