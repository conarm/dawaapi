<script>
    export let title;
    export let body;
    export let closeModal;
</script>

<div class="help-modal-overlay" aria-hidden="true" on:click={closeModal}> <!-- TODO: WHAT IS ARIA HIDDEN FOR -->
    <div class="help-modal">
      <button class="close-help-button" on:click={closeModal}>&times;</button>
      {@html title}
      {@html body}
    </div>
  </div>

<style>
.help-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* slightly transparent */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }

  .help-modal {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    max-width: 80%;
    width: 90%;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    position: relative;
    overflow: auto; /* TODO: make it scrollable with loads of text */
  }

  .close-help-button {
    position: absolute;
    top: 0.5rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }

</style>