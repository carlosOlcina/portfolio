import { readFileSync, readdirSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it, vi } from 'vitest';
import ContactSection from '../src/components/ContactSection.astro';
import type { ProfileData } from '../src/content/profiles-schema';
import { CONTACT_EMAIL } from '../src/site-constants';

vi.mock('astro:content', () => {
  const profileEntries = [
    {
      data: {
        id: '3a7d1f52-9b4c-4e68-8f21-6c0d5a9e7b34',
        title: 'GitHub',
        url: 'https://github.com',
      },
    },
    {
      data: {
        id: '7c2e8a41-5d6f-4b93-a0e8-2f4c9d1b6a05',
        title: 'LinkedIn',
        url: 'https://linkedin.com',
      },
    },
    {
      data: {
        id: 'b5f0c3d8-2a71-4c9e-9d36-8e7a1b4f2c90',
        title: 'X',
        url: 'https://x.com',
      },
    },
  ];

  return {
    getCollection: async (collection: string) => {
      if (collection === 'profiles') {
        return profileEntries.map((entry, index) => ({
          id: `profile-${index}`,
          data: entry.data,
        }));
      }
      return [];
    },
  };
});

import Index from '../src/pages/index.astro';

type Declaration = readonly [property: string, value: string];

const sourceRoot = new URL('../src/', import.meta.url);
const sectionSource = readFileSync(
  new URL('components/ContactSection.astro', sourceRoot),
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

const MAIL_ICON_PATH =
  'M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z';
const COPY_ICON_PATH =
  'M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z';
const ARROW_OUTWARD_ICON_PATH =
  'm256-240-56-56 384-384H240v-80h480v480h-80v-344L256-240Z';
const SEND_ICON_PATH =
  'M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z';

const EXPECTED_DEPENDENCIES = {
  '@fontsource-variable/newsreader': '^5.3.0',
  '@fontsource-variable/plus-jakarta-sans': '^5.3.0',
  astro: '^7.2.8',
  sharp: '^0.35.4',
};

const EXPECTED_DEV_DEPENDENCIES = {
  '@astrojs/check': '^0.9.10',
  '@eslint/js': '^10.0.1',
  eslint: '^10.11.0',
  'eslint-plugin-astro': '^3.2.1',
  prettier: '^3.9.9',
  'prettier-plugin-astro': '^1.1.0',
  typescript: '^5.9.3',
  'typescript-eslint': '^8.70.1',
  vitest: '^5.0.2',
};

let fixtureCounter = 0;

function createProfile(overrides: Partial<ProfileData> = {}): ProfileData {
  fixtureCounter += 1;

  return {
    id: `00000000-0000-4000-8000-${String(fixtureCounter).padStart(12, '0')}`,
    title: `Profile ${fixtureCounter}`,
    url: 'https://example.com',
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

function collectSourceFiles(directory: URL): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryUrl = new URL(entry.name, directory);
    return entry.isDirectory()
      ? collectSourceFiles(new URL(`${entry.name}/`, directory))
      : [entryUrl];
  });
}

function expectRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Expected a JSON object');
  }
  return value as Record<string, unknown>;
}

async function renderSection(profiles: ProfileData[]): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(ContactSection, { props: { profiles } });
}

async function renderPage(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Index, { partial: false });
}

