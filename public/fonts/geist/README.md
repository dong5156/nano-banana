Self-hosted Geist Fonts
=======================

Place the following variable font files in this folder so the app can serve them locally:

- Geist[wght].woff2
- GeistMono[wght].woff2

They are referenced by CSS in `app/globals.css` via:

@font-face for `Geist` and `Geist Mono` pointing to `/fonts/geist/Geist[wght].woff2` and `/fonts/geist/GeistMono[wght].woff2`.

Suggested sources (official):
- Vercel Geist font repo: https://github.com/vercel/geist-font
  - Variable fonts for sans and mono families.

After placing files, run `pnpm dev` or `pnpm build` to verify. If the files are missing, the site will gracefully fall back to system fonts.

