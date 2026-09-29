import { readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it, vi } from 'vitest';
import ProjectCard from '../src/components/ProjectCard.astro';
import ProjectsSection from '../src/components/ProjectsSection.astro';
import type { ProjectData } from '../src/content/projects-schema';
import synapseCover from '../src/content/projects/covers/synapse.webp';

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
const sectionSource = readFileSync(
  new URL('components/ProjectsSection.astro', sourceRoot),
  'utf8',
);
const cardSource = readFileSync(
  new URL('components/ProjectCard.astro', sourceRoot),
  'utf8',
);
const tokensSource = readFileSync(
  new URL('styles/tokens.css', sourceRoot),
  'utf8',
);
const indexSource = readFileSync(
  new URL('pages/index.astro', sourceRoot),
  'utf8',
);

let fixtureCounter = 0;

function createProject(overrides: Partial<ProjectData> = {}): ProjectData {
  fixtureCounter += 1;

  return {
    id: `00000000-0000-4000-8000-${String(fixtureCounter).padStart(12, '0')}`,
    title: `Project ${fixtureCounter}`,
    description: 'Descripción de prueba para la tarjeta.',
    technologies: ['TypeScript'],
    coverPath: synapseCover,
    coverAlt: 'Portada de prueba.',
    websiteUrl: 'https://example.com',
    githubUrl: 'https://github.com',
    priority: fixtureCounter,
    featured: false,
    ...overrides,
  };
}

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

