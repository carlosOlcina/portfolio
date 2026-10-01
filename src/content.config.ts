import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { buildProjectsSchema } from './content/projects-schema';
import { profilesSchema } from './content/profiles-schema';
import { technologiesSchema } from './content/technologies-schema';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) => buildProjectsSchema({ image }),
});

const technologies = defineCollection({
  loader: glob({ base: './src/content/technologies', pattern: '**/*.json' }),
  schema: technologiesSchema,
});

const profiles = defineCollection({
  loader: glob({ base: './src/content/profiles', pattern: '**/*.json' }),
  schema: profilesSchema,
});

export const collections = { projects, technologies, profiles };