describe('contact section', () => {
  it('validates_profiles_at_render_time', async () => {
    expect(normalize(sectionSource)).toContain(
      'const orderedProfiles = sortProfiles(profiles);',
    );

    const id = '3a7d1f52-9b4c-4e68-8f21-6c0d5a9e7b34';

    await expect(
      renderSection([createProfile({ id }), createProfile({ id })]),
    ).rejects.toThrow(`Duplicate profile id: ${id}`);
  });

  it('imports_shared_contact_email', async () => {
    expect(sectionSource).toContain(
      "import { CONTACT_EMAIL } from '../site-constants';",
    );
    expect(sectionSource).toContain('data-email={CONTACT_EMAIL}');

    const html = normalize(await renderSection([createProfile()]));

    expect(html).toContain(`data-email="${CONTACT_EMAIL}"`);
  });

  it('wires_copy_listener_to_contact_card', () => {
    const compact = sectionSource.replace(/\s+/g, '');

    expect(compact).toContain('document.querySelector<HTMLButtonElement>(');
    expect(compact).toContain("'#copy-email-contact-btn'");
    expect(sectionSource).toContain("button.addEventListener('click'");
    expect(sectionSource).toContain('button.dataset.email');
    expect(sectionSource).toContain(
      "import { copyToClipboard, showToast } from '../scripts/clipboard';",
    );
    expect(compact).toContain('copyToClipboard(email,()=>showToast(');
    expect(compact).toContain(
      'showToast({container:toast,message:toastMessage})',
    );
    expect(sectionSource).not.toContain('onclick=');
  });

  it('renders_copy_email_card', async () => {
    const html = normalize(await renderSection([createProfile()]));
    const button =
      /<button class="contact__email-card"[^>]*>/.exec(html)?.[0] ?? '';

    expect(button).toContain('id="copy-email-contact-btn"');
    expect(button).toContain('type="button"');
    expect(button).toContain(`data-email="${CONTACT_EMAIL}"`);
    expect(html).toContain('Correo Directo');
    expect(html).toContain(`>${CONTACT_EMAIL}</span>`);

    const mailIcon =
      /<svg class="contact__email-badge-icon"[^>]*>[\s\S]*?<\/svg>/.exec(
        html,
      )?.[0] ?? '';
    expect(mailIcon).toContain('viewBox="0 -960 960 960"');
    expect(mailIcon).toContain('width="20"');
    expect(mailIcon).toContain('height="20"');
    expect(mailIcon).toContain('fill="currentColor"');
    expect(mailIcon).toContain('aria-hidden="true"');
    expect(mailIcon).toContain(`d="${MAIL_ICON_PATH}"`);

    const copyIcon =
      /<svg class="contact__email-copy-icon"[^>]*>[\s\S]*?<\/svg>/.exec(
        html,
      )?.[0] ?? '';
    expect(copyIcon).toContain('viewBox="0 -960 960 960"');
    expect(copyIcon).toContain('width="18"');
    expect(copyIcon).toContain('height="18"');
    expect(copyIcon).toContain('fill="currentColor"');
    expect(copyIcon).toContain('aria-hidden="true"');
    expect(copyIcon).toContain(`d="${COPY_ICON_PATH}"`);

    expect(html).not.toContain('material-symbols');
  });

  it('renders_profiles_card', async () => {
    const html = normalize(
      await renderSection([
        createProfile({ title: 'X', url: 'https://x.com' }),
        createProfile({ title: 'GitHub', url: 'https://github.com' }),
        createProfile({ title: 'LinkedIn', url: 'https://linkedin.com' }),
      ]),
    );

    expect(html).toContain('Redes y Perfiles');

    const links =
      html.match(/<a class="contact__profile-link"[^>]*>[\s\S]*?<\/a>/g) ?? [];

    expect(links).toHaveLength(3);
    expect(links[0]).toContain('>GitHub</span>');
    expect(links[0]).toContain('href="https://github.com"');
    expect(links[1]).toContain('>LinkedIn</span>');
    expect(links[1]).toContain('href="https://linkedin.com"');
    expect(links[2]).toContain('>X</span>');
    expect(links[2]).toContain('href="https://x.com"');

    for (const link of links) {
      expect(link).toContain('target="_blank"');
      expect(link).toContain('rel="noreferrer"');
      expect(link).toContain('width="14"');
      expect(link).toContain('height="14"');
      expect(link).toContain('aria-hidden="true"');
      expect(link).toContain(`d="${ARROW_OUTWARD_ICON_PATH}"`);
    }

    expect(html.indexOf('>GitHub</span>')).toBeLessThan(
      html.indexOf('>LinkedIn</span>'),
    );
    expect(html.indexOf('>LinkedIn</span>')).toBeLessThan(
      html.indexOf('>X</span>'),
    );
    expect(html).not.toContain('material-symbols');
  });

  it('renders_section_header', async () => {
    const html = normalize(await renderSection([createProfile()]));

    expect(html).toContain('Contacto y Colaboración');
    expect(html).toContain('class="contact__label-rule"');
    expect(html).toContain(
      'Construyamos algo <span class="contact__title-accent"',
    );
    expect(html).toContain('>increíble</span> juntos');
    expect(html).toContain(
      '¿Tienes un proyecto web o de inteligencia artificial en mente? Hablemos.',
    );
    expect(html.match(/<h2\b/g)).toHaveLength(1);
  });

  it('renders_form_structure', async () => {
    const html = normalize(await renderSection([createProfile()]));
    const formIndex = html.indexOf('<form class="contact__form"');
    const fieldsIndex = html.indexOf('class="contact__fields"');
    const messageIndex = html.indexOf('id="contact-message"');
    const submitIndex = html.indexOf('class="contact__submit"');

    expect(formIndex).toBeGreaterThan(-1);
    expect(fieldsIndex).toBeGreaterThan(formIndex);
    expect(html.indexOf('id="contact-name"')).toBeGreaterThan(fieldsIndex);
    expect(html.indexOf('id="contact-email"')).toBeGreaterThan(fieldsIndex);
    expect(messageIndex).toBeGreaterThan(html.indexOf('id="contact-email"'));
    expect(submitIndex).toBeGreaterThan(messageIndex);

    expectDeclarations(extractRule(sectionSource, '.contact__form'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['gap', '1.25rem'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__fields'), [
      ['display', 'grid'],
      ['grid-template-columns', 'minmax(0, 1fr)'],
      ['gap', '1.25rem'],
    ]);

    const fieldsMedia = canonical(
      extractResponsiveRule(sectionSource, '.contact__fields', 640),
    );
    expect(fieldsMedia).toContain(
      canonical('grid-template-columns: repeat(2, minmax(0, 1fr));'),
    );
  });

  it('renders_accessible_form_fields', async () => {
    const formMarkup = sectionSource.slice(
      sectionSource.indexOf('<form class="contact__form">'),
      sectionSource.indexOf('</form>'),
    );

    expect(formMarkup).toContain('for="contact-name"');
    expect(formMarkup).toContain('id="contact-name"');
    expect(formMarkup).toContain('type="text"');
    expect(formMarkup).toContain('placeholder="Elena Rostova"');
    expect(formMarkup).toContain('for="contact-email"');
    expect(formMarkup).toContain('id="contact-email"');
    expect(formMarkup).toContain('type="email"');
    expect(formMarkup).toContain('placeholder="elena@empresa.com"');
    expect(formMarkup).toContain('for="contact-message"');
    expect(formMarkup).toContain('id="contact-message"');
    expect(formMarkup).toContain('rows="4"');
    expect(formMarkup).toContain(
      'placeholder="Detalles del proyecto, plazos y objetivos..."',
    );
    expect(formMarkup).not.toContain('name=');
    expect(formMarkup).not.toContain('autocomplete');
    expect(formMarkup).not.toContain('data-');
    expect(formMarkup).not.toContain('action=');
    expect(formMarkup).not.toContain('method=');

    const html = normalize(await renderSection([createProfile()]));
    const nameInput =
      /<input[^>]*id="contact-name"[^>]*>/.exec(html)?.[0] ?? '';
    const emailInput =
      /<input[^>]*id="contact-email"[^>]*>/.exec(html)?.[0] ?? '';
    const messageTextarea =
      /<textarea[^>]*id="contact-message"[^>]*>/.exec(html)?.[0] ?? '';

    expect(html.match(/<input\b/g)).toHaveLength(2);
    expect(html.match(/<textarea\b/g)).toHaveLength(1);

    expect(nameInput).toContain('class="contact__input"');
    expect(nameInput).toContain('type="text"');
    expect(nameInput).toContain('placeholder="Elena Rostova"');
    expect(nameInput).toMatch(/\srequired(?=[\s>=])/);

    expect(emailInput).toContain('class="contact__input"');
    expect(emailInput).toContain('type="email"');
    expect(emailInput).toContain('placeholder="elena@empresa.com"');
    expect(emailInput).toMatch(/\srequired(?=[\s>=])/);

    expect(messageTextarea).toContain('class="contact__textarea"');
    expect(messageTextarea).toContain('rows="4"');
    expect(messageTextarea).toContain(
      'placeholder="Detalles del proyecto, plazos y objetivos..."',
    );
    expect(messageTextarea).toMatch(/\srequired(?=[\s>=])/);

    expect(html).toMatch(
      /<label[^>]*for="contact-name"[^>]*>\s*Nombre\s*<\/label>/,
    );
    expect(html).toMatch(
      /<label[^>]*for="contact-email"[^>]*>\s*Correo Electrónico\s*<\/label>/,
    );
    expect(html).toMatch(
      /<label[^>]*for="contact-message"[^>]*>\s*Mensaje \/ Alcance del Proyecto\s*<\/label>/,
    );
  });

  it('renders_submit_button', async () => {
    const html = normalize(await renderSection([createProfile()]));
    const button =
      /<button class="contact__submit"[^>]*>/.exec(html)?.[0] ?? '';

    expect(button).toContain('type="submit"');
    expect(html).toContain('>Enviar Mensaje</span>');

    const sendIcon =
      /<svg class="contact__submit-icon"[^>]*>[\s\S]*?<\/svg>/.exec(
        html,
      )?.[0] ?? '';
    expect(sendIcon).toContain('viewBox="0 -960 960 960"');
    expect(sendIcon).toContain('width="18"');
    expect(sendIcon).toContain('height="18"');
    expect(sendIcon).toContain('fill="currentColor"');
    expect(sendIcon).toContain('aria-hidden="true"');
    expect(sendIcon).toContain(`d="${SEND_ICON_PATH}"`);

    expectDeclarations(extractRule(sectionSource, '.contact__submit'), [
      ['display', 'inline-flex'],
      ['align-items', 'center'],
      ['justify-content', 'center'],
      ['gap', '0.625rem'],
      ['width', '100%'],
      ['padding', '1rem 1.5rem'],
      ['border-radius', 'var(--radius-xl)'],
      [
        'background-image',
        'linear-gradient(to right, var(--color-indigo-600), var(--color-primary), var(--color-indigo-600))',
      ],
      ['color', '#ffffff'],
      ['font-family', 'var(--font-body)'],
      ['font-size', 'var(--text-label-md-size)'],
      ['line-height', 'var(--text-label-md-line-height)'],
      ['font-weight', '500'],
      ['letter-spacing', '0.025em'],
      ['border', '1px solid rgba(53, 37, 205, 0.4)'],
      ['box-shadow', '0 6px 24px rgba(79, 70, 229, 0.35)'],
      ['cursor', 'pointer'],
      ['margin-top', '0.5rem'],
      ['transition', 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__submit:hover'), [
      [
        'background-image',
        'linear-gradient(to right, var(--color-indigo-700), var(--color-indigo-600), var(--color-indigo-700))',
      ],
      ['box-shadow', '0 10px 32px rgba(79, 70, 229, 0.5)'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__submit:active'), [
      ['transform', 'scale(0.98)'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__submit-icon'), [
      ['width', '18px'],
      ['height', '18px'],
      ['flex-shrink', '0'],
    ]);

    expectDeclarations(
      extractRule(
        sectionSource,
        '.contact__submit:hover .contact__submit-icon',
      ),
      [['transform', 'translateX(0.25rem)']],
    );
  });

  it('ships_presentation_only_form', async () => {
    expect(sectionSource).not.toContain('onsubmit');
    expect(sectionSource).not.toContain('preventDefault');
    expect(sectionSource).not.toContain("addEventListener('submit'");
    expect(sectionSource).not.toContain('handleFormSubmit');
    expect(sectionSource).not.toContain('contact-form');
    expect(sectionSource).not.toContain('form-submit-btn');
    expect(sectionSource).not.toContain('form-success-banner');
    expect(sectionSource).not.toContain('¡Mensaje enviado!');
    expect(sectionSource).not.toMatch(/success/i);
    expect(sectionSource).not.toMatch(/\saction=/);
    expect(sectionSource).not.toMatch(/\smethod=/);

    const html = normalize(await renderSection([createProfile()]));

    expect(html).not.toContain('onsubmit');
    expect(html).not.toContain('¡Mensaje enviado!');
    expect(html).not.toMatch(/\saction=/);
    expect(html).not.toMatch(/\smethod=/);
  });

  it('renders_single_h2', async () => {
    const html = normalize(await renderSection([createProfile()]));

    expect(html.match(/<h2\b/g)).toHaveLength(1);
    expect(html.match(/<h1\b/g)).toBeNull();
  });

  it('ships_only_clipboard_enhancement', () => {
    const scriptTags = sectionSource.match(/<script\b[^>]*>/g) ?? [];

    expect(scriptTags).toHaveLength(1);
    expect(scriptTags[0]).not.toContain('is:inline');
    expect(sectionSource).toContain(
      "import { copyToClipboard, showToast } from '../scripts/clipboard';",
    );
    expect(sectionSource).not.toContain('client:');
    expect(sectionSource).not.toMatch(/\son[a-z]+\s*=/);
  });

  it('reuses_base_layout_toast', () => {
    expect(baseLayoutSource).toContain('id="toast"');
    expect(baseLayoutSource).toContain('id="toast-text"');
    expect(sectionSource).toContain("document.getElementById('toast')");
    expect(sectionSource).toContain("document.getElementById('toast-text')");
  });

  it('renders_single_toast', async () => {
    const html = normalize(await renderPage());

    expect(html.match(/id="toast"/g)).toHaveLength(1);
    expect(html.match(/id="toast-text"/g)).toHaveLength(1);
  });

  it('renders_contact_section_after_technologies', async () => {
    const html = normalize(await renderPage());
    const mainIndex = html.indexOf('<main class="site-main"');
    const techStackIndex = html.indexOf('id="tech-stack"');
    const contactIndex = html.indexOf('id="contact"');

    expect(mainIndex).toBeGreaterThan(-1);
    expect(techStackIndex).toBeGreaterThan(mainIndex);
    expect(contactIndex).toBeGreaterThan(techStackIndex);
    expect(html).toContain(
      'class="contact animate-fade-in-up animation-delay-400"',
    );

    expectDeclarations(extractRule(sectionSource, '.contact'), [
      ['scroll-margin-top', '6rem'],
    ]);
    expect(sectionSource).not.toContain('@keyframes');
  });

  it('loads_profile_collection_in_index', async () => {
    const normalizedIndexSource = normalize(indexSource);

    expect(normalizedIndexSource).toContain(
      "import ContactSection from '../components/ContactSection.astro';",
    );
    expect(normalizedIndexSource).toContain(
      "const profileEntries = await getCollection('profiles');",
    );
    expect(normalizedIndexSource).toContain(
      'const profiles = profileEntries.map((entry) => entry.data);',
    );
    expect(normalizedIndexSource).toContain(
      '<ContactSection profiles={profiles} />',
    );
    expect(normalizedIndexSource.indexOf('<ContactSection')).toBeGreaterThan(
      normalizedIndexSource.indexOf('<TechnologiesSection'),
    );

    const html = normalize(await renderPage());

    expect(html).toContain('id="contact"');
    expect(html).toContain(CONTACT_EMAIL);
    for (const title of ['GitHub', 'LinkedIn', 'X']) {
      expect(html).toContain(`>${title}</span>`);
    }
    expect(html).toContain('href="https://github.com"');
    expect(html).toContain('href="https://linkedin.com"');
    expect(html).toContain('href="https://x.com"');
  });

  it('omits_calcom_booking_card', async () => {
    const html = normalize(await renderPage());

    for (const forbidden of [
      'Reservar Reunión de 30 min',
      'Agendar en Cal.com',
      'cal.com',
      'calendar_month',
    ]) {
      expect(sectionSource, forbidden).not.toContain(forbidden);
      expect(html, forbidden).not.toContain(forbidden);
    }
  });

  it('omits_excluded_sections', async () => {
    const html = normalize(await renderPage());

    expect(html.match(/<footer\b/g)).toHaveLength(1);
    expect(html).toContain('<footer class="footer"');
    expect(html).not.toMatch(/<nav\b/);

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

  it('keeps_dependencies_unchanged', () => {
    const packageJson = expectRecord(
      JSON.parse(
        readFileSync(
          new URL('../package.json', import.meta.url),
          'utf8',
        ) as string,
      ),
    );

    expect(expectRecord(packageJson.dependencies)).toEqual(
      EXPECTED_DEPENDENCIES,
    );
    expect(expectRecord(packageJson.devDependencies)).toEqual(
      EXPECTED_DEV_DEPENDENCIES,
    );
  });

  it('styles_section_geometry', () => {
    expectDeclarations(extractRule(sectionSource, '.contact'), [
      ['padding-block', '6rem'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__inner'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['gap', '3rem'],
    ]);
  });

  it('styles_header_geometry', () => {
    expectDeclarations(extractRule(sectionSource, '.contact__header'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['gap', '0.75rem'],
      ['max-width', '42rem'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__eyebrow'), [
      ['display', 'flex'],
      ['align-items', 'center'],
      ['gap', '0.75rem'],
    ]);
  });

  it('styles_section_label_and_rule', () => {
    expectDeclarations(extractRule(sectionSource, '.contact__label'), [
      ['font-family', 'var(--font-body)'],
      ['font-size', 'var(--text-label-sm-size)'],
      ['line-height', 'var(--text-label-sm-line-height)'],
      ['font-weight', '500'],
      ['letter-spacing', '0.18em'],
      ['text-transform', 'uppercase'],
      ['color', 'var(--color-primary)'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__label-rule'), [
      ['display', 'block'],
      ['height', '1px'],
      ['width', '3rem'],
      ['background-color', 'rgba(53, 37, 205, 0.4)'],
    ]);
  });

  it('styles_section_title', () => {
    expectDeclarations(extractRule(sectionSource, '.contact__title'), [
      ['font-family', 'var(--font-headline)'],
      ['font-size', 'var(--text-headline-lg-size)'],
      ['line-height', 'var(--text-headline-lg-line-height)'],
      ['font-weight', 'var(--text-headline-lg-weight)'],
      ['letter-spacing', '-0.025em'],
      ['color', 'var(--color-slate-900)'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__title-accent'), [
      ['font-family', 'var(--font-headline)'],
      ['font-style', 'italic'],
      ['font-weight', '300'],
      ['color', 'var(--color-primary)'],
    ]);
  });

  it('styles_section_intro', () => {
    expectDeclarations(extractRule(sectionSource, '.contact__intro'), [
      ['font-family', 'var(--font-body)'],
      ['font-weight', '300'],
      ['font-size', 'var(--text-body-md-size)'],
      ['line-height', '1.625'],
      ['letter-spacing', 'var(--text-body-md-letter-spacing)'],
      ['color', 'var(--color-slate-600)'],
    ]);
  });

  it('styles_contact_grid', () => {
    expectDeclarations(extractRule(sectionSource, '.contact__grid'), [
      ['display', 'grid'],
      ['grid-template-columns', 'minmax(0, 1fr)'],
      ['gap', '2rem'],
      ['align-items', 'start'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__options'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['gap', '1rem'],
    ]);

    const wideGrid = extractMediaBlock(sectionSource, 1024);

    expectDeclarations(extractRule(wideGrid, '.contact__grid'), [
      ['grid-template-columns', 'repeat(12, minmax(0, 1fr))'],
    ]);
    expectDeclarations(extractRule(wideGrid, '.contact__options'), [
      ['grid-column', 'span 5'],
    ]);
    expectDeclarations(extractRule(wideGrid, '.contact__form-panel'), [
      ['grid-column', 'span 7'],
    ]);
  });

  it('styles_email_card', () => {
    expectDeclarations(extractRule(sectionSource, '.contact__email-card'), [
      ['display', 'flex'],
      ['align-items', 'center'],
      ['justify-content', 'space-between'],
      ['padding', '1.25rem'],
      ['border-radius', 'var(--radius-2xl)'],
      ['background-color', 'rgba(255, 255, 255, 0.45)'],
      ['-webkit-backdrop-filter', 'blur(24px)'],
      ['backdrop-filter', 'blur(24px)'],
      ['border', '1px solid rgba(255, 255, 255, 0.7)'],
      [
        'box-shadow',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      ],
      ['cursor', 'pointer'],
      ['text-align', 'left'],
      ['transition', 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__email-main'), [
      ['display', 'flex'],
      ['align-items', 'center'],
      ['gap', '0.875rem'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__email-badge'), [
      ['display', 'flex'],
      ['align-items', 'center'],
      ['justify-content', 'center'],
      ['width', '2.5rem'],
      ['height', '2.5rem'],
      ['border-radius', 'var(--radius-xl)'],
      ['background-color', 'rgba(53, 37, 205, 0.1)'],
      ['-webkit-backdrop-filter', 'blur(12px)'],
      ['backdrop-filter', 'blur(12px)'],
      ['border', '1px solid rgba(53, 37, 205, 0.25)'],
      ['color', 'var(--color-primary)'],
      ['transition', 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'],
    ]);

    expectDeclarations(
      extractRule(sectionSource, '.contact__email-badge-icon'),
      [
        ['width', '20px'],
        ['height', '20px'],
        ['flex-shrink', '0'],
      ],
    );

    expectDeclarations(extractRule(sectionSource, '.contact__email-text'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__email-label'), [
      ['font-family', 'var(--font-body)'],
      ['font-size', 'var(--text-label-sm-size)'],
      ['line-height', 'var(--text-label-sm-line-height)'],
      ['font-weight', '500'],
      ['letter-spacing', '0.1em'],
      ['text-transform', 'uppercase'],
      ['color', 'var(--color-slate-500)'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__email-value'), [
      ['font-family', 'var(--font-body)'],
      ['font-size', 'var(--text-body-md-size)'],
      ['line-height', 'var(--text-body-md-line-height)'],
      ['font-weight', '500'],
      ['color', 'var(--color-slate-900)'],
      ['transition', 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'],
    ]);

    expectDeclarations(
      extractRule(sectionSource, '.contact__email-copy-icon'),
      [
        ['width', '18px'],
        ['height', '18px'],
        ['flex-shrink', '0'],
        ['color', 'var(--color-slate-400)'],
        ['transition', 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'],
      ],
    );
  });

  it('styles_email_card_hover', () => {
    expectDeclarations(
      extractRule(sectionSource, '.contact__email-card:hover'),
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

    expectDeclarations(
      extractRule(sectionSource, '.contact__email-card:active'),
      [['transform', 'scale(0.99)']],
    );

    expectDeclarations(
      extractRule(
        sectionSource,
        '.contact__email-card:hover .contact__email-badge',
      ),
      [
        ['background-color', 'rgba(53, 37, 205, 0.2)'],
        ['transform', 'scale(1.05)'],
      ],
    );

    expectDeclarations(
      extractRule(
        sectionSource,
        '.contact__email-card:hover .contact__email-value',
      ),
      [['color', 'var(--color-primary)']],
    );

    expectDeclarations(
      extractRule(
        sectionSource,
        '.contact__email-card:hover .contact__email-copy-icon',
      ),
      [
        ['color', 'var(--color-primary)'],
        ['transform', 'rotate(12deg)'],
      ],
    );
  });

  it('styles_profiles_card', () => {
    expectDeclarations(extractRule(sectionSource, '.contact__social'), [
      ['display', 'flex'],
      ['flex-direction', 'column'],
      ['gap', '1rem'],
      ['padding', '1.5rem'],
      ['border-radius', 'var(--radius-2xl)'],
      ['background-color', 'rgba(255, 255, 255, 0.45)'],
      ['-webkit-backdrop-filter', 'blur(24px)'],
      ['backdrop-filter', 'blur(24px)'],
      ['border', '1px solid rgba(255, 255, 255, 0.7)'],
      [
        'box-shadow',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      ],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__social-label'), [
      ['font-family', 'var(--font-body)'],
      ['font-size', 'var(--text-label-sm-size)'],
      ['line-height', 'var(--text-label-sm-line-height)'],
      ['font-weight', '500'],
      ['letter-spacing', '0.1em'],
      ['text-transform', 'uppercase'],
      ['color', 'var(--color-slate-500)'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__profiles'), [
      ['display', 'flex'],
      ['flex-wrap', 'wrap'],
      ['gap', '0.5rem'],
      ['margin', '0'],
      ['padding', '0'],
      ['list-style', 'none'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__profile-link'), [
      ['display', 'inline-flex'],
      ['align-items', 'center'],
      ['gap', '0.375rem'],
      ['padding', '0.375rem 0.875rem'],
      ['border-radius', 'var(--radius-lg)'],
      ['background-color', 'rgba(255, 255, 255, 0.6)'],
      ['-webkit-backdrop-filter', 'blur(12px)'],
      ['backdrop-filter', 'blur(12px)'],
      ['border', '1px solid rgba(255, 255, 255, 0.8)'],
      ['color', 'var(--color-slate-800)'],
      ['font-family', 'var(--font-body)'],
      ['font-size', 'var(--text-label-md-size)'],
      ['line-height', 'var(--text-label-md-line-height)'],
      ['font-weight', 'var(--text-label-md-weight)'],
      ['letter-spacing', 'var(--text-label-md-letter-spacing)'],
      ['box-shadow', '0 1px 2px 0 rgba(0, 0, 0, 0.05)'],
      ['transition', 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'],
    ]);

    expectDeclarations(
      extractRule(sectionSource, '.contact__profile-link:hover'),
      [
        ['background-color', 'rgba(255, 255, 255, 0.85)'],
        ['border-color', 'rgba(53, 37, 205, 0.4)'],
        ['transform', 'translateY(-0.125rem)'],
      ],
    );
  });

  it('styles_form_panel', () => {
    const baseSource = normalize(sectionSource).replace(
      extractMediaBlock(sectionSource, 1024),
      '',
    );

    expectDeclarations(extractRule(baseSource, '.contact__form-panel'), [
      ['padding', '2rem'],
      ['border-radius', 'var(--radius-2xl)'],
      ['background-color', 'rgba(255, 255, 255, 0.5)'],
      ['-webkit-backdrop-filter', 'blur(24px)'],
      ['backdrop-filter', 'blur(24px)'],
      ['border', '1px solid rgba(255, 255, 255, 0.7)'],
      [
        'box-shadow',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      ],
      ['transition', 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'],
    ]);

    expectDeclarations(
      extractRule(sectionSource, '.contact__form-panel:hover'),
      [['border-color', 'rgba(165, 180, 252, 0.8)']],
    );
  });

  it('styles_form_fields', () => {
    expectDeclarations(extractRule(sectionSource, '.contact__input'), [
      ['width', '100%'],
      ['height', '3rem'],
      ['padding-inline', '1rem'],
      ['border-radius', 'var(--radius-xl)'],
      ['background-color', 'rgba(255, 255, 255, 0.6)'],
      ['-webkit-backdrop-filter', 'blur(12px)'],
      ['backdrop-filter', 'blur(12px)'],
      ['border', '1px solid rgba(255, 255, 255, 0.8)'],
      ['color', 'var(--color-slate-900)'],
      ['font-family', 'inherit'],
      ['font-size', 'var(--text-body-md-size)'],
      ['line-height', 'var(--text-body-md-line-height)'],
      ['font-weight', '300'],
      ['box-shadow', '0 1px 2px 0 rgba(0, 0, 0, 0.05)'],
      ['transition', 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'],
    ]);

    expectDeclarations(extractRule(sectionSource, '.contact__textarea'), [
      ['width', '100%'],
      ['padding', '1rem'],
      ['border-radius', 'var(--radius-xl)'],
      ['background-color', 'rgba(255, 255, 255, 0.6)'],
      ['-webkit-backdrop-filter', 'blur(12px)'],
      ['backdrop-filter', 'blur(12px)'],
      ['border', '1px solid rgba(255, 255, 255, 0.8)'],
      ['color', 'var(--color-slate-900)'],
      ['font-family', 'inherit'],
      ['font-size', 'var(--text-body-md-size)'],
      ['line-height', 'var(--text-body-md-line-height)'],
      ['font-weight', '300'],
      ['resize', 'none'],
      ['box-shadow', '0 1px 2px 0 rgba(0, 0, 0, 0.05)'],
      ['transition', 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'],
    ]);

    expectDeclarations(
      extractRule(sectionSource, '.contact__input::placeholder'),
      [['color', 'var(--color-slate-400)']],
    );

    expectDeclarations(
      extractRule(sectionSource, '.contact__textarea::placeholder'),
      [['color', 'var(--color-slate-400)']],
    );

    for (const selector of [
      '.contact__input:focus',
      '.contact__textarea:focus',
    ]) {
      expectDeclarations(extractRule(sectionSource, selector), [
        ['border-color', 'var(--color-indigo-500)'],
        ['background-color', 'rgba(255, 255, 255, 0.9)'],
        ['box-shadow', '0 0 0 4px rgba(99, 102, 241, 0.15)'],
      ]);
    }

    expect(sectionSource).not.toMatch(/outline:\s*none/);
  });
});
