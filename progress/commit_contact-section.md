# Commit — feature contact-section (id 9)

- **Scope:** single atomic commit for the complete `contact-section`
  increment: shared email constant, profiles JSON collection + schema +
  seeds, section component, tests, SDD spec, evidence and session
  bookkeeping.
- **Committer:** commits agent, 2026-10-01.
- **Pre-commit check:** `pnpm validate` green — lint + `astro check`
  (35 files, 0 errors) + `pnpm test` (17 files, 197/197 tests) + build;
  `pnpm format:check` green.
- **Context:** a git mishap recreated this branch from `main` and reverted the
  tracked-file modifications; they were re-applied from the surviving spec,
  implementation report and untracked files (see `progress/history.md`).
- **Result:** 1 commit on branch `feat/contact-section`; branch pushed and PR
  opened to `main`.

## Files committed

Modified:

- `feature_list.json` — feature `contact-section` (id 9) added and marked
  `done`.
- `progress/history.md` — 2026-10-01 contact-section session summary, including
  the git mishap and the re-implementation note.
- `progress/current.md` — emptied after the session close.
- `src/components/HeroSection.astro` — local constant replaced by the shared
  `CONTACT_EMAIL` import.
- `src/content.config.ts` — adds the `profiles` JSON collection (glob loader +
  schema) and the extended `collections` export; `projects` and `technologies`
  untouched.
- `src/pages/index.astro` — loads `getCollection('profiles')` and renders
  `<ContactSection />` after `<TechnologiesSection />`.
- `tests/clipboard.test.ts` — shared-constant assertions (R11-R13).
- `tests/index.test.ts` — collection-aware `astro:content` mock and the
  two-bundled-scripts budget (R39).
- `tests/projects-section.test.ts` — collection-aware mock (profiles branch
  returns `[]`).
- `tests/projects-schema.test.ts`, `tests/technologies-schema.test.ts` — the
  `collections` assertion now includes `profiles`, a mechanical consequence of
  R1 (deviation documented in the implementation report).

New (untracked before this commit):

- `specs/contact-section/{requirements,design,tasks}.md` — approved SDD spec
  (R1-R42, traceability, all 37 tasks `[x]`).
- `src/site-constants.ts` — the single `CONTACT_EMAIL` literal under `src/`.
- `src/content/profiles-schema.ts` — `profilesSchema`, `ProfileData`,
  `assertUniqueProfiles`, `sortProfiles`.
- `src/content/profiles/{github,linkedin,x}.json` — seed entries with exactly
  `id`, `title` and `url` (placeholder URLs).
- `src/components/ContactSection.astro` — section shell, header, options
  column, presentation-only form and clipboard wiring; one bundled script, no
  island.
- `tests/profiles-schema.test.ts`, `tests/profiles-content.test.ts`,
  `tests/contact-section.test.ts` — R1-R42 coverage.
- `progress/impl_contact-section.md`, `progress/review_contact-section.md` —
  evidence.
- `progress/commit_contact-section.md` — this report (same commit).

## Commit message used

```
feat(contact-section): add contact section with profiles collection

Add the fourth increment from the Stitch "Full Chromatic Glass" design:
the contact section on the home page (anchor #contact) with the mockup
header ("Contacto y Colaboracion", "Construyamos algo increible
juntos"), a click-to-copy direct email card, a "Redes y Perfiles" card
and a presentation-only contact form.

Profiles are content: a new Zod-validated JSON collection `profiles`
with exactly id (UUID), title and url per entry, seeded with GitHub,
LinkedIn and X (placeholder URLs to be replaced by the human). Entries
render sorted by title and duplicate ids abort the build with an
explicit error. The direct email card reuses the hero clipboard/toast
enhancement, and the contact email now lives in a single shared
`CONTACT_EMAIL` constant (src/site-constants.ts) imported by both
HeroSection and ContactSection, leaving one literal under src/.

The form ships as UI only: no submission handler, no success banner and
no speculative hooks; the message logic is deferred to a future feature.

Scope excludes the mockup's Cal.com booking card, the experience/about
section (the human has no experience data), nav, footer, WebGL shader
and new dependencies.

197 tests green across 17 files tracing R1-R42; pnpm validate green
(lint + check + test + build). Reviewer verdict APPROVED.

Spec and evidence: specs/contact-section/,
progress/impl_contact-section.md, progress/review_contact-section.md.
```

## Warnings / notes

- Profile seed URLs are mockup placeholders; replacing them is a JSON-only
  edit.
- The contact form is presentation-only (R36); the messages logic remains a
  future feature.
- Feature 8 `remove-technologies-quote` is intentionally not part of this
  branch: it lives in `feat/remove-tecnologies-text`.
- No secrets or build artifacts included; `.gitignore` covers `dist/`,
  `.astro/`, `coverage/`, `node_modules/` and env files.
