import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Declaration = readonly [property: string, value: string];

const sourceRoot = new URL('../src/', import.meta.url);
const globalCss = readFileSync(
  new URL('styles/global.css', sourceRoot),
  'utf8',
);

const canonical = (value: string): string =>
  value
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),])\s*/g, '$1')
    .trim();

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function extractRule(source: string, selector: string): string {
  const pattern = new RegExp(
    `(?:^|[}\\s])${escapeRegExp(canonical(selector))}\\s*\\{([^}]*)\\}`,
  );
  const match = pattern.exec(canonical(source));
  if (!match) {
    throw new Error(`Rule not found: ${selector}`);
  }
  return match[0];
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

describe('global styles', () => {
  it('applies_design_body_styles', () => {
    const bodyRule = extractRule(globalCss, 'body');

    expectDeclarations(bodyRule, [
      [
        'background-image',
        'linear-gradient(to bottom, rgba(246, 248, 255, 0.85), rgba(240, 244, 255, 0.8), rgba(238, 242, 255, 0.9))',
      ],
      ['color', 'var(--color-on-surface)'],
      ['font-family', 'var(--font-body)'],
      ['font-size', 'var(--text-body-md-size)'],
      ['line-height', 'var(--text-body-md-line-height)'],
      ['letter-spacing', 'var(--text-body-md-letter-spacing)'],
      ['font-weight', 'var(--text-body-md-weight)'],
      ['-webkit-font-smoothing', 'antialiased'],
      ['-moz-osx-font-smoothing', 'grayscale'],
      ['overscroll-behavior', 'none'],
      ['min-height', '100vh'],
      ['overflow-x', 'hidden'],
    ]);
  });

  it('applies_base_resets', () => {
    const normalizedCss = canonical(globalCss);
    const resets = [
      '*, *::before, *::after { box-sizing: border-box; }',
      'html, body { margin: 0; padding: 0; }',
      'h1, p { margin: 0; }',
      'a { color: inherit; text-decoration: inherit; }',
      'button { font: inherit; color: inherit; background-color: transparent; border: 0; padding: 0; margin: 0; }',
      'main > :first-child { margin-top: 0 !important; }',
      'main > :last-child { margin-bottom: 0 !important; }',
    ];

    for (const reset of resets) {
      expect(normalizedCss, `expected reset: ${reset}`).toContain(
        canonical(reset),
      );
    }
  });

  it('applies_selection_colors', () => {
    expect(canonical(globalCss)).toContain(
      canonical(
        '::selection { background-color: rgba(53, 37, 205, 0.2); color: var(--color-primary); }',
      ),
    );
  });

  it('hides_webkit_scrollbar', () => {
    expect(canonical(globalCss)).toContain(
      canonical('::-webkit-scrollbar { display: none; }'),
    );
  });

  it('enables_smooth_scroll', () => {
    expect(canonical(globalCss)).toContain(
      canonical('html { scroll-behavior: smooth; }'),
    );
  });

  it('honors_reduced_motion', () => {
    const reducedMotion = `@media (prefers-reduced-motion: reduce) {
      *, ::before, ::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }`;

    expect(canonical(globalCss)).toContain(canonical(reducedMotion));
  });

  it('defines_fade_in_up_animation_and_delays', () => {
    const normalizedCss = canonical(globalCss);
    const keyframes = `@keyframes fadeInSlideUp {
      0% { opacity: 0; transform: translateY(18px); }
      100% { opacity: 1; transform: translateY(0); }
    }`;

    expect(normalizedCss).toContain(canonical(keyframes));
    expect(normalizedCss).toContain(
      canonical(
        '.animate-fade-in-up { animation: fadeInSlideUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; }',
      ),
    );
    expect(normalizedCss).toContain(
      canonical('.animation-delay-100 { animation-delay: 100ms; }'),
    );
    expect(normalizedCss).toContain(
      canonical('.animation-delay-200 { animation-delay: 200ms; }'),
    );
    expect(normalizedCss).toContain(
      canonical('.animation-delay-300 { animation-delay: 300ms; }'),
    );
    expect(normalizedCss).toContain(
      canonical('.animation-delay-400 { animation-delay: 400ms; }'),
    );
  });

  it('does_not_suppress_focus_outlines', () => {
    for (const fileUrl of collectSourceFiles(sourceRoot)) {
      const content = readFileSync(fileUrl, 'utf8');
      expect(
        content,
        `${fileUrl.pathname} must not suppress focus outlines`,
      ).not.toMatch(/outline\s*:\s*(?:none|0)/);
    }
  });
});
