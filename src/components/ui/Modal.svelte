<script>
  // Accept content and a passed in close function
  export let title;
  export let body;
  export let closeModal;
</script>

<div class="help-modal-overlay" aria-hidden="true" on:click={closeModal}>
    <div class="help-modal">
      <button class="close-help-button" on:click={closeModal}>&times;</button>
      <!-- Insert the passed in HTML content -->
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
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .help-modal {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    max-width: 80%;
    width: 90%;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    position: relative;
  }

  .close-help-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }

</style>