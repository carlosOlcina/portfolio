import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  technologiesSchema,
  TECHNOLOGY_CATEGORIES,
} from '../src/content/technologies-schema';

const technologiesRoot = new URL(
  '../src/content/technologies/',
  import.meta.url,
);
const iconsRoot = new URL('../public/icons/logos/', import.meta.url);

const MAX_ICON_BYTES = 32768;

interface Seed {
  file: string;
  id: string;
  category: string;
  name: string;
  iconUrl: string;
}

const SEEDS: Seed[] = [
  {
    file: 'css3.json',
    id: '6fa13057-c283-4fbe-9094-7142b35f86ac',
    category: 'Frontend',
    name: 'CSS3',
    iconUrl: '/icons/logos/css3.svg',
  },
  {
    file: 'framer.json',
    id: '4d8f1e35-a061-4d9c-be72-5f20913d648a',
    category: 'Frontend',
    name: 'Framer Motion',
    iconUrl: '/icons/logos/framer.svg',
  },
  {
    file: 'html5.json',
    id: '5e902f46-b172-4ead-af83-6031a24e759b',
    category: 'Frontend',
    name: 'HTML5',
    iconUrl: '/icons/logos/html5.svg',
  },
  {
    file: 'nextjs.json',
    id: '1a5c8b02-7d3e-4a69-8b4f-2c9d6e0a3157',
    category: 'Frontend',
    name: 'Next.js',
    iconUrl: '/icons/logos/nextjs.svg',
  },
  {
    file: 'react.json',
    id: '0e4b7a91-6c2d-4f58-9a3e-1b7c5d8f2046',
    category: 'Frontend',
    name: 'React',
    iconUrl: '/icons/logos/react.svg',
  },
  {
    file: 'tailwindcss.json',
    id: '3c7e0d24-9f50-4c8b-ad61-4e1f802c5379',
    category: 'Frontend',
    name: 'Tailwind CSS',
    iconUrl: '/icons/logos/tailwindcss.svg',
  },
  {
    file: 'typescript.json',
    id: '2b6d9c13-8e4f-4b7a-9c50-3d0e7f1b4268',
    category: 'Frontend',
    name: 'TypeScript',
    iconUrl: '/icons/logos/typescript.svg',
  },
  {
    file: 'docker.json',
    id: 'd618a7ce-39fa-4a25-a70b-e8b9cad0fd13',
    category: 'Backend y Nube',
    name: 'Docker',
    iconUrl: '/icons/logos/docker.svg',
  },
  {
    file: 'go.json',
    id: '81c35279-e4a5-4bd0-b2b6-9364d57ba8ce',
    category: 'Backend y Nube',
    name: 'Go',
    iconUrl: '/icons/logos/go.svg',
  },
  {
    file: 'nodejs.json',
    id: '70b24168-d394-4acf-b1a5-8253c46a97bd',
    category: 'Backend y Nube',
    name: 'Node.js',
    iconUrl: '/icons/logos/nodejs.svg',
  },
  {
    file: 'postgresql.json',
    id: 'b4f685ac-17d8-4e03-85e9-c697a8aedbf1',
    category: 'Backend y Nube',
    name: 'PostgreSQL',
    iconUrl: '/icons/logos/postgresql.svg',
  },
  {
    file: 'python.json',
    id: 'a3e5749b-06c7-4df2-b4d8-b586f79dcae0',
    category: 'Backend y Nube',
    name: 'Python',
    iconUrl: '/icons/logos/python.svg',
  },
  {
    file: 'redis.json',
    id: 'c50796bd-28e9-4f14-96fa-d7a8b9bfec02',
    category: 'Backend y Nube',
    name: 'Redis',
    iconUrl: '/icons/logos/redis.svg',
  },
  {
    file: 'rust.json',
    id: '92d4638a-f5b6-4ce1-a3c7-a475e68cb9df',
    category: 'Backend y Nube',
    name: 'Rust',
    iconUrl: '/icons/logos/rust.svg',
  },
  {
    file: 'vercel.json',
    id: 'e729b8df-4a0b-4b36-b81c-f9cadbe10e24',
    category: 'Backend y Nube',
    name: 'Vercel',
    iconUrl: '/icons/logos/vercel.svg',
  },
  {
    file: 'claude.json',
    id: 'f83ac9e0-5b1c-4c47-992d-0adbecf21f35',
    category: 'IA y Sistemas',
    name: 'Claude API',
    iconUrl: '/icons/logos/claude.svg',
  },
  {
    file: 'langchain.json',
    id: '1a5ceb02-7d3e-4e69-9b4f-2cfd0e143b57',
    category: 'IA y Sistemas',
    name: 'LangChain',
    iconUrl: '/icons/logos/langchain.svg',
  },
  {
    file: 'ollama.json',
    id: '2b6dfc13-8e4f-4f7a-ac50-3d0e1f254c68',
    category: 'IA y Sistemas',
    name: 'Ollama',
    iconUrl: '/icons/logos/ollama.svg',
  },
  {
    file: 'openai.json',
    id: '094bdaf1-6c2d-4d58-8a3e-1becfd032a46',
    category: 'IA y Sistemas',
    name: 'OpenAI',
    iconUrl: '/icons/logos/openai.svg',
  },
  {
    file: 'figma.json',
    id: '3c7e0d24-9f50-4a8b-bd61-4e1f20a65d79',
    category: 'Flujo de Trabajo y Diseño',
    name: 'Figma',
    iconUrl: '/icons/logos/figma.svg',
  },
  {
    file: 'git.json',
    id: '4d8f1e35-a061-4b9c-be72-5f2031b76e8a',
    category: 'Flujo de Trabajo y Diseño',
    name: 'Git',
    iconUrl: '/icons/logos/git.svg',
  },
  {
    file: 'github.json',
    id: '5e902f46-b172-4cad-bf83-603142c87f9b',
    category: 'Flujo de Trabajo y Diseño',
    name: 'GitHub',
    iconUrl: '/icons/logos/github.svg',
  },
  {
    file: 'linear.json',
    id: '6fa13057-c283-4dbe-b094-714253d980ac',
    category: 'Flujo de Trabajo y Diseño',
    name: 'Linear',
    iconUrl: '/icons/logos/linear.svg',
  },
  {
    file: 'postman.json',
    id: '92d4638a-f5b6-40e1-b3c7-a47586a2c3df',
    category: 'Flujo de Trabajo y Diseño',
    name: 'Postman',
    iconUrl: '/icons/logos/postman.svg',
  },
  {
    file: 'raycast.json',
    id: '81c35279-e4a5-4fd0-a2b6-936475f1b2ce',
    category: 'Flujo de Trabajo y Diseño',
    name: 'Raycast',
    iconUrl: '/icons/logos/raycast.svg',
  },
  {
    file: 'vscode.json',
    id: '70b24168-d394-4ecf-91a5-825364e0a1bd',
    category: 'Flujo de Trabajo y Diseño',
    name: 'VS Code',
    iconUrl: '/icons/logos/vscode.svg',
  },
];

