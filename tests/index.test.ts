import { readFileSync, readdirSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it, vi } from 'vitest';

vi.mock('astro:content', async () => {
  const { default: cover } =
    await import('../src/content/projects/covers/synapse.webp');

  const createEntry = (id: string, data: Record<string, unknown>) => ({
    id,
    data: { coverPath: cover, ...data },
  });

  return {
    getCollection: async () => [
      createEntry('synapse', {
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
        coverAlt: 'Portada de Synapse: degradado índigo.',
        websiteUrl: 'https://example.com',
        githubUrl: 'https://github.com',
        priority: 1,
        featured: true,
      }),
      createEntry('aether-cloud', {
        id: '2b8f0d4a-9c31-4f6e-8a75-3d9e0b6c1a24',
        title: 'Aether Cloud',
        description:
          'Sincronización de estado en tiempo real en el edge con latencia global < 10ms.',
        technologies: ['Go', 'Rust', 'WebSockets', 'Redis'],
        coverAlt: 'Portada de Aether Cloud: degradado azul.',
        websiteUrl: 'https://example.com',
        priority: 2,
      }),
      createEntry('kortex-editor', {
        id: 'c4a3e5b2-7d19-4b8c-a1f6-5e2d9087c431',
        title: 'Kortex Editor',
        description:
          'Editor colaborativo local-first impulsado por CRDTs y WebAssembly.',
        technologies: ['React', 'Wasm', 'CRDTs', 'Canvas'],
        coverAlt: 'Portada de Kortex Editor: degradado violeta.',
        websiteUrl: 'https://example.com',
        githubUrl: 'https://github.com',
        priority: 3,
      }),
      createEntry('vanguard-cli', {
        id: '9d7b2e64-3c85-4a1f-b6e9-7f0c4a8d5b2e',
        title: 'Vanguard CLI',
        description:
          'Herramienta CLI para auditorías de código y análisis de PRs con embeddings locales.',
        technologies: ['Node.js', 'Rust CLI', 'Embeddings', 'Actions'],
        coverAlt: 'Portada de Vanguard CLI: degradado índigo claro.',
        websiteUrl: 'https://example.com',
        githubUrl: 'https://github.com',
        priority: 4,
      }),
    ],
  };
});

import Index from '../src/pages/index.astro';

type Declaration = readonly [property: string, value: string];

const sourceRoot = new URL('../src/', import.meta.url);
const baseLayoutSource = readFileSync(
  new URL('layouts/BaseLayout.astro', sourceRoot),
  'utf8',
);
const heroSource = readFileSync(
  new URL('components/HeroSection.astro', sourceRoot),
  'utf8',
);

const normalize = (value: string): string => value.replace(/\s+/g, ' ').trim();
const canonical = (value: string): string =>
  value
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),])\s*/g, '$1')
    .trim();

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function extractRule(source: string, selector: string): string {
  const pattern = new RegExp(
    `(?:^|[}\\s])${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`,
  );
  const match = pattern.exec(normalize(source));
  if (!match) {
    throw new Error(`Rule not found: ${selector}`);
  }
  return match[0];
}

function extractResponsiveRule(
  source: string,
  selector: string,
  breakpoint: number,
): string {
  const normalized = normalize(source);
  const selectorIndex = normalized.indexOf(selector);
  const mediaMarker = `@media (min-width: ${breakpoint}px)`;
  const mediaIndex = normalized.indexOf(mediaMarker, selectorIndex);
  if (selectorIndex === -1 || mediaIndex === -1) {
    throw new Error(`Responsive rule not found: ${selector} at ${mediaMarker}`);
  }
  return normalized.slice(
    mediaIndex,
    normalized.indexOf('}', mediaIndex + mediaMarker.length) + 1,
  );
}

function expectDeclarations(
  block: string,
  declarations: ReadonlyArray<Declaration>,
): void {
  const canonicalBlock = canonical(block);
  for (const [property, value] of declarations) {
    expect(canonicalBlock, `expected ${property}: ${value}`).toContain(
      canonical(`${property}: ${value};`),
    );
  }
}

function collectSourceFiles(directory: URL): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryUrl = new URL(entry.name, directory);
    return entry.isDirectory()
      ? collectSourceFiles(new URL(`${entry.name}/`, directory))
      : [entryUrl];
  });
}

async function renderPage(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Index, { partial: false });
}

