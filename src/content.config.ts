import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { buildProjectsSchema } from './content/projects-schema';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) => buildProjectsSchema({ image }),
});

export const collections = { projects };
