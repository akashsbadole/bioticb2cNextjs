# Contributing to WCommerce Catalogue

Thank you for your interest in contributing! This document explains how to get
started and the conventions we follow.

## Getting Started

1. Fork and clone the repository.
2. Install dependencies: `npm install`
3. Set up your environment: copy `.env.example` to `.env` and fill in values.
4. Run the development server: `npm run dev`
5. Run the database migrations: `npx prisma migrate dev`

## Branch Naming

Use short, descriptive branches prefixed by intent:

- `feat/...` — new feature
- `fix/...` — bug fix
- `chore/...` — maintenance, tooling
- `docs/...` — documentation only
- `refactor/...` — code restructuring without behavior change

Example: `feat/low-stock-alerts`, `fix/order-number-collision`.

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
Scope is optional (e.g. `auth`, `orders`, `email`).

## Pull Requests

- Keep PRs focused — one logical change per PR.
- Ensure `npx tsc --noEmit` and `npm run lint` pass before opening a PR.
- Add or update tests when you change behavior.
- Reference the related issue in the PR description (e.g. `Closes #123`).
- Update `CHANGELOG.md` under the appropriate `Unreleased` section.

## Code Style

- TypeScript with strict mode is enabled — no `any` unless unavoidable.
- Prefer the existing patterns in the codebase:
  - Centralized string literals live in `src/lib/constants.ts`.
  - All API responses must use `src/lib/api-response.ts` helpers
    (`ok`, `error`, `notFound`, `serverError`, etc.).
  - All emails go through `src/lib/email.ts`.
  - Environment access must use `src/lib/env.ts` (`getEnv()`), never `process.env` directly.
- Run `npm run lint` (ESLint) and format with Prettier before committing.

## Testing

- Unit tests live next to the code or under `__tests__`.
- Run the suite with `npm test`.
- Add a test for any new public function or route.

## Reporting Bugs

Open an issue with:

- Steps to reproduce
- Expected vs. actual behavior
- Environment (OS, Node version, browser if relevant)
- Relevant logs (redact secrets)
