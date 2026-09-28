# Commit — feature hero-section (id 2)

- **Scope:** single atomic commit for the complete `hero-section` increment:
  implementation, tests, SDD spec + references, evidence and session bookkeeping.
- **Committer:** `committer` subagent, 2026-09-28.
- **Pre-commit check:** `pnpm test` → 7 files, 42/42 tests passed.
- **Result:** 1 commit on `main`; no push, no amend.

## Files committed

Modified:

- `feature_list.json` — feature `hero-section` marked `done`.
- `package.json` — Fontsource variables added (`@fontsource-variable/newsreader`,
  `@fontsource-variable/plus-jakarta-sans`).
- `pnpm-lock.yaml` — lockfile entries for the two Fontsource packages.
- `progress/current.md` — English template after session close.
- `progress/history.md` — 2026-09-28 hero-section session summary.
- `src/pages/index.astro` — rewritten to use `BaseLayout` + `HeroSection`.
- `tests/index.test.ts` — page integration assertions (extended).

New (untracked before this commit):

- `specs/hero-section/requirements.md`, `design.md`, `tasks.md` — approved SDD spec.
- `specs/hero-section/references/chromatic-glass.html`,
  `references/chromatic-glass.png`, `references/design-notes.md`,
  `references/shader.html` — Stitch design evidence.
- `src/components/HeroSection.astro` — hero markup, styles and texts.
- `src/layouts/BaseLayout.astro` — base document shell (meta, fonts, global CSS).
- `src/scripts/clipboard.ts` — dependency-free copy-email + toast enhancement.
- `src/styles/tokens.css`, `src/styles/global.css` — design tokens and base styles.
- `tests/tokens.test.ts`, `tests/fonts.test.ts`, `tests/global-styles.test.ts`,
  `tests/hero.test.ts`, `tests/clipboard.test.ts`, `tests/toast.test.ts`,
  `tests/node-shims.d.ts` — R1–R40 coverage.
- `progress/impl_hero-section.md`, `progress/review_hero-section.md` — evidence.
- `progress/commit_hero-section.md` — this report (same commit).

## Commit message used

```
feat(hero-section): add chromatic glass hero with tokens, Fontsource fonts and clipboard enhancement

Add the first UI increment from the Stitch "Full Chromatic Glass" design:
global design tokens (colors, typography, spacing, animations) in
src/styles/, Newsreader and Plus Jakarta Sans variable fonts bundled from
Fontsource, and a BaseLayout that consumes both.

Implement the hero section with its colors, animations and texts, the CSS
atmospheric blooms and a dependency-free clipboard enhancement for the
"Copiar Correo" CTA that copies the contact email and shows the design
toast.

Scope excludes the WebGL shader background, floating nav, remaining
sections and footer.

42 tests green across 7 files (tokens, fonts, global styles, hero,
clipboard, toast, index); pnpm validate green (lint + check + test +
build).

Spec and evidence: specs/hero-section/, progress/impl_hero-section.md,
progress/review_hero-section.md.
```

## Warnings / notes

- `specs/hero-section/references/chromatic-glass.png` actually contains JPEG
  data (161x512 thumbnail) despite the `.png` extension. Kept as-is because the
  spec/review already reference it under that name and flag it as unusable for
  pixel comparison; renaming is out of this commit's scope.
- Nothing unintended staged: all staged paths belong to the `hero-section`
  scope; no `dist/`, `.astro/`, `.opencode/`, `.env*` or secret files; no temp
  files.
- No remote operation performed (no push); existing commits untouched.
