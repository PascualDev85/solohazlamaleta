import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { guideSchema } from './content/schema';

/**
 * Guides are data files, not prose. An invalid one fails the build rather
 * than rendering a broken page.
 */
const guides = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/guides' }),
  schema: guideSchema,
});

export const collections = { guides };
