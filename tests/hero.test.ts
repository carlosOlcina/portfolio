import { readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import HeroSection from '../src/components/HeroSection.astro';

type Declaration = readonly [property: string, value: string];

const heroSource = readFileSync(
  new URL('../src/components/HeroSection.astro', import.meta.url),
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

async function renderHero(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(HeroSection);
}

describe('hero section', () => {
  it('renders_hero_structure', async () => {
    const html = await renderHero();
    const normalizedHtml = normalize(html);

    expect(normalizedHtml).toContain('class="hero animate-fade-in-up"');
    expect(normalizedHtml).toContain('id="overview"');
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html.match(/<p\b/g)).toHaveLength(1);

    const actionsMatch =
      /<div class="hero__actions"[^>]*>([\s\S]*?)<\/div>/.exec(html);
    expect(actionsMatch).not.toBeNull();
    const actionsHtml = actionsMatch?.[1] ?? '';

    expect(actionsHtml.match(/<a\b/g)).toHaveLength(1);
    expect(actionsHtml.match(/<button\b/g)).toHaveLength(1);
    expect(actionsHtml).toContain('href="#projects"');
  });

  it('renders_verbatim_hero_texts', async () => {
    const normalizedHtml = normalize(await renderHero());

    expect(normalizedHtml).toContain(
      'Desarrollo digital en la intersección de <span',
    );
    expect(normalizedHtml).toContain('>ingeniería e IA.</span>');
    expect(normalizedHtml).toContain(
      'Ingeniero Full-Stack &amp; Arquitecto de Software IA. Desarrollo web de alto rendimiento con React, Next.js y TypeScript.',
    );
    expect(normalizedHtml).toContain('>Ver Proyectos</span>');
    expect(normalizedHtml).toContain('>Copiar Correo</span>');
  });

  it('styles_hero_headline', () => {
    expectDeclarations(extractRule(heroSource, '.hero__headline'), [
      ['font-family', 'var(--font-headline)'],
      ['font-weight', 'var(--text-headline-xl-weight)'],
      ['font-size', 'var(--text-headline-xl-size)'],
      ['line-height', 'var(--text-headline-xl-line-height)'],
      ['letter-spacing', '-0.025em'],
      ['color', 'var(--color-slate-900)'],
    ]);

    const responsive = canonical(
      extractResponsiveRule(heroSource, '.hero__headline', 768),
    );
    expect(responsive).toContain(canonical('font-size: 4.25rem;'));
  });

  it('styles_gradient_accent_fragment', () => {
    expectDeclarations(extractRule(heroSource, '.hero__headline-accent'), [
      ['display', 'inline-block'],
      ['font-style', 'italic'],
      ['font-family', 'var(--font-headline)'],
      ['font-weight', '300'],
      [
        'background-image',
        'linear-gradient(to right, var(--color-primary), var(--color-indigo-600), var(--color-violet-500))',
      ],
      ['background-clip', 'text'],
      ['-webkit-background-clip', 'text'],
      ['color', 'transparent'],
      ['filter', 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05))'],
    ]);
  });

  it('styles_glass_tagline', () => {
    expectDeclarations(extractRule(heroSource, '.hero__tagline'), [
      ['font-family', 'var(--font-body)'],
      ['font-weight', '300'],
      ['font-size', 'var(--text-body-md-size)'],
      ['line-height', '1.625'],
      ['letter-spacing', '0.025em'],
      ['color', 'var(--color-slate-700)'],
      ['max-width', '42rem'],
      ['padding', '0.5rem 1.25rem'],
      ['border-radius', 'var(--radius-xl)'],
      ['background-color', 'rgba(255, 255, 255, 0.45)'],
      ['backdrop-filter', 'blur(24px)'],
      ['-webkit-backdrop-filter', 'blur(24px)'],
      ['border', '1px solid rgba(255, 255, 255, 0.6)'],
      ['box-shadow', '0 4px 20px rgba(79, 70, 229, 0.04)'],
    ]);

    const responsive = canonical(
      extractResponsiveRule(heroSource, '.hero__tagline', 768),
    );
    expect(responsive).toContain(canonical('font-size: 1.05rem;'));
  });

  it('styles_primary_cta', () => {
    expectDeclarations(extractRule(heroSource, '.hero__cta'), [
      ['padding', '0.875rem 1.75rem'],
      ['gap', '0.625rem'],
      ['border-radius', 'var(--radius-full)'],
      ['font-size', 'var(--text-label-md-size)'],
      ['line-height', 'var(--text-label-md-line-height)'],
      ['font-weight', 'var(--text-label-md-weight)'],
      ['transition', 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'],
    ]);

    expectDeclarations(extractRule(heroSource, '.hero__cta--primary'), [
      ['color', '#ffffff'],
      [
        'background-image',
        'linear-gradient(to right, var(--color-indigo-600), var(--color-primary), var(--color-indigo-600))',
      ],
      ['border', '1px solid rgba(53, 37, 205, 0.4)'],
      ['box-shadow', '0 4px 20px rgba(79, 70, 229, 0.3)'],
    ]);

    expectDeclarations(extractRule(heroSource, '.hero__cta--primary:hover'), [
      [
        'background-image',
        'linear-gradient(to right, var(--color-indigo-700), var(--color-indigo-600), var(--color-indigo-700))',
      ],
      ['box-shadow', '0 10px 32px rgba(79, 70, 229, 0.45)'],
    ]);

    expectDeclarations(extractRule(heroSource, '.hero__cta--primary:active'), [
      ['transform', 'scale(0.95)'],
    ]);
    expectDeclarations(extractRule(heroSource, '.hero__cta-label'), [
      ['letter-spacing', '0.025em'],
    ]);
  });

  it('styles_secondary_cta', async () => {
    expectDeclarations(extractRule(heroSource, '.hero__cta'), [
      ['padding', '0.875rem 1.75rem'],
      ['gap', '0.625rem'],
      ['border-radius', 'var(--radius-full)'],
      ['font-size', 'var(--text-label-md-size)'],
      ['line-height', 'var(--text-label-md-line-height)'],
      ['font-weight', 'var(--text-label-md-weight)'],
      ['transition', 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'],
    ]);

    expectDeclarations(extractRule(heroSource, '.hero__cta--secondary'), [
      ['color', 'var(--color-slate-800)'],
      ['background-color', 'rgba(255, 255, 255, 0.5)'],
      ['backdrop-filter', 'blur(24px)'],
      ['-webkit-backdrop-filter', 'blur(24px)'],
      ['border', '1px solid rgba(255, 255, 255, 0.7)'],
      ['box-shadow', '0 4px 16px rgba(15, 23, 42, 0.04)'],
    ]);

    expectDeclarations(extractRule(heroSource, '.hero__cta--secondary:hover'), [
      ['border-color', 'var(--color-indigo-300)'],
      ['background-color', 'rgba(255, 255, 255, 0.75)'],
      ['box-shadow', '0 6px 22px rgba(79, 70, 229, 0.12)'],
    ]);

    expectDeclarations(
      extractRule(heroSource, '.hero__cta--secondary:active'),
      [['transform', 'scale(0.95)']],
    );
    expectDeclarations(extractRule(heroSource, '.hero__cta-label'), [
      ['letter-spacing', '0.025em'],
    ]);

    const button = /<button\b[^>]*>/.exec(await renderHero())?.[0] ?? '';
    expect(button).toContain('type="button"');
    expect(button).not.toContain('aria-disabled');
    expect(button).not.toMatch(/\sdisabled\b/);
  });

  it('renders_inline_svg_icons', async () => {
    const html = await renderHero();
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
      'd="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"',
    );
    expect(html).toContain(
      'd="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"',
    );
    expect(html).not.toContain('material-symbols');

    expectDeclarations(extractRule(heroSource, '.hero__icon'), [
      ['width', '18px'],
      ['height', '18px'],
      ['flex-shrink', '0'],
      ['transition', 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)'],
    ]);
    expectDeclarations(extractRule(heroSource, '.hero__icon--copy'), [
      ['color', 'var(--color-primary)'],
    ]);
    expectDeclarations(
      extractRule(heroSource, '.hero__cta--primary:hover .hero__icon--arrow'),
      [['transform', 'translateY(0.125rem)']],
    );
    expectDeclarations(
      extractRule(heroSource, '.hero__cta--secondary:hover .hero__icon--copy'),
      [['transform', 'rotate(12deg)']],
    );
  });

  it('applies_hero_geometry', () => {
    expectDeclarations(extractRule(heroSource, '.hero'), [
      ['position', 'relative'],
      ['z-index', '10'],
      ['padding-block', '5rem'],
      ['border-bottom', '1px solid rgba(199, 210, 254, 0.35)'],
    ]);

    const responsive = canonical(
      extractResponsiveRule(heroSource, '.hero', 768),
    );
    expect(responsive).toContain(canonical('padding-block: 7rem;'));

    expectDeclarations(extractRule(heroSource, '.hero__inner'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['align-items', 'center'],
      ['text-align', 'center'],
      ['gap', '2rem'],
      ['max-width', '56rem'],
      ['margin-inline', 'auto'],
      ['position', 'relative'],
      ['z-index', '10'],
    ]);

    expectDeclarations(extractRule(heroSource, '.hero__content'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['align-items', 'center'],
      ['gap', '1.5rem'],
    ]);

    expectDeclarations(extractRule(heroSource, '.hero__actions'), [
      ['display', 'flex'],
      ['flex-wrap', 'wrap'],
      ['align-items', 'center'],
      ['justify-content', 'center'],
      ['gap', '1rem'],
      ['padding-top', '0.5rem'],
    ]);
  });
});
