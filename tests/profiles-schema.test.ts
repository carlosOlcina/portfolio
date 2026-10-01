import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  assertUniqueProfiles,
  profilesSchema,
  sortProfiles,
  type ProfileData,
} from '../src/content/profiles-schema';

const sourceRoot = new URL('../src/', import.meta.url);
const contentConfigSource = readFileSync(
  new URL('content.config.ts', sourceRoot),
  'utf8',
);
const schemaSource = readFileSync(
  new URL('content/profiles-schema.ts', sourceRoot),
  'utf8',
);

const normalize = (value: string): string => value.replace(/\s+/g, ' ').trim();

let fixtureCounter = 0;

function createProfile(overrides: Partial<ProfileData> = {}): ProfileData {
  fixtureCounter += 1;

  return {
    id: `00000000-0000-4000-8000-${String(fixtureCounter).padStart(12, '0')}`,
    title: `Profile ${fixtureCounter}`,
    url: 'https://example.com',
    ...overrides,
  };
}

describe('profiles schema', () => {
  it('declares_collection_configuration', () => {
    const normalized = normalize(contentConfigSource);

    expect(normalized).toContain("import { glob } from 'astro/loaders';");
    expect(normalized).toContain(
      "import { profilesSchema } from './content/profiles-schema';",
    );
    expect(normalized).toContain('const profiles = defineCollection({');
    expect(normalized).toContain(
      "loader: glob({ base: './src/content/profiles', pattern: '**/*.json' }),",
    );
    expect(normalized).toContain('schema: profilesSchema,');
    expect(normalized).toContain(
      'export const collections = { projects, technologies, profiles };',
    );
  });

  it('keeps_schema_module_free_of_astro_virtual_modules', () => {
    expect(schemaSource).toContain("import { z } from 'astro/zod';");
    expect(schemaSource).not.toContain('astro:content');
    expect(schemaSource).not.toContain('astro:loaders');
    expect(schemaSource).not.toContain('astro:assets');

    const result = profilesSchema.safeParse(createProfile());

    expect(result.success).toBe(true);
  });

  it('validates_profile_contract', () => {
    const valid = {
      id: '3a7d1f52-9b4c-4e68-8f21-6c0d5a9e7b34',
      title: 'GitHub',
      url: 'https://github.com',
    };

    expect(profilesSchema.safeParse(valid).success).toBe(true);

    const rejectedFixtures: unknown[] = [
      { ...valid, id: 'not-a-uuid' },
      { title: valid.title, url: valid.url },
      { ...valid, title: 42 },
      { id: valid.id, url: valid.url },
      { ...valid, url: 'github.com' },
      { ...valid, url: '/profiles/github' },
      { ...valid, url: '' },
      { id: valid.id, title: valid.title },
      { ...valid, handle: '@github' },
    ];

    for (const fixture of rejectedFixtures) {
      expect(
        profilesSchema.safeParse(fixture).success,
        JSON.stringify(fixture),
      ).toBe(false);
    }
  });

  it('rejects_duplicate_ids', () => {
    const id = '3a7d1f52-9b4c-4e68-8f21-6c0d5a9e7b34';
    const profiles = [createProfile({ id }), createProfile({ id })];

    expect(() => assertUniqueProfiles(profiles)).toThrow(
      `Duplicate profile id: ${id}`,
    );
    expect(() => sortProfiles(profiles)).toThrow(`Duplicate profile id: ${id}`);
  });

  it('sorts_profiles_by_title', () => {
    const profiles = [
      createProfile({ title: 'X' }),
      createProfile({ title: 'LinkedIn' }),
      createProfile({ title: 'GitHub' }),
    ];

    expect(sortProfiles(profiles).map((profile) => profile.title)).toEqual([
      'GitHub',
      'LinkedIn',
      'X',
    ]);
  });

  it('does_not_mutate_profiles', () => {
    const profiles = [
      createProfile({ title: 'Zulu' }),
      createProfile({ title: 'Alpha' }),
    ];
    const snapshot = profiles.map((profile) => ({ ...profile }));

    const sorted = sortProfiles(profiles);

    expect(sorted).not.toBe(profiles);
    expect(profiles).toEqual(snapshot);
    expect(sorted.map((profile) => profile.title)).toEqual(['Alpha', 'Zulu']);
  });
});