const ICON_FILES = SEEDS.map((seed) =>
  seed.iconUrl.replace('/icons/logos/', ''),
);

function readSeed(file: string): Record<string, unknown> {
  return JSON.parse(
    readFileSync(new URL(file, technologiesRoot), 'utf8'),
  ) as Record<string, unknown>;
}

function listDirectory(
  root: URL,
  predicate: (entry: { name: string }) => boolean,
): string[] {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => !entry.isDirectory() && predicate(entry))
    .map((entry) => entry.name)
    .sort();
}

describe('technologies content', () => {
  it('defines_twenty_six_technology_entries', () => {
    const entryNames = listDirectory(technologiesRoot, (entry) =>
      entry.name.endsWith('.json'),
    );

    expect(entryNames).toEqual(SEEDS.map((seed) => seed.file).sort());
    expect(entryNames).toHaveLength(26);
  });

  it('matches_seed_values', () => {
    for (const seed of SEEDS) {
      const data = readSeed(seed.file);

      expect(data.id, seed.file).toBe(seed.id);
      expect(data.category, seed.file).toBe(seed.category);
      expect(data.name, seed.file).toBe(seed.name);
      expect(data.iconUrl, seed.file).toBe(seed.iconUrl);

      const parsed = technologiesSchema.safeParse(data);
      expect(parsed.success, `${seed.file} schema`).toBe(true);
    }
  });

  it('declares_exactly_four_fields', () => {
    for (const seed of SEEDS) {
      expect(Object.keys(readSeed(seed.file)).sort(), seed.file).toEqual([
        'category',
        'iconUrl',
        'id',
        'name',
      ]);
    }
  });

  it('covers_all_categories', () => {
    const categories = new Set(
      SEEDS.map((seed) => String(readSeed(seed.file).category)),
    );

    expect([...categories].sort()).toEqual([...TECHNOLOGY_CATEGORIES].sort());
  });

  it('keeps_ids_unique', () => {
    const ids = SEEDS.map((seed) => seed.id);

    expect(new Set(ids).size).toBe(26);

    for (const seed of SEEDS) {
      expect(
        technologiesSchema.shape.id.safeParse(seed.id).success,
        seed.file,
      ).toBe(true);
    }
  });

  it('provides_local_icon_files', () => {
    const iconNames = listDirectory(iconsRoot, (entry) =>
      entry.name.endsWith('.svg'),
    );

    expect(iconNames).toEqual([...ICON_FILES].sort());
    expect(iconNames).toHaveLength(26);

    for (const seed of SEEDS) {
      expect(iconNames, seed.file).toContain(
        seed.iconUrl.replace('/icons/logos/', ''),
      );
    }
  });

  it('declares_svg_icon_format', () => {
    for (const icon of ICON_FILES) {
      const content = readFileSync(new URL(icon, iconsRoot), 'utf8');

      expect(content, icon).toContain('<svg');
    }
  });

  it('keeps_icons_free_of_scripts', () => {
    for (const icon of ICON_FILES) {
      const content = readFileSync(new URL(icon, iconsRoot), 'utf8');

      expect(content, icon).not.toContain('<script');
    }
  });

  it('keeps_icons_within_weight_bound', () => {
    for (const icon of ICON_FILES) {
      const bytes = readFileSync(new URL(icon, iconsRoot), 'latin1').length;

      expect(bytes, icon).toBeGreaterThan(0);
      expect(bytes, icon).toBeLessThanOrEqual(MAX_ICON_BYTES);
    }
  });
});
