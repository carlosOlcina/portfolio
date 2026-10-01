import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { profilesSchema } from '../src/content/profiles-schema';

const profilesRoot = new URL('../src/content/profiles/', import.meta.url);

interface ExpectedSeed {
  readonly fileName: string;
  readonly id: string;
  readonly title: string;
  readonly url: string;
}

const EXPECTED_SEEDS: readonly ExpectedSeed[] = [
  {
    fileName: 'github.json',
    id: '3a7d1f52-9b4c-4e68-8f21-6c0d5a9e7b34',
    title: 'GitHub',
    url: 'https://github.com',
  },
  {
    fileName: 'linkedin.json',
    id: '7c2e8a41-5d6f-4b93-a0e8-2f4c9d1b6a05',
    title: 'LinkedIn',
    url: 'https://linkedin.com',
  },
  {
    fileName: 'x.json',
    id: 'b5f0c3d8-2a71-4c9e-9d36-8e7a1b4f2c90',
    title: 'X',
    url: 'https://x.com',
  },
];

function readSeed(fileName: string): unknown {
  return JSON.parse(readFileSync(new URL(fileName, profilesRoot), 'utf8'));
}

function expectRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Seed entry must be a JSON object');
  }
  return value as Record<string, unknown>;
}

describe('profiles content', () => {
  it('defines_three_profile_entries', () => {
    const fileNames = readdirSync(profilesRoot, { withFileTypes: true })
      .map((entry) => entry.name)
      .sort();

    expect(fileNames).toEqual(['github.json', 'linkedin.json', 'x.json']);
  });

  it('matches_seed_values', () => {
    for (const seed of EXPECTED_SEEDS) {
      const data = readSeed(seed.fileName);
      const result = profilesSchema.safeParse(data);

      expect(result.success, seed.fileName).toBe(true);
      if (!result.success) {
        continue;
      }
      expect(result.data.id, seed.fileName).toBe(seed.id);
      expect(result.data.title, seed.fileName).toBe(seed.title);
      expect(result.data.url, seed.fileName).toBe(seed.url);
    }
  });

  it('declares_exactly_three_fields', () => {
    for (const seed of EXPECTED_SEEDS) {
      const data = expectRecord(readSeed(seed.fileName));

      expect(Object.keys(data).sort(), seed.fileName).toEqual([
        'id',
        'title',
        'url',
      ]);
    }
  });

  it('keeps_ids_unique', () => {
    const ids = EXPECTED_SEEDS.map((seed) => {
      const result = profilesSchema.safeParse(readSeed(seed.fileName));

      expect(result.success, seed.fileName).toBe(true);
      return result.success ? result.data.id : '';
    });

    expect(new Set(ids).size).toBe(3);
    for (const id of ids) {
      expect(profilesSchema.shape.id.safeParse(id).success, id).toBe(true);
    }
  });
});
