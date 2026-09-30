import { readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it, vi } from 'vitest';
import TechnologiesSection from '../src/components/TechnologiesSection.astro';
import {
  TECHNOLOGY_CATEGORIES,
  type TechnologyCategory,
  type TechnologyData,
} from '../src/content/technologies-schema';

vi.mock('astro:content', () => {
  const technologyEntries = [
    {
      id: 'react',
      data: {
        id: '0e4b7a91-6c2d-4f58-9a3e-1b7c5d8f2046',
        category: 'Frontend',
        iconUrl: '/icons/logos/react.svg',
        name: 'React',
      },
    },
    {
      id: 'docker',
      data: {
        id: 'd618a7ce-39fa-4a25-a70b-e8b9cad0fd13',
        category: 'Backend y Nube',
        iconUrl: '/icons/logos/docker.svg',
        name: 'Docker',
      },
    },
    {
      id: 'openai',
      data: {
        id: '094bdaf1-6c2d-4d58-8a3e-1becfd032a46',
        category: 'IA y Sistemas',
        iconUrl: '/icons/logos/openai.svg',
        name: 'OpenAI',
      },
    },
    {
      id: 'figma',
      data: {
        id: '3c7e0d24-9f50-4a8b-bd61-4e1f20a65d79',
        category: 'Flujo de Trabajo y Diseño',
        iconUrl: '/icons/logos/figma.svg',
        name: 'Figma',
      },
    },
  ];

  return {
    getCollection: async (collection: string) =>
      collection === 'technologies' ? technologyEntries : [],
  };
});

import Index from '../src/pages/index.astro';

type Declaration = readonly [property: string, value: string];

const sourceRoot = new URL('../src/', import.meta.url);
const sectionSource = readFileSync(
  new URL('components/TechnologiesSection.astro', sourceRoot),
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

const CATEGORY_ICON_PATHS: Record<TechnologyCategory, string> = {
  Frontend:
    'M480-118 120-398l66-50 294 228 294-228 66 50-360 280Zm0-202L120-600l360-280 360 280-360 280Zm0-280Zm0 178 230-178-230-178-230 178 230 178Z',
  'Backend y Nube':
    'M300-720q-25 0-42.5 17.5T240-660q0 25 17.5 42.5T300-600q25 0 42.5-17.5T360-660q0-25-17.5-42.5T300-720Zm0 400q-25 0-42.5 17.5T240-260q0 25 17.5 42.5T300-200q25 0 42.5-17.5T360-260q0-25-17.5-42.5T300-320ZM160-840h640q17 0 28.5 11.5T840-800v280q0 17-11.5 28.5T800-480H160q-17 0-28.5-11.5T120-520v-280q0-17 11.5-28.5T160-840Zm40 80v200h560v-200H200Zm-40 320h640q17 0 28.5 11.5T840-400v280q0 17-11.5 28.5T800-80H160q-17 0-28.5-11.5T120-120v-280q0-17 11.5-28.5T160-440Zm40 80v200h560v-200H200Zm0-400v200-200Zm0 400v200-200Z',
  'IA y Sistemas':
    'M390-120q-51 0-88-35.5T260-241q-60-8-100-53t-40-106q0-21 5.5-41.5T142-480q-11-18-16.5-38t-5.5-42q0-61 40-105.5t99-52.5q3-51 41-86.5t90-35.5q26 0 48.5 10t41.5 27q18-17 41-27t49-10q52 0 89.5 35t40.5 86q59 8 99.5 53T840-560q0 22-5.5 42T818-480q11 18 16.5 38.5T840-400q0 62-40.5 106.5T699-241q-5 50-41.5 85.5T570-120q-25 0-48.5-9.5T480-156q-19 17-42 26.5t-48 9.5Zm130-590v460q0 21 14.5 35.5T570-200q20 0 34.5-16t15.5-36q-21-8-38.5-21.5T550-306q-10-14-7.5-30t16.5-26q14-10 30-7.5t26 16.5q11 16 28 24.5t37 8.5q33 0 56.5-23.5T760-400q0-5-.5-10t-2.5-10q-17 10-36.5 15t-40.5 5q-17 0-28.5-11.5T640-440q0-17 11.5-28.5T680-480q33 0 56.5-23.5T760-560q0-33-23.5-56T680-640q-11 18-28.5 31.5T613-587q-16 6-31-1t-20-23q-5-16 1.5-31t22.5-20q15-5 24.5-18t9.5-30q0-21-14.5-35.5T570-760q-21 0-35.5 14.5T520-710Zm-80 460v-460q0-21-14.5-35.5T390-760q-21 0-35.5 14.5T340-710q0 16 9 29.5t24 18.5q16 5 23 20t2 31q-6 16-21 23t-31 1q-21-8-38.5-21.5T279-640q-32 1-55.5 24.5T200-560q0 33 23.5 56.5T280-480q17 0 28.5 11.5T320-440q0 17-11.5 28.5T280-400q-21 0-40.5-5T203-420q-2 5-2.5 10t-.5 10q0 33 23.5 56.5T280-320q20 0 37-8.5t28-24.5q10-14 26-16.5t30 7.5q14 10 16.5 26t-7.5 30q-14 19-32 33t-39 22q1 20 16 35.5t35 15.5q21 0 35.5-14.5T440-250Zm40-230Z',
  'Flujo de Trabajo y Diseño':
    'M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H160v400Zm140-40-56-56 103-104-104-104 57-56 160 160-160 160Zm180 0v-80h240v80H480Z',
};

const QUOTE_ICON_PATH =
  'm438-338 226-226-57-57-169 169-84-84-57 57 141 141Zm42 258q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z';

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

async function renderSection(technologies: TechnologyData[]): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(TechnologiesSection, {
    props: { technologies },
  });
}

