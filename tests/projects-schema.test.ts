import { readFileSync } from 'node:fs';
import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import {
  buildProjectsSchema,
  sortProjects,
  type SortableProject,
} from '../src/content/projects-schema';

const sourceRoot = new URL('../src/', import.meta.url);
const configSource = readFileSync(
  new URL('content.config.ts', sourceRoot),
  'utf8',
);
const schemaSource = readFileSync(
  new URL('content/projects-schema.ts', sourceRoot),
  'utf8',
);

const normalize = (value: string): string => value.replace(/\s+/g, ' ').trim();

const validFrontmatter: Record<string, unknown> = {
  id: '6f9c1c1e-4a7b-4a3e-9d2f-1f5c8a2b7e10',
  title: 'Synapse',
  description: 'Copiloto IA para desarrolladores con análisis semántico.',
  technologies: ['Next.js', 'TypeScript'],
  coverPath: './covers/synapse.webp',
  coverAlt: 'Portada de Synapse: degradado índigo.',
  websiteUrl: 'https://example.com',
  priority: 1,
};

const stubSchema = buildProjectsSchema({ image: () => z.string() });

function omit(
  value: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const copy = { ...value };
  delete copy[key];
  return copy;
}

function expectExactError(action: () => unknown, message: string): void {
  let thrown: unknown;

  try {
    action();
  } catch (error) {
    thrown = error;
  }

  expect(thrown).toBeInstanceOf(Error);
  expect((thrown as Error).message).toBe(message);
}

describe('projects schema', () => {
  it('declares_collection_configuration', () => {
    const normalizedConfig = normalize(configSource);

    expect(normalizedConfig).toContain(
      "import { defineCollection } from 'astro:content';",
    );
    expect(normalizedConfig).toContain("import { glob } from 'astro/loaders';");
    expect(normalizedConfig).toContain(
      "import { buildProjectsSchema } from './content/projects-schema';",
    );
    expect(normalizedConfig).toContain(
      "loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),",
    );
    expect(normalizedConfig).toContain(
      'schema: ({ image }) => buildProjectsSchema({ image }),',
    );
    expect(normalizedConfig).toContain(
      'export const collections = { projects, technologies };',
    );
  });

  it('keeps_schema_module_free_of_astro_virtual_modules', () => {
    expect(schemaSource).toContain("import { z } from 'astro/zod';");
    expect(schemaSource).toContain(
      "import type { ImageMetadata } from 'astro';",
    );
    expect(schemaSource).not.toContain('astro:content');
    expect(schemaSource).not.toContain('astro:loaders');
    expect(schemaSource).not.toContain('astro:assets');

    expect(stubSchema.safeParse(validFrontmatter).success).toBe(true);
  });

  it('validates_project_frontmatter_contract', () => {
    expect(stubSchema.safeParse(validFrontmatter).success).toBe(true);
    expect(
      stubSchema.safeParse({
        ...validFrontmatter,
        githubUrl: 'https://github.com',
        featured: true,
      }).success,
    ).toBe(true);
    expect(
      stubSchema.safeParse({ ...validFrontmatter, featured: false }).success,
    ).toBe(true);

    const invalidFixtures: ReadonlyArray<
      readonly [label: string, fixture: Record<string, unknown>]
    > = [
      ['id is not a uuid', { ...validFrontmatter, id: 'not-a-uuid' }],
      ['id is missing', omit(validFrontmatter, 'id')],
      ['title is missing', omit(validFrontmatter, 'title')],
      ['title is not a string', { ...validFrontmatter, title: 42 }],
      ['description is missing', omit(validFrontmatter, 'description')],
      ['description is not a string', { ...validFrontmatter, description: 42 }],
      ['technologies is empty', { ...validFrontmatter, technologies: [] }],
      ['technologies is missing', omit(validFrontmatter, 'technologies')],
      ['coverPath is missing', omit(validFrontmatter, 'coverPath')],
      ['coverAlt is missing', omit(validFrontmatter, 'coverAlt')],
      [
        'websiteUrl is not a url',
        { ...validFrontmatter, websiteUrl: 'not-a-url' },
      ],
      ['websiteUrl is missing', omit(validFrontmatter, 'websiteUrl')],
      ['githubUrl is not a url', { ...validFrontmatter, githubUrl: 'nope' }],
      ['priority is a string', { ...validFrontmatter, priority: '1' }],
      ['priority is missing', omit(validFrontmatter, 'priority')],
      ['featured is a string', { ...validFrontmatter, featured: 'true' }],
    ];

    for (const [label, fixture] of invalidFixtures) {
      expect(stubSchema.safeParse(fixture).success, label).toBe(false);
    }
  });

  it('defaults_featured_to_false', () => {
    const parsed = stubSchema.parse(validFrontmatter);

    expect(parsed.featured).toBe(false);
  });

  it('sorts_projects_by_priority', () => {
    type FixtureProject = SortableProject & { title: string };

    const projects: FixtureProject[] = [
      {
        id: '00000000-0000-4000-8000-000000000003',
        priority: 3,
        title: 'Third',
      },
      {
        id: '00000000-0000-4000-8000-000000000001',
        priority: 1,
        title: 'First',
      },
      {
        id: '00000000-0000-4000-8000-000000000002',
        priority: 2,
        title: 'Second',
      },
    ];

    const ordered = sortProjects(projects);

    expect(ordered.map((project) => project.title)).toEqual([
      'First',
      'Second',
      'Third',
    ]);
    expect(projects.map((project) => project.title)).toEqual([
      'Third',
      'First',
      'Second',
    ]);
  });

  it('rejects_duplicate_priorities', () => {
    expectExactError(
      () =>
        sortProjects([
          { id: '00000000-0000-4000-8000-000000000001', priority: 1 },
          { id: '00000000-0000-4000-8000-000000000002', priority: 1 },
        ]),
      'Duplicate project priority: 1',
    );
  });

  it('rejects_duplicate_ids', () => {
    expectExactError(
      () =>
        sortProjects([
          {
            id: '6f9c1c1e-4a7b-4a3e-9d2f-1f5c8a2b7e10',
            priority: 1,
          },
          {
            id: '6f9c1c1e-4a7b-4a3e-9d2f-1f5c8a2b7e10',
            priority: 2,
          },
        ]),
      'Duplicate project id: 6f9c1c1e-4a7b-4a3e-9d2f-1f5c8a2b7e10',
    );
  });
});
