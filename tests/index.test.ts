import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Index from '../src/pages/index.astro';

describe('index page', () => {
  it('renders the main heading', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Index);

    expect(html).toMatch(/<h1[^>]*>Astro<\/h1>/);
  });
});
