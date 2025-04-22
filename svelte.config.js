import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    paths: {
      base: dev ? '' : '/individual-project-conarm', // This must match your repo name
    },
    prerender: {
      default: true
    }
  }
};
