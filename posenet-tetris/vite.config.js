/* eslint-disable import/no-extraneous-dependencies */
import { svelte } from 'vite-plugin-svelte';

export default {
  port: 8080,
  plugins: [
    // These options are optional, you don't have to configure them manually,
    // for the most part.
    svelte({
      // Svelte compiler options
      compilerOptions: {},
      // Svelte HMR options, pass false to disable
      hmrOptions: {},
      // Svelte preprocessors
      preprocess: [],
      // Plugin options
      pluginsOptions: {},
    }),
  ],
  optimizeDeps: {
    exclude: ['@marcellejs/backend'],
  },
  minify: 'esbuild',
};
