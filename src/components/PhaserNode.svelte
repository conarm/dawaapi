<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';
   
    // Set up node data
    export let data: { 
      slider1: Writable<number>,
      slider2: Writable<number>,
      slider3: Writable<number>,
    };
   
    const { slider1, slider2, slider3 } = data;

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

    <!-- Pattern input -->
    <Handle type="target" position={Position.Left} />

    <div>
      <b>Phaser</b>
      <hr>
    </div>
    <div>
      <i>Frequency: </i><strong>{$slider1}Hz</strong>
    </div>
    <input
      class="nodrag"
      type="range"
      min="0"
      max="10"
      step="0.1"
      on:input={(evt) => slider1.set(Number(evt.currentTarget?.value))}
      value={$slider1}
    />

    <div>
      <i>Octaves: </i><strong>{$slider2}</strong>
    </div>
    <input
      class="nodrag"
      type="range"
      min="0"
      max="8"
      step="1"
      on:input={(evt) => slider2.set(Number(evt.currentTarget?.value))}
      value={$slider2}
    />

    <div>
      <i>Base frequency: </i><strong>{$slider3}Hz</strong>
    </div>
    <input
      class="nodrag"
      type="range"
      min="100"
      max="3000"
      step="50"
      on:input={(evt) => slider3.set(Number(evt.currentTarget?.value))}
      value={$slider3}
    />

    <!-- Add a source Handle to the right -->
    <Handle type="source" position={Position.Right} />
  </div>

  <!-- Info Popup -->
  {#if showInfo}
  <div class="info-popup">
      <div class="info-content">
          <h3>Reverb</h3>
          <p>This node adds reverb.</p>
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