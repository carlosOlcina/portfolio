# Commit — footer copyright year update to 2026

- **Scope:** follow-up to feature 10 `footer-section` on the same branch and
  PR after the human overrode the year-untouched decision: the static
  copyright text becomes `© 2026 Carlos Olcina. Todos los derechos
reservados.` (no dynamic year, no new code paths).
- **Committer:** commits agent, 2026-10-01.
- **Pre-commit check:** `pnpm validate` green — lint + `astro check`
  (37 files, 0 errors) + `pnpm test` (18 files, 214/214 tests) + build;
  `pnpm exec prettier --check .` green; no `2025` left under `src/` or
  `tests/`.
- **Result:** 1 follow-up commit on `feat/implement-footer`; pushed, so PR
  #10 updates and CI re-runs.

## Files committed

- `src/components/FooterSection.astro` — copyright year 2025 → 2026 (only
  change).
- `tests/footer-section.test.ts` — `renders_identity_texts` regex now expects
  `© 2026`.
- `specs/footer-section/requirements.md` — R5 verification annotated plus a
  dated `## Amendments` entry (R5 effective text; no renumbering; original
  `© 2025` statements kept as history).
- `specs/footer-section/design.md` — text contract updated to 2026; superseded
  mentions in §1, decision 12, the rejected-alternatives table and §10 annotated
  with the amendment date.
- `feature_list.json` — feature 10 description year updated to 2026
  (prettier-formatted).
- `progress/history.md` — appended note to the footer session entry
  (append-only).
- `progress/impl_footer-section.md` — appended post-review update section.
- `progress/commit_footer-year-2026.md` — this report (same commit).

## Commit message used

```
fix(footer-section): update copyright year to 2026

Apply the human's same-day override: the footer identity block now
renders "© 2026 Carlos Olcina. Todos los derechos reservados." as static
text, replacing the mockup's 2025 that the approved spec had kept
verbatim.

Update the R5 expectation in tests/footer-section.test.ts and amend the
footer-section spec with a dated amendment (original 2025 statements
kept as history; no requirement renumbered). The design contract and the
feature list are updated accordingly, and append-only notes record the
change in progress/history.md and progress/impl_footer-section.md. No
dynamic year, no new dependencies and no client JavaScript.

214 tests green across 18 files; pnpm validate and prettier --check
green.
```

## Warnings / notes

- `specs/footer-section/tasks.md` is intentionally untouched: it is the
  historical execution record of the original plan.
- Remaining `2025` references in `specs/footer-section` and
  `progress/history.md` are historical; the effective text is defined by the
  dated amendment.
- No secrets or build artifacts included.
