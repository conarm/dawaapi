<script>
    export let groupedNodeTypes = {};
    export let addNode;
</script>
  
<div class="node-menu">
  <h3>Add Nodes</h3>
  {#each Object.entries(groupedNodeTypes) as [category, nodes]}
    <div class="node-section">
      <div class="node-section-title">{category}:</div>
      <div class="node-section-buttons">
        {#each Object.entries(nodes) as [label]}
          <!-- Perform type-specific formatting - make buttons imitate their nodes -->
          {#if label !== 'audio-out'}
              {#if category == 'Controls'}
                  <button class="node-button node-button-control" on:click={() => addNode(label)}>
                      {label}
                  </button>
              {:else}
                  <button class="node-button node-button-audio" on:click={() => addNode(label)}>
                  {label}
                  </button>
              {/if}
          {/if}
        {/each}
      </div>
    </div>
  {/each}
</div>  
  
<style>
  .node-menu {
      position: absolute;
      top: 10px;
      left: 10px;
      background: white;
      padding: 10px;
      border: 1px solid #ddd;
      box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  }

  .node-menu h3 {
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .node-section {
    margin-bottom: 0.5rem;
  }

  .node-section-title {
    margin-bottom: 0.5rem;
  }

  /* Make buttons show in-line */
  .node-section-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  /* Make buttons imitate the nodes themselves */
  .node-button {
  background-color: #fff;
    color: #333;
    border-color: #333;
    padding: 0.3rem 0.6rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .node-button-audio {
      border-style: solid;
  }

  .node-button-control {
    border-style: dashed;
  }

  /* Provide some indication that the button is being hovered over for responsiveness */
  .node-button:hover {
    background-color: #f3f3f3;
  }   
</style>