// @ts-check
import { defineConfig } from "astro/config";

import vue from "@astrojs/vue";

import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  output: 'server',

  vite: {
      plugins: [tailwindcss()],
  },

  adapter: vercel(),
});
