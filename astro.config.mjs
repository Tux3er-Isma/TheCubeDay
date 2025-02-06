// @ts-check
import { defineConfig } from 'astro/config';


import netlify from '@astrojs/netlify';


import vercel from '@astrojs/vercel/serverless';


// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
});