/* eslint-disable import/no-extraneous-dependencies */
import svelte from 'rollup-plugin-svelte';

export default {
  plugins: [svelte({ emitCss: false })],
  optimizeDeps: {
    exclude: ['@marcellejs/backend'],
  },
};
