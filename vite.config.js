/* eslint-env node */
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import pkg from './package.json';
import meta from './meta.js';

function injectHtml({ injectData = {}, injectOptions = {}, tags = [] } = {}) {
  return {
    name: 'vite:injectHtml',
    transformIndexHtml: {
      enforce: 'pre',
      transform(html, { path }) {
        if (pkg.workspaces.includes(path.split('/')[1]) && html.includes('src="/src/')) {
          const p = path.split('/index.html')[0].split('/')[1];
          return {
            html: html.split('src="/src/').join(`src="/${p}/src/`),
            tags: [],
          };
        } else {
          return {
            html,
            tags,
          };
        }
      },
    },
  };
}

const toCamelCase = (str) => {
  const s =
    str &&
    str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      .map((x) => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
      .join('');
  return s.slice(0, 1).toLowerCase() + s.slice(1);
};

export default {
  plugins: [
    injectHtml({
      injectData: {
        demos: meta,
      },
    }),
    svelte({ emitCss: false }),
  ],
  build: {
    rollupOptions: {
      input: meta.reduce(
        (o, x) => ({
          ...o,
          [toCamelCase(x.path)]: resolve(__dirname, x.path, 'index.html'),
        }),
        {
          main: resolve(__dirname, 'index.html'),
        },
      ),
    },
  },
};
