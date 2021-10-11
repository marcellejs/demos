/* eslint-env node */
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { join, resolve } from 'path';
import { render } from 'ejs';
import pkg from './package.json';

const demos = pkg.workspaces.map((path) => {
  const demoPkg = require(join(path, 'package.json'));
  return {
    name: demoPkg.name,
    path,
    description: demoPkg.description,
  };
});

function injectHtml({ injectData = {}, injectOptions = {}, tags = [] } = {}) {
  return {
    name: 'vite:injectHtml',
    transformIndexHtml: {
      enforce: 'pre',
      transform(html, { path }) {
        console.log('path', path);
        if (path === '/index.html') {
          return {
            html: render(html, injectData, injectOptions),
            tags,
          };
        } else if (html.includes('src="/src/')) {
          const p = path.split('/index.html')[0].split('/')[1];
          return {
            html: html.split('src="/src/').join(`src="/${p}/src/`),
            tags: [],
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
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )
      .map((x) => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
      .join('');
  return s.slice(0, 1).toLowerCase() + s.slice(1);
};

export default {
  plugins: [
    injectHtml({
      injectData: {
        demos,
      },
    }),
    svelte({ emitCss: false }),
  ],
  build: {
    rollupOptions: {
      input: demos.reduce(
        (o, x) => ({
          ...o,
          [toCamelCase(x.path)]: resolve(__dirname, x.path, 'index.html'),
        }),
        {
          main: resolve(__dirname, 'index.html'),
        }
      ),
    },
  },
  optimizeDeps: {
    exclude: ['@marcellejs/backend'],
  },
};
