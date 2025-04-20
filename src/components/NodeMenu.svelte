<script>
    export let nodeTypes = {};
    export let addNode;
</script>
  
<div class="node-menu">
Add nodes:<hr>
{#each Object.entries(nodeTypes) as [label]}
    {#if label !== 'audio-out'}
    <button class="node-button" on:click={() => addNode(label)}>
        {label}
    </button>
    {/if}
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

.node-button {
    display: block;
    margin-bottom: 5px;
    padding: 5px;
    cursor: pointer;
}
</style>