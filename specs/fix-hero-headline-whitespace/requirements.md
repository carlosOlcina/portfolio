# Requirements — fix-hero-headline-whitespace

- **Feature:** `fix-hero-headline-whitespace` (id 7, `sdd: true`).
- **Type:** bugfix on the done `hero-section` feature (id 2); no redesign, no new dependency.
- **Bug:** exposed by the `pull_request` run of PR #7 (run `36712669304`) after main upgraded to Astro 7 (`astro ^7.2.8`, PR #5): the compiler strips the whitespace between the hero headline text and the accent span, so `src/components/HeroSection.astro` renders `…intersección de<span class="hero__headline-accent">ingeniería e IA.</span>`. The headline visually reads "deingeniería" and `tests/hero.test.ts` → `renders_verbatim_hero_texts` (line 92) fails.
- **Verified root cause:** in Astro 7 the default of `compressHTML` changed from `true` (HTML-aware) to `'jsx'` (JSX rules), which strips whitespace around elements; the separating space in `src/components/HeroSection.astro` (source lines 8–11) exists only as incidental template whitespace and is removed. Astro's upgrade guide documents the remedy: include the wanted space explicitly in the source (e.g. `{" "}`). The local branch still had Astro 6 and the old lockfile, which is why the test was green locally.
- **In scope:** the explicit space emission in `src/components/HeroSection.astro` and the mechanism-regression additions in `tests/hero.test.ts` (additions only; the strict contract body stays untouched).
- **Out of scope:** CI workflow changes (`.github/workflows/ci.yml` and `tests/ci-workflow.test.ts` already pass); `astro.config.mjs` / `compressHTML` changes; any other headline text, markup, class, style rule or client-side script; the branch sync, the id renumbering (technologies-section 5 / ci-github-action 6 / this fix 7) and the command gates — those live in `design.md` and `tasks.md`.

**Notation.** Every requirement uses EARS and contains exactly one `MUST` / `MUST NOT`. Ids `R<n>` are stable. Every requirement is verified by at least one concrete, deterministic Vitest test in `tests/hero.test.ts` (Astro Container API, offline, no new dependencies).

---

## 1. Headline spacing under the upgraded compiler

### R1 — Rendered headline contains one visible space

WHEN `HeroSection` is rendered by the Astro compiler, the system MUST emit exactly one regular ASCII space (U+0020) between the text `intersección de` and the opening `<span class="hero__headline-accent">`, so the rendered headline reads `Desarrollo digital en la intersección de ingeniería e IA.` and never `intersección de<span`.

**Verification:** `tests/hero.test.ts` → `emits_explicit_headline_space` (new; extracts the raw `intersección de(.)<span` junction from the Container API output and asserts the captured character is U+0020) and `renders_verbatim_hero_texts` (pre-existing; whitespace-normalized output contains `Desarrollo digital en la intersección de <span`).

### R2 — Space emitted explicitly in the component

The system MUST express the separating space in `src/components/HeroSection.astro` through an explicit space-producing template construct (an Astro expression text node rendering a single space, e.g. `{' '}`), rather than through incidental literal whitespace between the text and the `<span>`.

**Verification:** `tests/hero.test.ts` → `emits_explicit_headline_space` (new; asserts the explicit construct between `intersección de` and `<span` in the component source read from disk).

### R3 — Strict verbatim contract unchanged

The system MUST NOT change the existing assertions of `tests/hero.test.ts` → `renders_verbatim_hero_texts` (its expected substrings, including `Desarrollo digital en la intersección de <span` and `>ingeniería e IA.</span>`, and its whitespace normalization stay exactly as they are).

**Verification:** `tests/hero.test.ts` → `renders_verbatim_hero_texts` (pre-existing test, body byte-identical in the diff) plus the task 6.8 diff review of `tests/hero.test.ts` (additions only).

### R4 — Strict contract green under the merged Astro 7 dependency set

WHEN the test suite runs with the dependency set merged from `main` (Astro `^7.2.8` installed from the merged `pnpm-lock.yaml`), `tests/hero.test.ts` → `renders_verbatim_hero_texts` MUST pass.

**Verification:** `pnpm install --frozen-lockfile` followed by `pnpm exec vitest run tests/hero.test.ts` on the synced branch; the task 2.2 pre-fix red baseline and the post-fix green run are recorded in `progress/current.md`.

### R5 — No other hero or page regression

The system MUST NOT change any other rendered markup, text, class name, style rule or client-side script of `src/components/HeroSection.astro`, so every pre-existing test in `tests/hero.test.ts` and `tests/index.test.ts` keeps passing with unchanged bodies.

**Verification:** all pre-existing tests in `tests/hero.test.ts` and `tests/index.test.ts`, unchanged bodies (`renders_hero_structure`, `styles_hero_headline`, `ships_only_clipboard_enhancement`, `renders_exactly_one_h1`, among others), green in the full `pnpm test` gate.

---

## Traceability

| Requirement | Test file                                   | Test name                                                                           |
| ----------- | ------------------------------------------- | ----------------------------------------------------------------------------------- |
| R1          | `tests/hero.test.ts`                        | `emits_explicit_headline_space` (new), `renders_verbatim_hero_texts` (pre-existing) |
| R2          | `tests/hero.test.ts`                        | `emits_explicit_headline_space` (new)                                               |
| R3          | `tests/hero.test.ts`                        | `renders_verbatim_hero_texts` (pre-existing, body unchanged)                        |
| R4          | `tests/hero.test.ts`                        | `renders_verbatim_hero_texts` under the merged Astro 7 install                      |
| R5          | `tests/hero.test.ts`, `tests/index.test.ts` | all pre-existing tests, unchanged bodies                                            |

## Feature description coverage

| Feature description item (id 7)                                              | Requirements                                                         |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Astro 7 trims the whitespace between the headline text and the accent span   | R1, R2                                                               |
| Renders `intersección de<span>ingeniería` — visual regression "deingeniería" | R1                                                                   |
| Emit the space explicitly in `src/components/HeroSection.astro`              | R2                                                                   |
| The strict verbatim contract (`renders_verbatim_hero_texts`) holds           | R1, R3, R4                                                           |
| No other hero/page regression                                                | R5                                                                   |
| Branch sync, id renumbering (5/6/7), Astro 7 reinstall and green gates       | Out of scope for requirements; see `design.md` §6–§10 and `tasks.md` |
| Excludes CI workflow changes                                                 | Out of scope (`design.md` §3; scope check task 6.7)                  |