describe('index page', () => {
  it('renders_spanish_document_shell', async () => {
    const html = await renderPage();

    expect(html).toContain('<html lang="es"');
    expect(html).toContain('<meta charset="utf-8"');
    expect(html).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1"',
    );
    expect(html).toMatch(/<meta name="generator" content="Astro v/);
    expect(html).toContain(
      '<title>Carlos Olcina | Ingeniero Full-Stack y Arquitecto de Software IA</title>',
    );
    expect(html).toMatch(
      /<meta name="description" content="Ingeniero Full-Stack (?:&amp;|&#38;) Arquitecto de Software IA\. Desarrollo web de alto rendimiento con React, Next\.js y TypeScript\."/,
    );
    expect(html).toContain(
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg"',
    );
    expect(html).toContain('<link rel="icon" href="/favicon.ico"');
  });

  it('renders_page_shell_geometry', async () => {
    const html = await renderPage();
    const mainIndex = html.indexOf('<main class="site-main"');

    expect(mainIndex).toBeGreaterThan(-1);
    expect(html.indexOf('class="site-container"', mainIndex)).toBeGreaterThan(
      mainIndex,
    );
    expect(html.indexOf('id="overview"', mainIndex)).toBeGreaterThan(mainIndex);

    expectDeclarations(extractRule(baseLayoutSource, '.site-main'), [
      ['width', '100%'],
      ['padding-top', '4rem'],
      ['position', 'relative'],
      ['z-index', '10'],
    ]);

    expectDeclarations(extractRule(baseLayoutSource, '.site-container'), [
      ['max-width', '72rem'],
      ['margin-inline', 'auto'],
      ['padding-inline', '1.5rem'],
      ['position', 'relative'],
      ['z-index', '10'],
    ]);

    const responsive = canonical(
      extractResponsiveRule(baseLayoutSource, '.site-container', 1024),
    );
    expect(responsive).toContain(canonical('padding-inline: 3rem;'));
  });

  it('ships_only_clipboard_enhancement', async () => {
    const pageSources = [
      'pages/index.astro',
      'layouts/BaseLayout.astro',
      'components/HeroSection.astro',
      'components/ProjectsSection.astro',
      'components/ProjectCard.astro',
    ].map((relativePath) =>
      readFileSync(new URL(relativePath, sourceRoot), 'utf8'),
    );
    const scriptTags = pageSources.flatMap(
      (content) => content.match(/<script\b[^>]*>/g) ?? [],
    );

    expect(scriptTags).toHaveLength(1);
    expect(scriptTags[0]).not.toContain('is:inline');
    expect(heroSource).toContain(
      "import { copyToClipboard, showToast } from '../scripts/clipboard';",
    );

    for (const fileUrl of collectSourceFiles(sourceRoot)) {
      const content = readFileSync(fileUrl, 'utf8');
      expect(
        content,
        `${fileUrl.pathname} must not hydrate an island`,
      ).not.toContain('client:');
      expect(
        content,
        `${fileUrl.pathname} must not use inline event handlers`,
      ).not.toMatch(/\son[a-z]+\s*=/);
    }

    const html = await renderPage();

    expect(html.match(/<script\b/g) ?? []).toHaveLength(1);
    expect(html).toMatch(
      /<script type="module" src="[^"]*HeroSection\.astro\?astro&type=script/,
    );
    expect(html).not.toContain('astro-island');
    expect(html).not.toMatch(/<script[^>]+src="https?:/);
    expect(html).not.toMatch(/\son[a-z]+\s*=/);
  });

  it('renders_atmospheric_blooms_layer', async () => {
    const normalizedHtml = normalize(await renderPage());

    expect(normalizedHtml).toContain('<div class="blooms"');
    expect(
      normalizedHtml.match(/class="blooms__blob blooms__blob--/g),
    ).toHaveLength(3);
    expect(normalizedHtml).toContain('blooms__blob blooms__blob--top-left');
    expect(normalizedHtml).toContain('blooms__blob blooms__blob--right');
    expect(normalizedHtml).toContain('blooms__blob blooms__blob--bottom-left');

    expectDeclarations(extractRule(baseLayoutSource, '.blooms'), [
      ['position', 'fixed'],
      ['inset', '0'],
      ['width', '100%'],
      ['height', '100%'],
      ['z-index', '-10'],
      ['pointer-events', 'none'],
      ['overflow', 'hidden'],
      ['opacity', '0.6'],
    ]);

    expectDeclarations(extractRule(baseLayoutSource, '.blooms__blob'), [
      ['position', 'absolute'],
      ['border-radius', 'var(--radius-full)'],
    ]);

    expectDeclarations(
      extractRule(baseLayoutSource, '.blooms__blob--top-left'),
      [
        ['top', '-15%'],
        ['left', '-10%'],
        ['width', '55vw'],
        ['height', '55vw'],
        [
          'background',
          'linear-gradient(to bottom right, rgba(129, 140, 248, 0.2), rgba(216, 180, 254, 0.15), transparent)',
        ],
        ['filter', 'blur(130px)'],
      ],
    );

    expectDeclarations(extractRule(baseLayoutSource, '.blooms__blob--right'), [
      ['top', '35%'],
      ['right', '-12%'],
      ['width', '50vw'],
      ['height', '50vw'],
      [
        'background',
        'linear-gradient(to bottom left, rgba(103, 232, 249, 0.2), rgba(96, 165, 250, 0.15), transparent)',
      ],
      ['filter', 'blur(140px)'],
    ]);

    expectDeclarations(
      extractRule(baseLayoutSource, '.blooms__blob--bottom-left'),
      [
        ['bottom', '-8%'],
        ['left', '12%'],
        ['width', '60vw'],
        ['height', '45vw'],
        [
          'background',
          'linear-gradient(to top right, rgba(196, 181, 253, 0.2), rgba(199, 210, 254, 0.2), rgba(251, 207, 232, 0.15))',
        ],
        ['filter', 'blur(150px)'],
      ],
    );
  });

  it('renders_exactly_one_h1', async () => {
    const html = await renderPage();

    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });
});
