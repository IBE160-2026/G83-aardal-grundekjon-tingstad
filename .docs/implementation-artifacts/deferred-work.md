- source_spec: `.docs/implementation-artifacts/spec-1-1-runnable-project-skeleton.md`
  summary: Add a CI workflow (GitHub Actions) that runs lint, format check, typecheck, Vitest and Playwright on every pull request.
  evidence: `.github/` does not exist; checks run only by hand, so nothing enforces "ESLint + Prettier pass before every PR" (epic context) or gives PR evidence for the process criteria. Not part of Story 1.1's acceptance criteria.
