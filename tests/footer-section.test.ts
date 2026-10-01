import { readFileSync, readdirSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it, vi } from 'vitest';

vi.mock('astro:content', () => ({
  getCollection: async () => [],
}));

import FooterSection from '../src/components/FooterSection.astro';
import Index from '../src/pages/index.astro';
import { CONTACT_EMAIL } from '../src/site-constants';

type Declaration = readonly [property: string, value: string];

const sourceRoot = new URL('../src/', import.meta.url);
const footerSource = readFileSync(
  new URL('components/FooterSection.astro', sourceRoot),
  'utf8',
);
const baseLayoutSource = readFileSync(
  new URL('layouts/BaseLayout.astro', sourceRoot),
  'utf8',
);
const indexSource = readFileSync(
  new URL('pages/index.astro', sourceRoot),
  'utf8',
);
const globalCss = readFileSync(
  new URL('styles/global.css', sourceRoot),
  'utf8',
);
const contactRequirements = readFileSync(
  new URL('../specs/contact-section/requirements.md', import.meta.url),
  'utf8',
);

const SCHEDULE_ICON_PATH =
  'm612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z';

const STYLED_FOOTER_CLASSES = [
  '.footer',
  '.footer__inner',
  '.footer__identity',
  '.footer__name',
  '.footer__role',
  '.footer__copyright',
  '.footer__meta',
  '.footer__location',
  '.footer__schedule-icon',
  '.footer__email',
] as const;

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

function collectSourceFiles(directory: URL): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryUrl = new URL(entry.name, directory);
    return entry.isDirectory()
      ? collectSourceFiles(new URL(`${entry.name}/`, directory))
      : [entryUrl];
  });
}

function extractFooter(html: string): string {
  const match = /<footer class="footer"[^>]*>([\s\S]*?)<\/footer>/.exec(
    normalize(html),
  );
  if (!match) {
    throw new Error('Footer element not found');
  }
  return normalize(match[1]);
}

async function renderFooter(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(FooterSection);
}

async function renderPage(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Index, { partial: false });
}

