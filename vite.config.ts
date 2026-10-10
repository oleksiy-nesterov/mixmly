import fs from 'node:fs';
import path from 'node:path';
import optimizeLocales from '@react-aria/optimize-locales-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import macros from 'unplugin-parcel-macros';
import { defineConfig, loadEnv } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf8'),
) as { version: string; name: string };

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const appEnv = loadEnv(mode, rootDir, '');
  const buildDate = new Date().toISOString();
  const outDir = 'dist';

  return {
    define: {
      APP_VERSION: JSON.stringify(packageJson.version),
      APP_NAME: JSON.stringify(
        appEnv.VITE_PROJECT_NAME ?? JSON.stringify(packageJson.name),
      ),
    },
    plugins: [
      macros.vite(),
      {
        ...optimizeLocales.vite({
          locales: ['en-US'],
        }),
        enforce: 'pre',
      },
      react(),
      tailwindcss(),
      {
        name: 'project-html-transform',
        transformIndexHtml: (html) => html.replace(/%BUILD_DATE%/g, buildDate),
        closeBundle: () => {
          const today = buildDate.split('T')[0];

          try {
            const sitemapFile = path.resolve(rootDir, outDir, 'sitemap.xml');

            if (!fs.existsSync(sitemapFile)) {
              return;
            }

            const sitemap = fs.readFileSync(sitemapFile, 'utf8');
            const sitemapUpdated = sitemap.replace(
              /<lastmod>.*?<\/lastmod>/g,
              `<lastmod>${today}</lastmod>`,
            );

            fs.writeFileSync(sitemapFile, sitemapUpdated, 'utf8');
          } catch {
            // Ignore sitemap post-processing failures during local builds.
          }
        },
      },
    ],
    build: {
      target: ['es2022'],
      cssMinify: 'lightningcss',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (
              /macro-(.*)\.css$/.test(id) ||
              /@react-spectrum\/s2\/.*\.css$/.test(id)
            ) {
              return 's2-styles';
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});
