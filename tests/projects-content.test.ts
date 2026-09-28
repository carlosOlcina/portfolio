import { readFileSync, readdirSync } from 'node:fs';
import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { buildProjectsSchema } from '../src/content/projects-schema';

const projectsRoot = new URL('../src/content/projects/', import.meta.url);
const coversRoot = new URL('covers/', projectsRoot);
const packageJsonUrl = new URL('../package.json', import.meta.url);

const stubSchema = buildProjectsSchema({ image: () => z.string() });

const MAX_COVER_BYTES = 262144;

const COVER_FILES = [
  'synapse.webp',
  'aether-cloud.webp',
  'kortex-editor.webp',
  'vanguard-cli.webp',
] as const;

interface Seed {
  file: string;
  id: string;
  title: string;
  description: string;
  technologies: string[];
  coverPath: string;
  coverAlt: string;
  websiteUrl: string;
  githubUrl?: string;
  priority: string;
  featured?: string;
}

const SEEDS: Seed[] = [
  {
    file: 'synapse.md',
    id: '6f9c1c1e-4a7b-4a3e-9d2f-1f5c8a2b7e10',
    title: 'Synapse',
    description:
      'Copiloto IA para desarrolladores con análisis semántico de Git y AST en tiempo real.',
    technologies: [
      'Next.js',
      'TypeScript',
      'Tailwind',
      'Claude API',
      'Tree-sitter AST',
    ],
    coverPath: './covers/synapse.webp',
    coverAlt: 'Portada de Synapse: degradado índigo.',
    websiteUrl: 'https://example.com',
    githubUrl: 'https://github.com',
    priority: '1',
    featured: 'true',
  },
  {
    file: 'aether-cloud.md',
    id: '2b8f0d4a-9c31-4f6e-8a75-3d9e0b6c1a24',
    title: 'Aether Cloud',
    description:
      'Sincronización de estado en tiempo real en el edge con latencia global < 10ms.',
    technologies: ['Go', 'Rust', 'WebSockets', 'Redis'],
    coverPath: './covers/aether-cloud.webp',
    coverAlt: 'Portada de Aether Cloud: degradado azul.',
    websiteUrl: 'https://example.com',
    priority: '2',
  },
  {
    file: 'kortex-editor.md',
    id: 'c4a3e5b2-7d19-4b8c-a1f6-5e2d9087c431',
    title: 'Kortex Editor',
    description:
      'Editor colaborativo local-first impulsado por CRDTs y WebAssembly.',
    technologies: ['React', 'Wasm', 'CRDTs', 'Canvas'],
    coverPath: './covers/kortex-editor.webp',
    coverAlt: 'Portada de Kortex Editor: degradado violeta.',
    websiteUrl: 'https://example.com',
    githubUrl: 'https://github.com',
    priority: '3',
  },
  {
    file: 'vanguard-cli.md',
    id: '9d7b2e64-3c85-4a1f-b6e9-7f0c4a8d5b2e',
    title: 'Vanguard CLI',
    description:
      'Herramienta CLI para auditorías de código y análisis de PRs con embeddings locales.',
    technologies: ['Node.js', 'Rust CLI', 'Embeddings', 'Actions'],
    coverPath: './covers/vanguard-cli.webp',
    coverAlt: 'Portada de Vanguard CLI: degradado índigo claro.',
    websiteUrl: 'https://example.com',
    githubUrl: 'https://github.com',
    priority: '4',
  },
];

function readSeed(file: string): string {
  return readFileSync(new URL(file, projectsRoot), 'utf8');
}

function frontmatterOf(source: string): string {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(source);
  if (!match) {
    throw new Error('Missing frontmatter');
  }
  return match[1];
}

function bodyOf(source: string): string {
  const match = /^---\n[\s\S]*?\n---\n([\s\S]*)$/.exec(source);
  if (!match) {
    throw new Error('Missing body');
  }
  return match[1].trim();
}

function scalarValue(frontmatter: string, key: string): string | undefined {
  const match = new RegExp(`^${key}: ?(.*)$`, 'm').exec(frontmatter);
  if (!match) {
    return undefined;
  }
  return match[1].replace(/^'(.*)'$/, '$1');
}

function listValues(frontmatter: string, key: string): string[] {
  const match = new RegExp(`^${key}:\\n((?: {2}- .+\\n?)+)`, 'm').exec(
    frontmatter,
  );
  if (!match) {
    return [];
  }
  return match[1]
    .split('\n')
    .filter(Boolean)
    .map((line) => line.replace(/^\s*- /, ''));
}