describe('footer section', () => {
  it('renders_footer_structure', async () => {
    const html = normalize(await renderFooter());
    const content = extractFooter(html);

    expect(html.match(/<footer\b/g)).toHaveLength(1);
    expect(content.startsWith('<div class="footer__inner"')).toBe(true);
    expect(content.endsWith('</div>')).toBe(true);
    expect(content).not.toMatch(/<nav\b/);
    expect(content).not.toMatch(/<main\b/);
    expect(content).not.toMatch(/<section\b/);
    expect(content).not.toMatch(/<script\b/);
  });

  it('renders_footer_in_base_layout', () => {
    expect(normalize(baseLayoutSource)).toContain(
      "import FooterSection from '../components/FooterSection.astro';",
    );

    const mainCloseIndex = baseLayoutSource.indexOf('</main>');
    const footerIndex = baseLayoutSource.indexOf('<FooterSection />');
    const toastIndex = baseLayoutSource.indexOf('id="toast"');

    expect(mainCloseIndex).toBeGreaterThan(-1);
    expect(footerIndex).toBeGreaterThan(mainCloseIndex);
    expect(toastIndex).toBeGreaterThan(footerIndex);

    expect(indexSource).not.toContain('FooterSection');
  });

  it('renders_single_footer', async () => {
    const html = normalize(await renderPage());
    const mainCloseIndex = html.indexOf('</main>');
    const footerIndex = html.indexOf('<footer class="footer"');
    const toastIndex = html.indexOf('id="toast"');

    expect(mainCloseIndex).toBeGreaterThan(-1);
    expect(footerIndex).toBeGreaterThan(mainCloseIndex);
    expect(toastIndex).toBeGreaterThan(footerIndex);

    expect(html.match(/<footer\b/g)).toHaveLength(1);
    expect(html).not.toMatch(/<nav\b/);
    expect(extractFooter(html)).not.toMatch(/<h[1-6]\b/);
  });

  it('omits_entrance_animation', () => {
    expect(footerSource).not.toContain('animate-fade-in-up');
    expect(footerSource).not.toContain('animation-delay-');
    expect(footerSource).not.toContain('@keyframes');
  });

  it('renders_identity_texts', async () => {
    const html = normalize(await renderFooter());

    expect(html).toMatch(
      /<span class="footer__name"[^>]*>Carlos Olcina<\/span>/,
    );
    expect(html).toMatch(
      /<p class="footer__role"[^>]*>Ingeniero Senior Full-Stack y Sistemas de IA<\/p>/,
    );
    expect(html).toMatch(
      /<p class="footer__copyright"[^>]*>© 2025 Carlos Olcina\. Todos los derechos reservados\.<\/p>/,
    );
  });

  it('styles_identity_block', () => {
    expectDeclarations(extractRule(footerSource, '.footer__identity'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['align-items', 'center'],
      ['gap', '0.25rem'],
    ]);

    expectDeclarations(extractRule(footerSource, '.footer__name'), [
      ['font-family', 'var(--font-headline)'],
      ['font-size', 'var(--text-headline-sm-size)'],
      ['line-height', 'var(--text-headline-sm-line-height)'],
      ['letter-spacing', 'var(--text-headline-sm-letter-spacing)'],
      ['font-weight', 'var(--text-headline-sm-weight)'],
      ['font-style', 'italic'],
      ['color', 'var(--color-slate-900)'],
    ]);

    for (const selector of ['.footer__role', '.footer__copyright']) {
      expectDeclarations(extractRule(footerSource, selector), [
        ['font-family', 'var(--font-body)'],
        ['font-size', 'var(--text-body-sm-size)'],
        ['line-height', 'var(--text-body-sm-line-height)'],
        ['letter-spacing', 'var(--text-body-sm-letter-spacing)'],
        ['font-weight', '300'],
      ]);
    }

    expectDeclarations(extractRule(footerSource, '.footer__role'), [
      ['color', 'var(--color-slate-600)'],
    ]);

    expectDeclarations(extractRule(footerSource, '.footer__copyright'), [
      ['color', 'var(--color-slate-400)'],
    ]);
  });

  it('styles_responsive_layout', () => {
    const mediaBlock = extractMediaBlock(footerSource, 768);

    expectDeclarations(extractRule(mediaBlock, '.footer__inner'), [
      ['flex-direction', 'row'],
    ]);
    expectDeclarations(extractRule(mediaBlock, '.footer__identity'), [
      ['align-items', 'flex-start'],
    ]);
    expectDeclarations(extractRule(mediaBlock, '.footer__meta'), [
      ['align-items', 'flex-end'],
    ]);
  });

  it('renders_location_line', async () => {
    const html = normalize(await renderFooter());
    const location =
      /<div class="footer__location"[^>]*>([\s\S]*?)<\/div>/.exec(html);
    const locationHtml = location?.[1] ?? '';
    const locationText =
      /<span class="footer__location-text"[^>]*>([\s\S]*?)<\/span>/.exec(
        locationHtml,
      )?.[1] ?? '';

    expect(locationHtml).toContain('<svg class="footer__schedule-icon"');
    expect(normalize(locationText)).toBe('Alicante, España (CET / UTC+1)');
  });

  it('omits_mockup_city', async () => {
    const html = normalize(await renderPage());

    expect(footerSource).not.toContain('València');
    expect(html).not.toContain('València');
  });

  it('renders_schedule_icon', async () => {
    const html = normalize(await renderFooter());
    const icon =
      /<svg class="footer__schedule-icon"[^>]*>[\s\S]*?<\/svg>/.exec(
        html,
      )?.[0] ?? '';

    expect(icon).toContain('viewBox="0 -960 960 960"');
    expect(icon).toContain('width="16"');
    expect(icon).toContain('height="16"');
    expect(icon).toContain('fill="currentColor"');
    expect(icon).toContain('aria-hidden="true"');
    expect(icon).toContain(`d="${SCHEDULE_ICON_PATH}"`);

    expect(footerSource).not.toContain('material-symbols');
    expect(html).not.toContain('material-symbols');
  });

  it('styles_location_line', () => {
    expectDeclarations(extractRule(footerSource, '.footer__location'), [
      ['display', 'flex'],
      ['align-items', 'center'],
      ['gap', '0.5rem'],
      ['font-family', 'var(--font-body)'],
      ['font-size', 'var(--text-label-md-size)'],
      ['line-height', 'var(--text-label-md-line-height)'],
      ['letter-spacing', 'var(--text-label-md-letter-spacing)'],
      ['font-weight', 'var(--text-label-md-weight)'],
      ['color', 'var(--color-slate-600)'],
    ]);

    expectDeclarations(extractRule(footerSource, '.footer__schedule-icon'), [
      ['width', '16px'],
      ['height', '16px'],
      ['flex-shrink', '0'],
    ]);
  });

  it('renders_single_email_link', async () => {
    const renderedFooter = normalize(await renderFooter());
    const renderedPage = normalize(await renderPage());

    for (const html of [renderedFooter, renderedPage]) {
      const content = extractFooter(html);
      const anchors = content.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? [];

      expect(anchors).toHaveLength(1);
      const anchor = anchors[0] ?? '';
      expect(anchor).toContain('class="footer__email"');
      expect(anchor).toContain(`href="mailto:${CONTACT_EMAIL}"`);

      const text = normalize(anchor.replace(/<[^>]+>/g, ''));
      expect(text).toBe(CONTACT_EMAIL);
    }
  });

  it('omits_social_links', async () => {
    const content = extractFooter(await renderPage());

    for (const forbidden of [
      'github.com',
      'x.com',
      'linkedin.com',
      '>GitHub<',
      '>LinkedIn<',
      '>X<',
      '•',
      'alex@example.com',
    ]) {
      expect(footerSource, forbidden).not.toContain(forbidden);
      expect(content, forbidden).not.toContain(forbidden);
    }
  });

  it('imports_shared_contact_email', async () => {
    expect(footerSource).toContain(
      "import { CONTACT_EMAIL } from '../site-constants';",
    );
    expect(footerSource).toContain('href={`mailto:${CONTACT_EMAIL}`}');
    expect(footerSource).not.toContain('carlosolcina23@gmail.com');
    expect(footerSource).not.toContain('alex@example.com');

    expect(normalize(await renderFooter())).toContain(
      `href="mailto:${CONTACT_EMAIL}"`,
    );
    expect(normalize(await renderPage())).toContain(
      `href="mailto:${CONTACT_EMAIL}"`,
    );
  });

  it('styles_email_link', () => {
    expectDeclarations(extractRule(footerSource, '.footer__email'), [
      ['font-family', 'var(--font-body)'],
      ['font-size', 'var(--text-body-sm-size)'],
      ['line-height', 'var(--text-body-sm-line-height)'],
      ['letter-spacing', 'var(--text-body-sm-letter-spacing)'],
      ['font-weight', 'var(--text-body-sm-weight)'],
      ['color', 'var(--color-slate-600)'],
      ['transition', 'color 200ms cubic-bezier(0.4, 0, 0.2, 1)'],
    ]);

    expectDeclarations(extractRule(footerSource, '.footer__email:hover'), [
      ['color', 'var(--color-primary)'],
    ]);
  });

  it('styles_footer_shell', () => {
    expectDeclarations(extractRule(footerSource, '.footer'), [
      ['width', '100%'],
      ['margin-top', 'var(--space-margin)'],
      ['position', 'relative'],
      ['z-index', '10'],
      ['background-color', 'rgba(255, 255, 255, 0.4)'],
      ['-webkit-backdrop-filter', 'blur(40px)'],
      ['backdrop-filter', 'blur(40px)'],
      ['border-top', '1px solid rgba(199, 210, 254, 0.35)'],
    ]);
  });

  it('styles_footer_inner', () => {
    expectDeclarations(extractRule(footerSource, '.footer__inner'), [
      ['max-width', '64rem'],
      ['margin-inline', 'auto'],
      ['padding-block', '3.5rem'],
      ['padding-inline', '1.5rem'],
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['align-items', 'center'],
      ['justify-content', 'space-between'],
      ['gap', '2rem'],
    ]);

    expectDeclarations(extractRule(footerSource, '.footer__meta'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['align-items', 'center'],
      ['gap', '0.75rem'],
    ]);
  });

  it('ships_zero_client_javascript', async () => {
    expect(footerSource).not.toContain('<script');
    expect(footerSource).not.toContain('client:');
    expect(footerSource).not.toMatch(/\son[a-z]+\s*=/);

    const html = normalize(await renderPage());

    expect(html.match(/<script\b/g) ?? []).toHaveLength(2);
    expect(html).toMatch(
      /<script type="module" src="[^"]*HeroSection\.astro\?astro&type=script/,
    );
    expect(html).toMatch(
      /<script type="module" src="[^"]*ContactSection\.astro\?astro&type=script/,
    );
    expect(html).not.toContain('astro-island');
  });

  it('styles_are_scoped_and_tokenized', () => {
    const styleBlock =
      /<style[^>]*>([\s\S]*?)<\/style>/.exec(footerSource)?.[1] ?? '';

    expect(styleBlock).toContain('var(--');
    for (const selector of STYLED_FOOTER_CLASSES) {
      expect(() => extractRule(styleBlock, selector), selector).not.toThrow();
    }
    expect(footerSource).toContain('class="footer__location-text"');

    expect(globalCss).not.toContain('.footer');
    expect(footerSource).not.toContain('@keyframes');
    expect(footerSource).not.toMatch(/outline\s*:\s*(?:none|0)/);
  });

  it('amends_contact_section_exclusions', () => {
    expect(contactRequirements).toContain('## Amendments');
    expect(contactRequirements).toContain(
      '### 2026-10-01 — Footer no longer excluded (R41 footer clause superseded)',
    );
    expect(contactRequirements).toContain('R41');
    expect(contactRequirements).toMatch(/superseded/i);
    expect(contactRequirements).toContain('exactly one `<footer>`');
    expect(contactRequirements).toContain('no `<nav>`');
  });

  it('omits_excluded_features', async () => {
    expect(footerSource).not.toContain('<canvas');
    expect(footerSource.toLowerCase()).not.toContain('shader');

    for (const fileUrl of collectSourceFiles(sourceRoot)) {
      const content = readFileSync(fileUrl, 'utf8').toLowerCase();
      expect(
        content,
        `${fileUrl.pathname} must not add a canvas`,
      ).not.toContain('<canvas');
      expect(
        content,
        `${fileUrl.pathname} must not add a shader`,
      ).not.toContain('shader');
    }
  });

  it('omits_form_and_message_logic', async () => {
    const content = extractFooter(await renderPage());

    for (const forbidden of [
      '<nav',
      '<form',
      '<input',
      '<textarea',
      '<button',
      'preventDefault',
      'onsubmit',
      '¡Mensaje enviado!',
    ]) {
      expect(footerSource, forbidden).not.toContain(forbidden);
      expect(content, forbidden).not.toContain(forbidden);
    }

    expect(footerSource).not.toMatch(/success/i);
    expect(content).not.toMatch(/success/i);
  });
});
