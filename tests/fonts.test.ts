import { readFileSync, readdirSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Index from '../src/pages/index.astro';

const sourceRoot = new URL('../src/', import.meta.url);

const globalCss = readFileSync(
  new URL('styles/global.css', sourceRoot),
  'utf8',
);
const normalizedGlobalCss = globalCss.replace(/\s+/g, ' ').trim();

const EXTERNAL_FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

function collectSourceFiles(directory: URL): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryUrl = new URL(entry.name, directory);
    return entry.isDirectory()
      ? collectSourceFiles(new URL(`${entry.name}/`, directory))
      : [entryUrl];
  });
}

describe('fonts', () => {
  it('declares_fontsource_dependencies', () => {
    const packageJson = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as {
      dependencies?: Record<string, string>;
    };

    expect(packageJson.dependencies).toBeDefined();
    expect(
      packageJson.dependencies?.['@fontsource-variable/newsreader'],
    ).toMatch(/^\^?\d/);
    expect(
      packageJson.dependencies?.['@fontsource-variable/plus-jakarta-sans'],
    ).toMatch(/^\^?\d/);
  });

  it('imports_fontsource_entry_stylesheets', () => {
    expect(normalizedGlobalCss).toContain(
      "@import '@fontsource-variable/newsreader/index.css';",
    );
    expect(normalizedGlobalCss).toContain(
      "@import '@fontsource-variable/newsreader/wght-italic.css';",
    );
    expect(normalizedGlobalCss).toContain(
      "@import '@fontsource-variable/plus-jakarta-sans/index.css';",
    );
  });

  it('does_not_reference_external_font_providers', async () => {
    for (const fileUrl of collectSourceFiles(sourceRoot)) {
      const content = readFileSync(fileUrl, 'utf8');
      for (const host of EXTERNAL_FONT_HOSTS) {
        expect(
          content,
          `${fileUrl.pathname} must not reference ${host}`,
        ).not.toContain(host);
      }
      expect(
        content,
        `${fileUrl.pathname} must not load remote font files`,
      ).not.toMatch(/url\(\s*['"]?https?:/);
    }

    const container = await AstroContainer.create();
    const html = await container.renderToString(Index, { partial: false });

    for (const host of EXTERNAL_FONT_HOSTS) {
      expect(html).not.toContain(host);
    }
    expect(html).not.toMatch(/url\(\s*['"]?https?:/);
  });
});
