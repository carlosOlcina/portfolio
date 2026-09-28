import { readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Index from '../src/pages/index.astro';

type Declaration = readonly [property: string, value: string];

const baseLayoutSource = readFileSync(
  new URL('../src/layouts/BaseLayout.astro', import.meta.url),
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

async function renderPage(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Index, { partial: false });
}

function extractToast(html: string): string {
  const normalizedHtml = normalize(html);
  const start = normalizedHtml.indexOf('<div class="toast"');
  if (start === -1) {
    throw new Error('Toast element not found');
  }
  return normalizedHtml.slice(
    start,
    normalizedHtml.indexOf('</div>', start) + '</div>'.length,
  );
}

describe('toast', () => {
  it('renders_hidden_toast', async () => {
    const html = await renderPage();
    const toastHtml = extractToast(html);

    expect(html.match(/id="toast"/g)).toHaveLength(1);
    expect(toastHtml).toContain('role="status"');
    expect(toastHtml).toContain('aria-live="polite"');
    expect(toastHtml).toContain('class="toast__text" id="toast-text"');
    expect(toastHtml).toMatch(/>\s*¡Copiado!\s*<\/span>/);
    expect(toastHtml).not.toContain('toast--visible');
    expect(html).not.toContain('toast--visible');
  });

  it('renders_toast_icon', async () => {
    const toastHtml = extractToast(await renderPage());
    const svg = /<svg\b[^>]*>/.exec(toastHtml)?.[0] ?? '';

    expect(svg).toContain('class="toast__icon"');
    expect(svg).toContain('viewBox="0 -960 960 960"');
    expect(svg).toContain('width="18"');
    expect(svg).toContain('height="18"');
    expect(svg).toContain('fill="currentColor"');
    expect(svg).toContain('aria-hidden="true"');
    expect(toastHtml).toContain(
      'd="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"',
    );
    expect(toastHtml).not.toContain('material-symbols');
  });

  it('styles_toast', () => {
    expectDeclarations(extractRule(baseLayoutSource, '.toast'), [
      ['position', 'fixed'],
      ['bottom', '1.5rem'],
      ['right', '1.5rem'],
      ['z-index', '50'],
      ['display', 'flex'],
      ['align-items', 'center'],
      ['gap', '0.625rem'],
      ['padding', '0.875rem 1.25rem'],
      ['border-radius', 'var(--radius-xl)'],
      ['background-color', 'rgba(255, 255, 255, 0.85)'],
      ['backdrop-filter', 'blur(24px)'],
      ['-webkit-backdrop-filter', 'blur(24px)'],
      ['border', '1px solid rgba(255, 255, 255, 0.9)'],
      ['color', 'var(--color-slate-900)'],
      ['box-shadow', '0 12px 36px rgba(79, 70, 229, 0.18)'],
      ['transition', 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'],
    ]);

    expectDeclarations(extractRule(baseLayoutSource, '.toast__icon'), [
      ['width', '18px'],
      ['height', '18px'],
      ['flex-shrink', '0'],
      ['color', 'var(--color-primary)'],
    ]);

    expectDeclarations(extractRule(baseLayoutSource, '.toast__text'), [
      ['font-family', 'var(--font-body)'],
      ['font-size', 'var(--text-body-md-size)'],
      ['line-height', 'var(--text-body-md-line-height)'],
      ['letter-spacing', 'var(--text-body-md-letter-spacing)'],
      ['font-weight', '500'],
    ]);
  });

  it('defines_toast_visibility_states', () => {
    expectDeclarations(extractRule(baseLayoutSource, '.toast'), [
      ['transform', 'translateY(6rem)'],
      ['opacity', '0'],
      ['pointer-events', 'none'],
    ]);

    expectDeclarations(extractRule(baseLayoutSource, '.toast--visible'), [
      ['transform', 'translateY(0)'],
      ['opacity', '1'],
      ['pointer-events', 'auto'],
    ]);
  });
});