async function renderPage(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Index, { partial: false });
}

describe('technologies section', () => {
  it('validates_technologies_at_render_time', async () => {
    expect(normalize(sectionSource)).toContain(
      'const groups = groupTechnologies(technologies);',
    );

    const id = '0e4b7a91-6c2d-4f58-9a3e-1b7c5d8f2046';
    const duplicate = createTechnology({ id });

    await expect(renderSection([duplicate, duplicate])).rejects.toThrow(
      `Duplicate technology id: ${id}`,
    );
  });

  it('exposes_font_mono_token', () => {
    expect(normalize(tokensSource)).toContain(
      "--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;",
    );
    expect(tokensSource.match(/--font-mono:/g) ?? []).toHaveLength(1);
  });

  it('renders_tech_stack_section_after_projects', async () => {
    const html = normalize(await renderPage());
    const projectsIndex = html.indexOf('id="projects"');
    const techStackIndex = html.indexOf('id="tech-stack"');

    expect(projectsIndex).toBeGreaterThan(-1);
    expect(techStackIndex).toBeGreaterThan(projectsIndex);
    expect(html).toContain(
      'class="tech-stack animate-fade-in-up animation-delay-200"',
    );

    expectDeclarations(extractRule(sectionSource, '.tech-stack'), [
      ['scroll-margin-top', '6rem'],
    ]);
  });

  it('styles_section_geometry', () => {
    expectDeclarations(extractRule(sectionSource, '.tech-stack'), [
      ['padding-block', '6rem'],
      ['border-bottom', '1px solid rgba(199, 210, 254, 0.35)'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.tech-stack__inner'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['gap', '3rem'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.tech-stack__grid'), [
      ['display', 'grid'],
      ['gap', '1.5rem'],
      ['grid-template-columns', 'minmax(0, 1fr)'],
    ]);

    const twoColumns = canonical(
      extractResponsiveRule(sectionSource, '.tech-stack__grid', 768),
    );
    expect(twoColumns).toContain(
      canonical('grid-template-columns: repeat(2, minmax(0, 1fr));'),
    );

    const fourColumns = canonical(
      extractResponsiveRule(sectionSource, '.tech-stack__grid', 1024),
    );
    expect(fourColumns).toContain(
      canonical('grid-template-columns: repeat(4, minmax(0, 1fr));'),
    );
  });

  it('reuses_global_entry_animation', () => {
    expect(normalize(sectionSource)).toContain(
      'class="tech-stack animate-fade-in-up animation-delay-200"',
    );
    expect(sectionSource).not.toContain('@keyframes');
  });

  it('renders_section_header', async () => {
    const html = normalize(await renderSection([createTechnology()]));

    expect(html).toContain('Stack Tecnológico');
    expect(html).toContain('class="tech-stack__label-rule"');
    expect(html).toContain(
      'Tecnologías y herramientas <span class="tech-stack__title-accent"',
    );
    expect(html).toContain('>clave</span>');
    expect(html).toContain(
      'Stack moderno optimizado para velocidad, mantenibilidad y escalabilidad.',
    );
    expect(html.match(/<h2\b/g)).toHaveLength(1);
  });

  it('styles_section_label', () => {
    expectDeclarations(extractRule(sectionSource, '.tech-stack__label'), [
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
    expectDeclarations(extractRule(sectionSource, '.tech-stack__label-rule'), [
      ['display', 'block'],
      ['height', '1px'],
      ['width', '3rem'],
      ['background-color', 'rgba(53, 37, 205, 0.4)'],
    ]);
  });

  it('styles_section_title', () => {
    expectDeclarations(extractRule(sectionSource, '.tech-stack__title'), [
      ['font-family', 'var(--font-headline)'],
      ['font-size', 'var(--text-headline-lg-size)'],
      ['line-height', 'var(--text-headline-lg-line-height)'],
      ['font-weight', 'var(--text-headline-lg-weight)'],
      ['letter-spacing', '-0.025em'],
      ['color', 'var(--color-slate-900)'],
    ]);

    expectDeclarations(
      extractRule(sectionSource, '.tech-stack__title-accent'),
      [
        ['font-family', 'var(--font-headline)'],
        ['font-style', 'italic'],
        ['font-weight', '300'],
        ['color', 'var(--color-primary)'],
      ],
    );
  });

  it('styles_section_subtitle', () => {
    expectDeclarations(extractRule(sectionSource, '.tech-stack__subtitle'), [
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
    expectDeclarations(extractRule(sectionSource, '.tech-stack__header'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['justify-content', 'space-between'],
      ['gap', '1.5rem'],
    ]);

    const headerRow = canonical(
      extractResponsiveRule(sectionSource, '.tech-stack__header', 768),
    );
    expect(headerRow).toContain(canonical('flex-direction: row;'));
    expect(headerRow).toContain(canonical('align-items: flex-end;'));

    expectDeclarations(extractRule(sectionSource, '.tech-stack__heading'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['gap', '0.75rem'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.tech-stack__eyebrow'), [
      ['display', 'flex'],
      ['align-items', 'center'],
      ['gap', '0.75rem'],
    ]);
  });

  it('renders_category_cards_in_fixed_order', async () => {
    const titlePattern = (category: string): RegExp =>
      new RegExp(
        `class="tech-stack__category-title"[^>]*>${escapeRegExp(category)}</h3>`,
      );

    const html = normalize(
      await renderSection([
        createTechnology({
          category: 'Flujo de Trabajo y Diseño',
          name: 'Figma',
        }),
        createTechnology({ category: 'Backend y Nube', name: 'Docker' }),
        createTechnology({ category: 'Frontend', name: 'TypeScript' }),
        createTechnology({ category: 'Frontend', name: 'CSS3' }),
        createTechnology({ category: 'IA y Sistemas', name: 'OpenAI' }),
      ]),
    );

    expect(html.match(/class="tech-stack__category"/g)).toHaveLength(4);

    let previousIndex = -1;
    for (const category of TECHNOLOGY_CATEGORIES) {
      const categoryIndex = titlePattern(category).exec(html)?.index ?? -1;
      expect(categoryIndex, category).toBeGreaterThan(previousIndex);
      previousIndex = categoryIndex;
    }

    expect(html.indexOf('alt="CSS3"')).toBeLessThan(
      html.indexOf('alt="TypeScript"'),
    );

    const partialHtml = normalize(
      await renderSection([
        createTechnology({ category: 'Frontend', name: 'React' }),
      ]),
    );

    expect(partialHtml.match(/class="tech-stack__category"/g)).toHaveLength(1);
    expect(titlePattern('Backend y Nube').test(partialHtml)).toBe(false);
    expect(titlePattern('IA y Sistemas').test(partialHtml)).toBe(false);
    expect(titlePattern('Flujo de Trabajo y Diseño').test(partialHtml)).toBe(
      false,
    );
  });

  it('styles_category_cards', () => {
    expectDeclarations(extractRule(sectionSource, '.tech-stack__category'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['gap', '1.25rem'],
      ['padding', '1.5rem'],
      ['border-radius', 'var(--radius-2xl)'],
      ['background-color', 'rgba(255, 255, 255, 0.4)'],
      ['-webkit-backdrop-filter', 'blur(16px)'],
      ['backdrop-filter', 'blur(16px)'],
      ['border', '1px solid rgba(255, 255, 255, 0.6)'],
      ['transition', 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'],
    ]);
  });

  it('styles_category_hover', () => {
    expectDeclarations(
      extractRule(sectionSource, '.tech-stack__category:hover'),
      [
        ['background-color', 'rgba(255, 255, 255, 0.62)'],
        ['border-color', 'rgba(129, 140, 248, 0.55)'],
        [
          'box-shadow',
          '0 20px 42px -8px rgba(79, 70, 229, 0.14), 0 0 24px -2px rgba(99, 102, 241, 0.16)',
        ],
        ['transform', 'translateY(-3px)'],
      ],
    );
  });

  it('styles_category_headers', () => {
    expectDeclarations(
      extractRule(sectionSource, '.tech-stack__category-header'),
      [
        ['display', 'flex'],
        ['align-items', 'center'],
        ['gap', '0.625rem'],
        ['color', 'var(--color-slate-900)'],
      ],
    );

    expectDeclarations(
      extractRule(sectionSource, '.tech-stack__category-title'),
      [
        ['font-family', 'var(--font-headline)'],
        ['font-size', 'var(--text-headline-sm-size)'],
        ['line-height', 'var(--text-headline-sm-line-height)'],
        ['letter-spacing', 'var(--text-headline-sm-letter-spacing)'],
        ['font-weight', 'var(--text-headline-sm-weight)'],
      ],
    );

    expectDeclarations(
      extractRule(sectionSource, '.tech-stack__category-icon'),
      [
        ['width', '22px'],
        ['height', '22px'],
        ['flex-shrink', '0'],
        ['color', 'var(--color-primary)'],
      ],
    );
  });

  it('renders_category_icons', async () => {
    for (const category of TECHNOLOGY_CATEGORIES) {
      const html = await renderSection([
        createTechnology({ category, name: `${category} fixture` }),
      ]);
      const svg =
        /<svg class="tech-stack__category-icon"[^>]*>[\s\S]*?<\/svg>/.exec(
          html,
        )?.[0] ?? '';

      expect(svg, category).toContain('aria-hidden="true"');
      expect(svg, category).toContain('viewBox="0 -960 960 960"');
      expect(svg, category).toContain('width="22"');
      expect(svg, category).toContain('height="22"');
      expect(svg, category).toContain('fill="currentColor"');
      expect(svg, category).toContain(`d="${CATEGORY_ICON_PATHS[category]}"`);
    }

    const html = await renderSection([createTechnology()]);
    expect(html).not.toContain('material-symbols');
  });

  it('styles_technology_items', () => {
    expectDeclarations(extractRule(sectionSource, '.tech-stack__items'), [
      ['display', 'flex'],
      ['flex-wrap', 'wrap'],
      ['gap', '0.5rem'],
      ['margin', '0'],
      ['padding', '0'],
      ['list-style', 'none'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.tech-stack__item'), [
      ['display', 'inline-flex'],
      ['align-items', 'center'],
      ['justify-content', 'center'],
      ['width', '2.5rem'],
      ['height', '2.5rem'],
      ['border-radius', 'var(--radius-xl)'],
      ['background-color', 'rgba(255, 255, 255, 0.6)'],
      ['-webkit-backdrop-filter', 'blur(12px)'],
      ['backdrop-filter', 'blur(12px)'],
      ['border', '1px solid rgba(255, 255, 255, 0.8)'],
      ['color', 'var(--color-slate-800)'],
      ['cursor', 'default'],
      ['transition', 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.tech-stack__icon'), [
      ['display', 'block'],
      ['width', '20px'],
      ['height', '20px'],
      ['flex-shrink', '0'],
      ['object-fit', 'contain'],
    ]);
  });

  it('styles_technology_item_hover', () => {
    expectDeclarations(extractRule(sectionSource, '.tech-stack__item:hover'), [
      ['border-color', 'rgba(53, 37, 205, 0.5)'],
      ['background-color', 'rgba(255, 255, 255, 0.9)'],
      ['transform', 'scale(1.1)'],
      ['box-shadow', '0 1px 2px 0 rgba(0, 0, 0, 0.05)'],
    ]);
  });

  it('renders_technology_icons', async () => {
    const html = normalize(
      await renderSection([
        createTechnology({ name: 'CSS3', iconUrl: '/icons/logos/css3.svg' }),
        createTechnology({ name: 'React', iconUrl: '/icons/logos/react.svg' }),
      ]),
    );
    const listMatch =
      /<ul class="tech-stack__items"[^>]*>([\s\S]*?)<\/ul>/.exec(html);

    expect(listMatch).not.toBeNull();

    const items =
      listMatch?.[1].match(
        /<li class="tech-stack__item"[^>]*>[\s\S]*?<\/li>/g,
      ) ?? [];

    expect(items).toHaveLength(2);

    const [css3, react] = items;
    expect(css3).toContain('title="CSS3"');
    expect(css3).toContain('src="/icons/logos/css3.svg"');
    expect(css3).toContain('alt="CSS3"');
    expect(react).toContain('title="React"');
    expect(react).toContain('src="/icons/logos/react.svg"');
    expect(react).toContain('alt="React"');

    for (const item of items) {
      expect(item).toContain('class="tech-stack__icon"');
      expect(item).toContain('width="20"');
      expect(item).toContain('height="20"');
      expect(item).toContain('loading="lazy"');
    }
  });

  it('renders_quote_bar', async () => {
    const html = normalize(await renderSection([createTechnology()]));

    expect(html).toContain('class="tech-stack__quote-main"');
    expect(html).toContain('class="tech-stack__quote-text"');
    expect(html).toContain(
      '“Código limpio, arquitectura escalable y rendimiento sin fricción.”',
    );
    expect(html).toContain('class="tech-stack__badge"');
    expect(html).toMatch(
      /class="tech-stack__badge"[^>]*>Filosofía Técnica<\/span>/,
    );
  });

  it('styles_quote_bar', () => {
    expectDeclarations(extractRule(sectionSource, '.tech-stack__quote'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['align-items', 'flex-start'],
      ['justify-content', 'space-between'],
      ['gap', '1rem'],
      ['padding', '1.5rem'],
      ['border-radius', 'var(--radius-2xl)'],
      ['background-color', 'rgba(99, 102, 241, 0.1)'],
      ['-webkit-backdrop-filter', 'blur(12px)'],
      ['backdrop-filter', 'blur(12px)'],
      ['border', '1px solid rgba(199, 210, 254, 0.5)'],
      ['box-shadow', '0 8px 30px rgba(79, 70, 229, 0.05)'],
      ['transition', 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'],
    ]);

    const quoteRow = canonical(
      extractRule(extractMediaBlock(sectionSource, 640), '.tech-stack__quote'),
    );
    expect(quoteRow).toContain(canonical('flex-direction: row;'));
    expect(quoteRow).toContain(canonical('align-items: center;'));

    expectDeclarations(extractRule(sectionSource, '.tech-stack__quote:hover'), [
      ['border-color', 'rgba(165, 180, 252, 0.8)'],
      ['box-shadow', '0 12px 36px rgba(79, 70, 229, 0.08)'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.tech-stack__quote-main'), [
      ['display', 'flex'],
      ['align-items', 'center'],
      ['gap', '0.875rem'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.tech-stack__quote-icon'), [
      ['width', '24px'],
      ['height', '24px'],
      ['flex-shrink', '0'],
      ['color', 'var(--color-primary)'],
    ]);
  });

  it('styles_quote_text', () => {
    expectDeclarations(extractRule(sectionSource, '.tech-stack__quote-text'), [
      ['font-family', 'var(--font-headline)'],
      ['font-size', 'var(--text-headline-sm-size)'],
      ['line-height', 'var(--text-headline-sm-line-height)'],
      ['letter-spacing', 'var(--text-headline-sm-letter-spacing)'],
      ['font-weight', 'var(--text-headline-sm-weight)'],
      ['font-style', 'italic'],
      ['color', 'var(--color-primary)'],
    ]);
  });

  it('renders_quote_icon', async () => {
    const html = await renderSection([createTechnology()]);
    const svg =
      /<svg class="tech-stack__quote-icon"[^>]*>[\s\S]*?<\/svg>/.exec(
        html,
      )?.[0] ?? '';

    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain('viewBox="0 -960 960 960"');
    expect(svg).toContain('width="24"');
    expect(svg).toContain('height="24"');
    expect(svg).toContain('fill="currentColor"');
    expect(svg).toContain(`d="${QUOTE_ICON_PATH}"`);
  });

  it('styles_quote_badge', () => {
    expectDeclarations(extractRule(sectionSource, '.tech-stack__badge'), [
      ['font-family', 'var(--font-mono)'],
      ['font-size', 'var(--text-label-sm-size)'],
      ['line-height', 'var(--text-label-sm-line-height)'],
      ['font-weight', 'var(--text-label-sm-weight)'],
      ['letter-spacing', '0.16em'],
      ['text-transform', 'uppercase'],
      ['white-space', 'nowrap'],
      ['color', 'var(--color-primary)'],
      ['background-color', 'rgba(53, 37, 205, 0.1)'],
      ['border', '1px solid rgba(53, 37, 205, 0.25)'],
      ['padding', '0.375rem 0.875rem'],
      ['border-radius', 'var(--radius-full)'],
      ['-webkit-backdrop-filter', 'blur(12px)'],
      ['backdrop-filter', 'blur(12px)'],
    ]);
  });

  it('ships_no_client_javascript', () => {
    for (const source of [sectionSource, indexSource]) {
      expect(source).not.toContain('<script');
      expect(source).not.toContain('client:');
      expect(source).not.toMatch(/\son[a-z]+\s*=/);
    }
  });

  it('renders_single_h2', async () => {
    const html = normalize(
      await renderSection(
        TECHNOLOGY_CATEGORIES.map((category) => createTechnology({ category })),
      ),
    );

    expect(html.match(/<h2\b/g)).toHaveLength(1);
    expect(html.match(/<h1\b/g)).toBeNull();
    expect(html.match(/<h3\b/g)).toHaveLength(4);
  });

  it('loads_technology_collection_in_index', async () => {
    const normalizedIndexSource = normalize(indexSource);

    expect(normalizedIndexSource).toContain(
      "const technologyEntries = await getCollection('technologies');",
    );
    expect(normalizedIndexSource).toContain(
      'const technologies = technologyEntries.map((entry) => entry.data);',
    );
    expect(normalizedIndexSource).toContain(
      '<TechnologiesSection technologies={technologies} />',
    );
    expect(normalizedIndexSource.indexOf('<ProjectsSection')).toBeLessThan(
      normalizedIndexSource.indexOf('<TechnologiesSection'),
    );

    const html = normalize(await renderPage());

    expect(html).toContain('id="tech-stack"');
    for (const name of ['React', 'Docker', 'OpenAI', 'Figma']) {
      expect(html).toContain(`alt="${name}"`);
    }
  });
});