function extractMediaBlock(source: string, breakpoint: number): string {
  const normalized = normalize(source);
  const marker = `@media (min-width: ${breakpoint}px)`;
  const markerIndex = normalized.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Media query not found: ${marker}`);
  }

  const openIndex = normalized.indexOf('{', markerIndex);
  let depth = 0;

  for (let index = openIndex; index < normalized.length; index += 1) {
    if (normalized[index] === '{') {
      depth += 1;
    } else if (normalized[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        return normalized.slice(openIndex + 1, index);
      }
    }
  }

  throw new Error(`Unbalanced media query: ${marker}`);
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

async function renderSection(projects: ProjectData[]): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(ProjectsSection, { props: { projects } });
}

async function renderCard(project: ProjectData): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(ProjectCard, { props: { project } });
}

async function renderFeaturedCard(project: ProjectData): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(ProjectCard, {
    props: { project, featured: true },
  });
}

async function renderPage(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Index, { partial: false });
}

describe('projects section', () => {
  it('validates_projects_at_render_time', async () => {
    expect(normalize(sectionSource)).toContain(
      'const orderedProjects = sortProjects(projects);',
    );

    const projects = [
      createProject({ title: 'Alpha', priority: 1 }),
      createProject({ title: 'Beta', priority: 1 }),
    ];

    await expect(renderSection(projects)).rejects.toThrow(
      'Duplicate project priority: 1',
    );
  });

  it('exposes_slate_600_token', () => {
    expect(tokensSource).toContain('--color-slate-600: #475569');
    expect(tokensSource.match(/--color-slate-600:/g) ?? []).toHaveLength(1);
  });

  it('renders_projects_section_after_hero', async () => {
    const html = normalize(await renderPage());
    const mainIndex = html.indexOf('<main class="site-main"');
    const heroIndex = html.indexOf('id="overview"');
    const sectionIndex = html.indexOf(
      'class="projects animate-fade-in-up animation-delay-100"',
    );

    expect(mainIndex).toBeGreaterThan(-1);
    expect(heroIndex).toBeGreaterThan(mainIndex);
    expect(sectionIndex).toBeGreaterThan(heroIndex);
    expect(html).toContain('id="projects"');

    expectDeclarations(extractRule(sectionSource, '.projects'), [
      ['scroll-margin-top', '6rem'],
    ]);
  });

  it('styles_section_geometry', () => {
    expectDeclarations(extractRule(sectionSource, '.projects'), [
      ['padding-block', '6rem'],
      ['border-bottom', '1px solid rgba(199, 210, 254, 0.35)'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.projects__inner'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['gap', '3.5rem'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.projects__cards'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['gap', '2rem'],
    ]);
  });

  it('reuses_global_entry_animation', () => {
    expect(normalize(sectionSource)).toContain(
      'class="projects animate-fade-in-up animation-delay-100"',
    );
    expect(sectionSource).not.toContain('@keyframes');
    expect(cardSource).not.toContain('@keyframes');
  });

  it('renders_section_header', async () => {
    const html = normalize(await renderSection([createProject()]));

    expect(html).toContain('Proyectos Seleccionados');
    expect(html).toContain('class="projects__label-rule"');
    expect(html).toContain(
      'Proyectos con <span class="projects__title-accent"',
    );
    expect(html).toContain('>visión</span>');
    expect(html).toContain(
      'Software escalable, arquitecturas cloud y soluciones de IA en producción.',
    );
    expect(html.match(/<h2\b/g)).toHaveLength(1);
  });

  it('styles_section_label', () => {
    expectDeclarations(extractRule(sectionSource, '.projects__label'), [
      ['font-family', 'var(--font-body)'],
      ['font-size', 'var(--text-label-sm-size)'],
      ['line-height', 'var(--text-label-sm-line-height)'],
      ['font-weight', '500'],
      ['letter-spacing', '0.18em'],
      ['text-transform', 'uppercase'],
      ['color', 'var(--color-primary)'],
    ]);
  });

  it('styles_section_label_rule', () => {
    expectDeclarations(extractRule(sectionSource, '.projects__label-rule'), [
      ['display', 'block'],
      ['height', '1px'],
      ['width', '3rem'],
      ['background-color', 'rgba(53, 37, 205, 0.4)'],
    ]);
  });

  it('styles_section_title', () => {
    expectDeclarations(extractRule(sectionSource, '.projects__title'), [
      ['font-family', 'var(--font-headline)'],
      ['font-size', 'var(--text-headline-lg-size)'],
      ['line-height', 'var(--text-headline-lg-line-height)'],
      ['font-weight', 'var(--text-headline-lg-weight)'],
      ['letter-spacing', '-0.025em'],
      ['color', 'var(--color-slate-900)'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.projects__title-accent'), [
      ['font-family', 'var(--font-headline)'],
      ['font-style', 'italic'],
      ['font-weight', '400'],
      ['color', 'var(--color-primary)'],
    ]);
  });

  it('styles_section_subtitle', () => {
    expectDeclarations(extractRule(sectionSource, '.projects__subtitle'), [
      ['font-family', 'var(--font-body)'],
      ['font-weight', '300'],
      ['font-size', 'var(--text-body-md-size)'],
      ['line-height', '1.625'],
      ['letter-spacing', 'var(--text-body-md-letter-spacing)'],
      ['color', 'var(--color-slate-600)'],
      ['max-width', '28rem'],
    ]);
  });

  it('styles_section_header_geometry', () => {
    expectDeclarations(extractRule(sectionSource, '.projects__header'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['justify-content', 'space-between'],
      ['gap', '1.5rem'],
    ]);

    const headerRow = canonical(
      extractResponsiveRule(sectionSource, '.projects__header', 768),
    );
    expect(headerRow).toContain(canonical('flex-direction: row;'));
    expect(headerRow).toContain(canonical('align-items: flex-end;'));

    expectDeclarations(extractRule(sectionSource, '.projects__heading'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['gap', '0.75rem'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.projects__eyebrow'), [
      ['display', 'flex'],
      ['align-items', 'center'],
      ['gap', '0.75rem'],
    ]);
  });

  it('renders_featured_card_and_ordered_grid', async () => {
    const html = normalize(
      await renderSection([
        createProject({ title: 'Gamma', priority: 3 }),
        createProject({ title: 'Bravo', priority: 2 }),
        createProject({ title: 'Alpha', priority: 1, featured: true }),
        createProject({ title: 'Delta', priority: 4 }),
      ]),
    );

    const featuredIndex = html.indexOf('project-card--featured');
    const gridIndex = html.indexOf('projects__grid');

    expect(featuredIndex).toBeGreaterThan(-1);
    expect(gridIndex).toBeGreaterThan(featuredIndex);
    expect(html.indexOf('>Alpha</h3>')).toBeLessThan(gridIndex);

    let previousIndex = gridIndex;
    for (const title of ['Bravo', 'Gamma', 'Delta']) {
      const titleIndex = html.indexOf(`>${title}</h3>`);
      expect(titleIndex, `${title} inside the grid`).toBeGreaterThan(
        previousIndex,
      );
      previousIndex = titleIndex;
    }

    expect(html.match(/<article\b/g)).toHaveLength(4);
  });

  it('styles_featured_card', () => {
    expectDeclarations(extractRule(cardSource, '.project-card--featured'), [
      ['display', 'grid'],
      ['grid-template-columns', 'minmax(0, 1fr)'],
      ['gap', '2rem'],
      ['align-items', 'center'],
      ['padding', '1.75rem'],
      ['border-radius', 'var(--radius-2xl)'],
      ['background-color', 'rgba(255, 255, 255, 0.45)'],
      ['backdrop-filter', 'blur(24px)'],
      ['-webkit-backdrop-filter', 'blur(24px)'],
      ['border', '1px solid rgba(255, 255, 255, 0.7)'],
      [
        'box-shadow',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      ],
    ]);

    const featuredPadding = canonical(
      extractResponsiveRule(cardSource, '.project-card--featured', 768),
    );
    expect(featuredPadding).toContain(canonical('padding: 2rem;'));

    const featuredGrid = canonical(
      extractResponsiveRule(cardSource, '.project-card--featured', 1024),
    );
    expect(featuredGrid).toContain(
      canonical('grid-template-columns: repeat(12, minmax(0, 1fr));'),
    );

    expectDeclarations(
      extractRule(cardSource, '.project-card--featured .project-card__meta'),
      [['grid-column', '1 / span 6']],
    );

    expectDeclarations(
      extractRule(cardSource, '.project-card--featured .project-card__cover'),
      [['grid-column', '7 / span 6']],
    );
  });

  it('pins_featured_card_halves_to_one_row', () => {
    const featuredGrid = extractMediaBlock(cardSource, 1024);

    expectDeclarations(
      extractRule(featuredGrid, '.project-card--featured .project-card__meta'),
      [
        ['grid-column', '1 / span 6'],
        ['grid-row', '1'],
      ],
    );

    expectDeclarations(
      extractRule(featuredGrid, '.project-card--featured .project-card__cover'),
      [
        ['grid-column', '7 / span 6'],
        ['grid-row', '1'],
      ],
    );
  });

  it('stacks_featured_card_below_1024', async () => {
    const featuredGrid = extractMediaBlock(cardSource, 1024);
    const outsideMedia = normalize(cardSource).replace(featuredGrid, '');

    expect(outsideMedia).not.toContain('grid-row');
    expect(outsideMedia).not.toContain('grid-column');

    const html = normalize(await renderFeaturedCard(createProject()));
    expect(html.indexOf('project-card__cover')).toBeLessThan(
      html.indexOf('project-card__meta'),
    );
  });

  it('styles_standard_card', () => {
    expectDeclarations(extractRule(cardSource, '.project-card'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['justify-content', 'space-between'],
      ['gap', '1.25rem'],
      ['padding', '1.5rem'],
      ['border-radius', 'var(--radius-2xl)'],
      ['background-color', 'rgba(255, 255, 255, 0.4)'],
      ['backdrop-filter', 'blur(16px)'],
      ['-webkit-backdrop-filter', 'blur(16px)'],
      ['border', '1px solid rgba(255, 255, 255, 0.6)'],
      [
        'box-shadow',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      ],
      ['cursor', 'default'],
    ]);
  });

  it('styles_projects_grid', () => {
    expectDeclarations(extractRule(sectionSource, '.projects__grid'), [
      ['display', 'grid'],
      ['gap', '1.5rem'],
      ['grid-template-columns', 'minmax(0, 1fr)'],
    ]);

    const twoColumns = canonical(
      extractResponsiveRule(sectionSource, '.projects__grid', 768),
    );
    expect(twoColumns).toContain(
      canonical('grid-template-columns: repeat(2, minmax(0, 1fr));'),
    );

    const threeColumns = canonical(
      extractResponsiveRule(sectionSource, '.projects__grid', 1024),
    );
    expect(threeColumns).toContain(
      canonical('grid-template-columns: repeat(3, minmax(0, 1fr));'),
    );
  });

  it('styles_card_hover', () => {
    expectDeclarations(extractRule(cardSource, '.project-card'), [
      ['transition', 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'],
    ]);

    expectDeclarations(extractRule(cardSource, '.project-card:hover'), [
      ['background-color', 'rgba(255, 255, 255, 0.62)'],
      ['border-color', 'rgba(129, 140, 248, 0.55)'],
      [
        'box-shadow',
        '0 20px 42px -8px rgba(79, 70, 229, 0.14), 0 0 24px -2px rgba(99, 102, 241, 0.16)',
      ],
      ['transform', 'translateY(-3px)'],
    ]);
  });

  it('renders_project_card_covers', async () => {
    const project = createProject({
      title: 'Synapse',
      description: 'Copiloto IA para desarrolladores.',
      coverAlt: 'Portada de Synapse: degradado índigo.',
    });

    const html = await renderCard(project);
    const image = /<img\b[^>]*>/.exec(html)?.[0] ?? '';

    expect(image).toContain('alt="Portada de Synapse: degradado índigo."');
    expect(image).toContain('width="640"');
    expect(image).toContain('height="400"');
    expect(image).toContain('loading="lazy"');
    expect(image).toContain('class="project-card__image"');
    expect(image).toMatch(/\ssrc="[^"]+"/);

    const normalizedHtml = normalize(html);
    expect(normalizedHtml).toContain('<h3 class="project-card__title"');
    expect(normalizedHtml).toContain('>Synapse</h3>');
    expect(normalizedHtml).toContain('<p class="project-card__description"');
    expect(normalizedHtml).toContain('>Copiloto IA para desarrolladores.</p>');
  });

  it('styles_card_covers', () => {
    expectDeclarations(extractRule(cardSource, '.project-card__cover'), [
      ['width', '100%'],
      ['aspect-ratio', '16 / 10'],
      ['border-radius', 'var(--radius-xl)'],
      ['overflow', 'hidden'],
    ]);

    expectDeclarations(
      extractRule(cardSource, ':global(.project-card__image)'),
      [
        ['display', 'block'],
        ['width', '100%'],
        ['height', '100%'],
        ['object-fit', 'cover'],
      ],
    );
  });

  it('styles_card_titles', () => {
    expectDeclarations(extractRule(cardSource, '.project-card__title'), [
      ['font-family', 'var(--font-headline)'],
      ['font-size', 'var(--text-headline-sm-size)'],
      ['line-height', 'var(--text-headline-sm-line-height)'],
      ['letter-spacing', 'var(--text-headline-sm-letter-spacing)'],
      ['font-weight', 'var(--text-headline-sm-weight)'],
      ['color', 'var(--color-slate-900)'],
    ]);

    expectDeclarations(
      extractRule(cardSource, '.project-card--featured .project-card__title'),
      [
        ['font-family', 'var(--font-headline)'],
        ['font-size', 'var(--text-headline-md-size)'],
        ['line-height', 'var(--text-headline-md-line-height)'],
        ['letter-spacing', 'var(--text-headline-md-letter-spacing)'],
        ['font-weight', 'var(--text-headline-md-weight)'],
      ],
    );
  });

  it('styles_card_descriptions', () => {
    expectDeclarations(extractRule(cardSource, '.project-card__description'), [
      ['font-family', 'var(--font-body)'],
      ['font-weight', '300'],
      ['font-size', 'var(--text-body-md-size)'],
      ['line-height', '1.625'],
      ['letter-spacing', 'var(--text-body-md-letter-spacing)'],
      ['color', 'var(--color-slate-600)'],
    ]);
  });

  it('renders_technology_pills', async () => {
    const technologies = ['Next.js', 'TypeScript', 'Claude API'];
    const html = normalize(await renderCard(createProject({ technologies })));

    const listMatch =
      /<ul class="project-card__technologies"[^>]*>([\s\S]*?)<\/ul>/.exec(html);
    expect(listMatch).not.toBeNull();

    const items =
      listMatch?.[1].match(
        /<li class="project-card__technology"[^>]*>([\s\S]*?)<\/li>/g,
      ) ?? [];

    expect(items).toHaveLength(technologies.length);
    expect(items.map((item) => />(.*?)<\/li>/.exec(item)?.[1] ?? '')).toEqual(
      technologies,
    );
  });

  it('styles_technology_pills', () => {
    expectDeclarations(extractRule(cardSource, '.project-card__technologies'), [
      ['display', 'flex'],
      ['flex-wrap', 'wrap'],
      ['align-items', 'center'],
      ['gap', '0.375rem'],
      ['margin-top', '1rem'],
      ['padding-top', '1rem'],
      ['border-top', '1px solid rgba(226, 232, 240, 0.5)'],
      ['list-style', 'none'],
    ]);

    expectDeclarations(
      extractRule(
        cardSource,
        '.project-card--featured .project-card__technologies',
      ),
      [
        ['gap', '0.5rem'],
        ['padding-top', '1.25rem'],
      ],
    );

    expectDeclarations(extractRule(cardSource, '.project-card__technology'), [
      ['font-family', 'var(--font-body)'],
      ['font-size', 'var(--text-label-sm-size)'],
      ['line-height', 'var(--text-label-sm-line-height)'],
      ['font-weight', 'var(--text-label-sm-weight)'],
      ['letter-spacing', 'var(--text-label-sm-letter-spacing)'],
      ['padding', '0.125rem 0.625rem'],
      ['border-radius', 'var(--radius-full)'],
      ['background-color', 'rgba(255, 255, 255, 0.6)'],
      ['border', '1px solid rgba(255, 255, 255, 0.8)'],
      ['color', 'var(--color-slate-700)'],
    ]);

    expectDeclarations(
      extractRule(
        cardSource,
        '.project-card--featured .project-card__technology',
      ),
      [['padding', '0.25rem 0.75rem']],
    );
  });

  it('renders_website_links', async () => {
    const html = normalize(
      await renderCard(
        createProject({
          title: 'Synapse',
          websiteUrl: 'https://example.com',
        }),
      ),
    );
    const links =
      /<div class="project-card__links"[^>]*>([\s\S]*?)<\/div>/.exec(
        html,
      )?.[1] ?? '';

    expect(links).toContain('href="https://example.com"');
    expect(links).toContain('aria-label="Visitar el sitio web de Synapse"');
  });

  it('renders_github_link_when_present', async () => {
    const html = normalize(
      await renderCard(createProject({ githubUrl: 'https://github.com' })),
    );
    const links =
      /<div class="project-card__links"[^>]*>([\s\S]*?)<\/div>/.exec(
        html,
      )?.[1] ?? '';

    expect(links).toContain('href="https://github.com"');
    expect(links.match(/<a\b/g)).toHaveLength(2);
  });

  it('omits_github_link_when_absent', async () => {
    const html = normalize(
      await renderCard(createProject({ githubUrl: undefined })),
    );
    const links =
      /<div class="project-card__links"[^>]*>([\s\S]*?)<\/div>/.exec(
        html,
      )?.[1] ?? '';

    expect(links.match(/<a\b/g)).toHaveLength(1);
    expect(links).not.toContain('github.com');
  });

  it('marks_external_links_with_accessible_names', async () => {
    const html = normalize(
      await renderCard(
        createProject({
          title: 'Synapse',
          websiteUrl: 'https://example.com',
          githubUrl: 'https://github.com',
        }),
      ),
    );

    expect(html).toContain('aria-label="Visitar el sitio web de Synapse"');
    expect(html).toContain(
      'aria-label="Ver el código fuente de Synapse en GitHub"',
    );
    expect(html.match(/target="_blank"/g)).toHaveLength(2);
    expect(html.match(/rel="noopener noreferrer"/g)).toHaveLength(2);
  });

  it('renders_link_icons', async () => {
    const html = await renderCard(createProject());
    const svgs = html.match(/<svg\b[^>]*>/g) ?? [];

    expect(svgs).toHaveLength(2);
    for (const svg of svgs) {
      expect(svg).toContain('viewBox="0 -960 960 960"');
      expect(svg).toContain('width="18"');
      expect(svg).toContain('height="18"');
      expect(svg).toContain('fill="currentColor"');
      expect(svg).toContain('aria-hidden="true"');
    }

    expect(html).toContain(
      'd="m256-240-56-56 384-384H240v-80h480v480h-80v-344L256-240Z"',
    );
    expect(html).toContain(
      'd="M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z"',
    );
    expect(html).not.toContain('material-symbols');
  });

  it('ships_no_client_javascript', () => {
    for (const source of [sectionSource, cardSource, indexSource]) {
      expect(source).not.toContain('<script');
      expect(source).not.toContain('client:');
      expect(source).not.toMatch(/\son[a-z]+\s*=/);
    }
  });

  it('renders_single_h2', async () => {
    const html = await renderSection([
      createProject({ featured: true }),
      createProject(),
    ]);

    expect(html.match(/<h2\b/g)).toHaveLength(1);
    expect(html.match(/<h1\b/g)).toBeNull();
  });

  it('loads_project_collection_in_index', async () => {
    const normalizedIndexSource = normalize(indexSource);

    expect(normalizedIndexSource).toContain(
      "import { getCollection } from 'astro:content';",
    );
    expect(normalizedIndexSource).toContain(
      "const projectEntries = await getCollection('projects');",
    );
    expect(normalizedIndexSource).toContain(
      'const projects = projectEntries.map((entry) => entry.data);',
    );
    expect(normalizedIndexSource).toContain(
      '<ProjectsSection projects={projects} />',
    );
    expect(normalizedIndexSource.indexOf('<ProjectsSection')).toBeGreaterThan(
      normalizedIndexSource.indexOf('<HeroSection />'),
    );

    const html = normalize(await renderPage());

    for (const title of [
      'Synapse',
      'Aether Cloud',
      'Kortex Editor',
      'Vanguard CLI',
    ]) {
      expect(html).toContain(`>${title}</h3>`);
    }
  });
});