describe('projects content', () => {
  it('defines_four_project_entries', () => {
    const entryNames = readdirSync(projectsRoot, { withFileTypes: true })
      .filter((entry) => !entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    expect(entryNames).toEqual([
      'aether-cloud.md',
      'kortex-editor.md',
      'synapse.md',
      'vanguard-cli.md',
    ]);
  });

  it('matches_seed_frontmatter', () => {
    for (const seed of SEEDS) {
      const frontmatter = frontmatterOf(readSeed(seed.file));

      expect(scalarValue(frontmatter, 'id'), seed.file).toBe(seed.id);
      expect(scalarValue(frontmatter, 'title'), seed.file).toBe(seed.title);
      expect(scalarValue(frontmatter, 'description'), seed.file).toBe(
        seed.description,
      );
      expect(
        listValues(frontmatter, 'technologies'),
        `${seed.file} technologies`,
      ).toEqual(seed.technologies);
      expect(scalarValue(frontmatter, 'coverPath'), seed.file).toBe(
        seed.coverPath,
      );
      expect(scalarValue(frontmatter, 'coverAlt'), seed.file).toBe(
        seed.coverAlt,
      );
      expect(scalarValue(frontmatter, 'websiteUrl'), seed.file).toBe(
        seed.websiteUrl,
      );
      expect(scalarValue(frontmatter, 'githubUrl'), seed.file).toBe(
        seed.githubUrl,
      );
      expect(scalarValue(frontmatter, 'priority'), seed.file).toBe(
        seed.priority,
      );
      expect(scalarValue(frontmatter, 'featured'), seed.file).toBe(
        seed.featured,
      );

      expect(
        stubSchema.shape.id.safeParse(seed.id).success,
        `${seed.file} id`,
      ).toBe(true);
      expect(
        stubSchema.shape.websiteUrl.safeParse(seed.websiteUrl).success,
        `${seed.file} websiteUrl`,
      ).toBe(true);
      expect(
        stubSchema.shape.priority.safeParse(Number(seed.priority)).success,
        `${seed.file} priority`,
      ).toBe(true);
      expect(
        stubSchema.shape.technologies.safeParse(seed.technologies).success,
        `${seed.file} technologies`,
      ).toBe(true);
      if (seed.githubUrl) {
        expect(
          stubSchema.shape.githubUrl.safeParse(seed.githubUrl).success,
          `${seed.file} githubUrl`,
        ).toBe(true);
      }
    }
  });

  it('omits_github_url_for_aether_cloud', () => {
    const frontmatter = frontmatterOf(readSeed('aether-cloud.md'));

    expect(frontmatter).not.toContain('githubUrl');
  });

  it('includes_seed_bodies', () => {
    for (const seed of SEEDS) {
      expect(bodyOf(readSeed(seed.file)), seed.file).not.toBe('');
    }
  });

  it('provides_raster_cover_files', () => {
    const coverNames = readdirSync(coversRoot, { withFileTypes: true })
      .filter((entry) => !entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    expect(coverNames).toEqual([...COVER_FILES].sort());

    for (const seed of SEEDS) {
      const coverFile = seed.coverPath.replace('./covers/', '');
      expect(coverNames, `${seed.file} cover`).toContain(coverFile);
    }
  });

  it('declares_cover_webp_format', () => {
    for (const cover of COVER_FILES) {
      const binary = readFileSync(new URL(cover, coversRoot), 'latin1');

      expect(binary.slice(0, 4), cover).toBe('RIFF');
      expect(binary.slice(8, 12), cover).toBe('WEBP');
    }
  });

  it('keeps_covers_within_weight_bound', () => {
    for (const cover of COVER_FILES) {
      const binary = readFileSync(new URL(cover, coversRoot), 'latin1');

      expect(binary.length, cover).toBeGreaterThan(0);
      expect(binary.length, cover).toBeLessThanOrEqual(MAX_COVER_BYTES);
    }
  });

  it('declares_image_service_dependency', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonUrl, 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(typeof packageJson.dependencies?.sharp).toBe('string');
    expect(packageJson.dependencies?.sharp).not.toBe('');
    expect(packageJson.devDependencies?.sharp).toBeUndefined();
  });
});
