import { readFileSync, readdirSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HeroSection from '../src/components/HeroSection.astro';
import {
  COPY_SUCCESS_MESSAGE,
  TOAST_HIDE_DELAY_MS,
  TOAST_VISIBLE_CLASS,
  copyToClipboard,
  showToast,
  type ClipboardWriter,
  type ToastView,
} from '../src/scripts/clipboard';
import { CONTACT_EMAIL } from '../src/site-constants';

const sourceRoot = new URL('../src/', import.meta.url);

const clipboardSource = readFileSync(
  new URL('scripts/clipboard.ts', sourceRoot),
  'utf8',
);
const heroSource = readFileSync(
  new URL('components/HeroSection.astro', sourceRoot),
  'utf8',
);

function collectSourceFiles(directory: URL): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryUrl = new URL(entry.name, directory);
    return entry.isDirectory()
      ? collectSourceFiles(new URL(`${entry.name}/`, directory))
      : [entryUrl];
  });
}

function createFakeClipboard(): {
  clipboard: ClipboardWriter;
  written: string[];
} {
  const written: string[] = [];

  return {
    written,
    clipboard: {
      writeText: async (text: string) => {
        written.push(text);
      },
    },
  };
}

function createFakeToastView(): {
  view: ToastView;
  visibleClasses: Set<string>;
  getMessage: () => string;
} {
  const visibleClasses = new Set<string>();
  const message = { textContent: '' as string | null };

  return {
    visibleClasses,
    getMessage: () => message.textContent ?? '',
    view: {
      container: {
        classList: {
          add: (token: string) => visibleClasses.add(token),
          remove: (token: string) => visibleClasses.delete(token),
        },
      },
      message,
    },
  };
}

describe('clipboard enhancement', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('copies_contact_email_to_clipboard', async () => {
    const { clipboard, written } = createFakeClipboard();
    const onSuccess = vi.fn();

    const result = await copyToClipboard(CONTACT_EMAIL, onSuccess, clipboard);

    expect(result).toBe(true);
    expect(written).toEqual([CONTACT_EMAIL]);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(clipboardSource).toContain('navigator.clipboard');
    expect(clipboardSource).toContain('writeText');
  });

  it('imports_shared_contact_email', async () => {
    const compactHeroSource = heroSource.replace(/\s+/g, '');

    expect(compactHeroSource).toContain(
      "import{CONTACT_EMAIL}from'../site-constants';",
    );
    expect(heroSource).toContain('data-email={CONTACT_EMAIL}');
    expect(compactHeroSource).toContain(
      'document.querySelector<HTMLButtonElement>(',
    );
    expect(compactHeroSource).toContain("'#copy-email-hero-btn'");
    expect(heroSource).toContain("button.addEventListener('click'");
    expect(heroSource).toContain('button.dataset.email');
    expect(heroSource).toContain("from '../scripts/clipboard'");
    expect(heroSource).not.toContain('onclick=');
    expect(heroSource).not.toContain('carlosolcina23@gmail.com');

    const container = await AstroContainer.create();
    const html = await container.renderToString(HeroSection);

    expect(html).toContain('id="copy-email-hero-btn"');
    expect(html).toContain(`data-email="${CONTACT_EMAIL}"`);
  });

  it('handles_clipboard_rejection', async () => {
    const onSuccess = vi.fn();
    const rejectingWriter: ClipboardWriter = {
      writeText: async () => {
        throw new Error('Clipboard permission denied');
      },
    };

    const rejected = await copyToClipboard(
      CONTACT_EMAIL,
      onSuccess,
      rejectingWriter,
    );
    expect(rejected).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();

    const unavailable = await copyToClipboard(CONTACT_EMAIL, onSuccess);
    expect(unavailable).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows_toast_with_copy_message', () => {
    vi.useFakeTimers();
    const { view, visibleClasses, getMessage } = createFakeToastView();

    showToast(view);

    expect(COPY_SUCCESS_MESSAGE).toBe('Correo copiado al portapapeles');
    expect(getMessage()).toBe('Correo copiado al portapapeles');
    expect(visibleClasses.has(TOAST_VISIBLE_CLASS)).toBe(true);
  });

  it('hides_toast_after_2600ms', () => {
    vi.useFakeTimers();
    const { view, visibleClasses } = createFakeToastView();

    showToast(view);
    vi.advanceTimersByTime(TOAST_HIDE_DELAY_MS - 1);
    expect(visibleClasses.has(TOAST_VISIBLE_CLASS)).toBe(true);

    vi.advanceTimersByTime(1);
    expect(TOAST_HIDE_DELAY_MS).toBe(2600);
    expect(visibleClasses.has(TOAST_VISIBLE_CLASS)).toBe(false);
  });

  it('restarts_hide_timer_on_new_show', () => {
    vi.useFakeTimers();
    const { view, visibleClasses } = createFakeToastView();

    showToast(view);
    vi.advanceTimersByTime(2000);
    showToast(view);
    vi.advanceTimersByTime(2000);
    expect(visibleClasses.has(TOAST_VISIBLE_CLASS)).toBe(true);

    vi.advanceTimersByTime(600);
    expect(visibleClasses.has(TOAST_VISIBLE_CLASS)).toBe(false);
  });

  it('defines_contact_email_once', async () => {
    const occurrences = collectSourceFiles(sourceRoot).flatMap(
      (fileUrl) =>
        readFileSync(fileUrl, 'utf8').match(/carlosolcina23@gmail\.com/g) ?? [],
    );

    expect(occurrences).toHaveLength(1);

    const constantsSource = readFileSync(
      new URL('site-constants.ts', sourceRoot),
      'utf8',
    );
    expect(constantsSource).toContain(
      "export const CONTACT_EMAIL = 'carlosolcina23@gmail.com';",
    );
    expect(heroSource).not.toContain('carlosolcina23@gmail.com');
    expect(clipboardSource).not.toContain('carlosolcina23@gmail.com');

    const container = await AstroContainer.create();
    const html = await container.renderToString(HeroSection);

    expect(html).toContain(`data-email="${CONTACT_EMAIL}"`);
  });
});
