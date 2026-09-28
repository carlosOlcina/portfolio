import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Declaration = readonly [property: string, value: string];
type ScaleEntry = readonly [
  entry: string,
  size: string,
  lineHeight: string,
  letterSpacing: string,
  weight: string,
];

const tokensCss = readFileSync(
  new URL('../src/styles/tokens.css', import.meta.url),
  'utf8',
);
const normalizedTokens = tokensCss.replace(/\s+/g, ' ').trim();

function expectDeclarations(declarations: ReadonlyArray<Declaration>): void {
  for (const [property, value] of declarations) {
    expect(normalizedTokens, `expected ${property}: ${value}`).toContain(
      `${property}: ${value};`,
    );
  }
}

describe('design tokens', () => {
  it('exposes_semantic_color_tokens', () => {
    const semanticColors: ReadonlyArray<Declaration> = [
      ['--color-background', '#f8f9ff'],
      ['--color-surface', '#f8f9ff'],
      ['--color-surface-dim', '#cbdbf5'],
      ['--color-surface-bright', '#f8f9ff'],
      ['--color-surface-container-lowest', '#ffffff'],
      ['--color-surface-container-low', '#eff4ff'],
      ['--color-surface-container', '#e5eeff'],
      ['--color-surface-container-high', '#dce9ff'],
      ['--color-surface-container-highest', '#d3e4fe'],
      ['--color-surface-variant', '#d3e4fe'],
      ['--color-on-surface', '#0b1c30'],
      ['--color-on-surface-variant', '#464555'],
      ['--color-on-background', '#0b1c30'],
      ['--color-outline', '#777587'],
      ['--color-outline-variant', '#c7c4d8'],
      ['--color-primary', '#3525cd'],
      ['--color-on-primary', '#ffffff'],
      ['--color-primary-container', '#4f46e5'],
      ['--color-on-primary-container', '#dad7ff'],
      ['--color-secondary', '#5d5e64'],
      ['--color-on-secondary', '#ffffff'],
      ['--color-secondary-container', '#dfdfe6'],
      ['--color-on-secondary-container', '#616269'],
      ['--color-tertiary', '#3130c0'],
      ['--color-on-tertiary', '#ffffff'],
      ['--color-tertiary-container', '#4b4dd8'],
      ['--color-on-tertiary-container', '#d9d8ff'],
      ['--color-error', '#ba1a1a'],
      ['--color-error-container', '#ffdad6'],
      ['--color-on-error', '#ffffff'],
      ['--color-on-error-container', '#93000a'],
    ];

    expect(semanticColors).toHaveLength(31);
    expectDeclarations(semanticColors);
  });

  it('exposes_page_palette_color_tokens', () => {
    const paletteColors: ReadonlyArray<Declaration> = [
      ['--color-indigo-700', '#4338ca'],
      ['--color-indigo-600', '#4f46e5'],
      ['--color-indigo-500', '#6366f1'],
      ['--color-indigo-400', '#818cf8'],
      ['--color-indigo-300', '#a5b4fc'],
      ['--color-indigo-200', '#c7d2fe'],
      ['--color-violet-500', '#8b5cf6'],
      ['--color-slate-900', '#0f172a'],
      ['--color-slate-800', '#1e293b'],
      ['--color-slate-700', '#334155'],
      ['--color-slate-500', '#64748b'],
      ['--color-slate-400', '#94a3b8'],
      ['--color-slate-300', '#cbd5e1'],
    ];

    expect(paletteColors).toHaveLength(13);
    expectDeclarations(paletteColors);
  });

  it('exposes_font_family_tokens', () => {
    expectDeclarations([
      ['--font-headline', "'Newsreader Variable', Newsreader, serif"],
      [
        '--font-body',
        "'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', sans-serif",
      ],
    ]);
  });

  it('exposes_typography_scale_tokens', () => {
    const scale: ReadonlyArray<ScaleEntry> = [
      ['headline-xl', '3.75rem', '1.08', '-0.03em', '400'],
      ['headline-xl-mobile', '2.25rem', '1.15', '-0.025em', '400'],
      ['headline-lg', '2.5rem', '1.15', '-0.025em', '400'],
      ['headline-lg-mobile', '1.85rem', '1.2', '-0.02em', '400'],
      ['headline-md', '1.75rem', '1.25', '-0.02em', '400'],
      ['headline-sm', '1.25rem', '1.35', '-0.015em', '500'],
      ['body-lg', '1.125rem', '1.65', '-0.01em', '400'],
      ['body-md', '0.875rem', '1.6', '-0.005em', '400'],
      ['body-sm', '0.75rem', '1.5', '0.01em', '400'],
      ['label-md', '0.8125rem', '1.2', '0.03em', '500'],
      ['label-sm', '0.6875rem', '1.2', '0.06em', '500'],
    ];

    expect(scale).toHaveLength(11);
    for (const [entry, size, lineHeight, letterSpacing, weight] of scale) {
      expectDeclarations([
        [`--text-${entry}-size`, size],
        [`--text-${entry}-line-height`, lineHeight],
        [`--text-${entry}-letter-spacing`, letterSpacing],
        [`--text-${entry}-weight`, weight],
      ]);
    }
  });

  it('exposes_spacing_tokens', () => {
    const spacing: ReadonlyArray<Declaration> = [
      ['--space-gutter', '1.5rem'],
      ['--space-gutter-sm', '1rem'],
      ['--space-margin', '2rem'],
      ['--space-margin-sm', '1rem'],
      ['--space-xs', '0.25rem'],
      ['--space-sm', '0.5rem'],
      ['--space-md', '1rem'],
      ['--space-lg', '1.5rem'],
      ['--space-xl', '2.5rem'],
    ];

    expect(spacing).toHaveLength(9);
    expectDeclarations(spacing);
  });

  it('exposes_radius_tokens', () => {
    const radii: ReadonlyArray<Declaration> = [
      ['--radius-default', '0.25rem'],
      ['--radius-lg', '0.5rem'],
      ['--radius-xl', '0.75rem'],
      ['--radius-2xl', '1rem'],
      ['--radius-full', '9999px'],
    ];

    expect(radii).toHaveLength(5);
    expectDeclarations(radii);
  });
});
