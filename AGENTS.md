# Repository Guidelines

## Project Structure & Module Organization
- Next.js (App Router) with TypeScript and Tailwind CSS.
- Source lives in `app/` (routes, layout), `components/` (UI + sections) and `components/ui/` (reusable primitives), plus `hooks/` and `lib/`.
- Static assets in `public/`.
- Config: `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `components.json`.
- Import alias: use `@/*` to reference from repo root (see `tsconfig.json`).

## Build, Test, and Development Commands
- `pnpm dev` — start local dev server.
- `pnpm build` — production build (`next build`).
- `pnpm start` — run the built app.
- `pnpm lint` — run ESLint on the repo.
Notes: If you prefer npm, replace `pnpm <cmd>` with `npm run <cmd>`.

## Coding Style & Naming Conventions
- TypeScript strict mode; keep components typed. Prefer explicit props types.
- Indentation: 2 spaces; line width ~100 chars.
- React: components in PascalCase (e.g., `Header`), files kebab-case (e.g., `editor-section.tsx`).
- Co-locate UI primitives in `components/ui/`; feature sections in `components/`.
- Tailwind CSS for styling; keep class lists readable and factor repeated patterns into components/utilities.

## Testing Guidelines
- No test harness is included yet. If adding tests, prefer Vitest or Jest + React Testing Library.
- Place tests under `tests/` or `__tests__/`; name files `*.test.ts[x]`.
- Aim for component tests of critical UI and basic integration of pages.

## Commit & Pull Request Guidelines
- Use Conventional Commits (e.g., `feat: add carousel`, `fix(ui): correct button focus state`).
- PRs: include a concise description, screenshots for UI changes, and link related issues.
- Keep PRs scoped and incremental; ensure `pnpm build` and `pnpm lint` pass locally.

## Security & Configuration Tips
- Don’t commit secrets. Use environment variables when introducing server-side features.
- `next.config.mjs` sets `typescript.ignoreBuildErrors` — run `pnpm lint` to catch type issues early.
- Images are `unoptimized`; prefer static assets in `public/` or Next/Image if optimization is enabled later.
