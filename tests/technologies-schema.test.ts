import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  assertUniqueTechnologies,
  groupTechnologies,
  technologiesSchema,
  TECHNOLOGY_CATEGORIES,
  type TechnologyData,
} from '../src/content/technologies-schema';

const sourceRoot = new URL('../src/', import.meta.url);
const configSource = readFileSync(
  new URL('content.config.ts', sourceRoot),
  'utf8',
);
const schemaSource = readFileSync(
  new URL('content/technologies-schema.ts', sourceRoot),
  'utf8',
);

const normalize = (value: string): string => value.replace(/\s+/g, ' ').trim();

const validTechnology: Record<string, unknown> = {
  id: '0e4b7a91-6c2d-4f58-9a3e-1b7c5d8f2046',
  category: 'Frontend',
  iconUrl: '/icons/logos/react.svg',
  name: 'React',
};

let fixtureCounter = 0;

function createTechnology(
  overrides: Partial<TechnologyData> = {},
): TechnologyData {
  fixtureCounter += 1;

  return {
    id: `00000000-0000-4000-8000-${String(fixtureCounter).padStart(12, '0')}`,
    category: 'Frontend',
    iconUrl: '/icons/logos/react.svg',
    name: `Technology ${fixtureCounter}`,
    ...overrides,
  };
}

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

describe('technologies schema', () => {
  it('declares_collection_configuration', () => {
    const normalizedConfig = normalize(configSource);

    expect(normalizedConfig).toContain(
      "import { defineCollection } from 'astro:content';",
    );
    expect(normalizedConfig).toContain("import { glob } from 'astro/loaders';");
    expect(normalizedConfig).toContain(
      "import { technologiesSchema } from './content/technologies-schema';",
    );
    expect(normalizedConfig).toContain(
      "loader: glob({ base: './src/content/technologies', pattern: '**/*.json' }),",
    );
    expect(normalizedConfig).toContain('schema: technologiesSchema,');
    expect(normalizedConfig).toContain(
      'export const collections = { projects, technologies };',
    );
  });

  it('keeps_schema_module_free_of_astro_virtual_modules', () => {
    expect(schemaSource).toContain("import { z } from 'astro/zod';");
    expect(schemaSource).not.toContain('astro:content');
    expect(schemaSource).not.toContain('astro:loaders');
    expect(schemaSource).not.toContain('astro:assets');

    expect(technologiesSchema.safeParse(validTechnology).success).toBe(true);
  });

  it('validates_technology_contract', () => {
    expect(technologiesSchema.safeParse(validTechnology).success).toBe(true);

    const invalidFixtures: ReadonlyArray<
      readonly [label: string, fixture: Record<string, unknown>]
    > = [
      ['id is not a uuid', { ...validTechnology, id: 'not-a-uuid' }],
      ['id is missing', omit(validTechnology, 'id')],
      ['category is lowercase', { ...validTechnology, category: 'frontend' }],
      ['category is unknown', { ...validTechnology, category: 'Back-end' }],
      ['category is missing', omit(validTechnology, 'category')],
      [
        'iconUrl is remote',
        { ...validTechnology, iconUrl: 'https://svgl.app/library/react.svg' },
      ],
      [
        'iconUrl is not svg',
        { ...validTechnology, iconUrl: '/icons/logos/react.png' },
      ],
      [
        'iconUrl has uppercase segment',
        { ...validTechnology, iconUrl: '/icons/logos/React.svg' },
      ],
      [
        'iconUrl lacks the leading slash',
        { ...validTechnology, iconUrl: 'icons/logos/react.svg' },
      ],
      ['iconUrl is missing', omit(validTechnology, 'iconUrl')],
      ['name is missing', omit(validTechnology, 'name')],
      ['name is a number', { ...validTechnology, name: 42 }],
      ['unknown key is rejected', { ...validTechnology, tags: ['ui'] }],
    ];

    for (const [label, fixture] of invalidFixtures) {
      expect(technologiesSchema.safeParse(fixture).success, label).toBe(false);
    }
  });

  it('pins_category_order_constant', () => {
    expect(TECHNOLOGY_CATEGORIES).toEqual([
      'Frontend',
      'Backend y Nube',
      'IA y Sistemas',
      'Flujo de Trabajo y Diseño',
    ]);

    expect(
      technologiesSchema.safeParse({ ...validTechnology, category: 'Mobile' })
        .success,
    ).toBe(false);
  });

  it('rejects_duplicate_ids', () => {
    const id = '0e4b7a91-6c2d-4f58-9a3e-1b7c5d8f2046';
    const technologies = [createTechnology({ id }), createTechnology({ id })];

    expectExactError(
      () => assertUniqueTechnologies(technologies),
      `Duplicate technology id: ${id}`,
    );
    expectExactError(
      () => groupTechnologies(technologies),
      `Duplicate technology id: ${id}`,
    );
  });

  it('groups_technologies_in_fixed_category_order', () => {
    const groups = groupTechnologies([
      createTechnology({
        category: 'Flujo de Trabajo y Diseño',
        name: 'Figma',
      }),
      createTechnology({ category: 'Backend y Nube', name: 'Docker' }),
      createTechnology({ category: 'Frontend', name: 'React' }),
      createTechnology({ category: 'IA y Sistemas', name: 'OpenAI' }),
      createTechnology({ category: 'Frontend', name: 'CSS3' }),
    ]);

    expect(groups.map((group) => group.category)).toEqual([
      'Frontend',
      'Backend y Nube',
      'IA y Sistemas',
      'Flujo de Trabajo y Diseño',
    ]);

    const partialGroups = groupTechnologies([
      createTechnology({ category: 'IA y Sistemas', name: 'OpenAI' }),
      createTechnology({ category: 'Frontend', name: 'React' }),
    ]);

    expect(partialGroups.map((group) => group.category)).toEqual([
      'Frontend',
      'IA y Sistemas',
    ]);
  });

  it('does_not_mutate_technologies', () => {
    const technologies = [
      createTechnology({ name: 'TypeScript' }),
      createTechnology({ name: 'CSS3' }),
      createTechnology({ name: 'React' }),
    ];
    const before = technologies.map((technology) => technology.name);

    const groups = groupTechnologies(technologies);

    expect(technologies.map((technology) => technology.name)).toEqual(before);
    expect(groups[0].items).not.toBe(technologies);

    groups[0].items.reverse();

    expect(technologies.map((technology) => technology.name)).toEqual(before);
  });

  it('sorts_technologies_alphabetically_within_category', () => {
    const groups = groupTechnologies([
      createTechnology({ name: 'TypeScript' }),
      createTechnology({ name: 'CSS3' }),
      createTechnology({ name: 'alpha' }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].items.map((technology) => technology.name)).toEqual([
      'CSS3',
      'TypeScript',
      'alpha',
    ]);
  });
});
