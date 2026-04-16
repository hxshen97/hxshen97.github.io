# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server at http://localhost:4321
npm run build      # Build to ./dist/
npm run preview    # Preview production build locally
```

Requires Node >=22.12.0. Deployment is automatic via GitHub Actions on push to `master`.

## Architecture

Personal portfolio site built with **Astro 5** (static output), TypeScript, and scoped CSS. No framework components (React/Vue/etc.) — all components are `.astro` files.

**Routing:** File-based under `src/pages/`. Dynamic routes `[slug].astro` use `getStaticPaths()` + `getCollection()`.

**Content collections** (defined in `src/content.config.ts` with Zod schemas):
- `blog` — posts with `title`, `date`, `description`, `tags[]`, `draft`
- `projects` — with `title`, `description`, `tags[]`, `repo?`, `demo?`, `featured`
- `publications` — with `title`, `authors[]`, `venue`, `year`, `pdf?`, `abstract?`

Add content by dropping `.md` files into `src/content/<collection>/`.

**Layout:** All pages use `src/layouts/SidebarLayout.astro` with a fixed left sidebar (`src/components/Sidebar.astro`, 220px, collapsible on mobile <768px).

**Styling:** Apple-inspired light theme with CSS variables in `src/styles/global.css`. All component styles are scoped. Key tokens: `--bg: #ffffff`, `--accent: #0071e3`, `--link: #0066cc`. Typography uses SF Pro Display/Text font stack.

**Math:** LaTeX in markdown via `remark-math` + `rehype-katex` (configured in `astro.config.mjs`).

**Tag filtering** on blog/projects listing pages is client-side JS in `src/components/TagFilter.astro`.

## i18n

The site supports English (default) and Chinese with a path-prefix strategy:
- English: `/`, `/blog/`, `/projects/`, etc.
- Chinese: `/zh/`, `/zh/blog/`, `/zh/projects/`, etc.

**Translation module:** `src/i18n/ui.ts` contains:
- `ui` — translation dictionary with all UI string keys for both `en` and `zh`
- `t(lang, key)` — lookup a translated string
- `localizedPath(path, lang)` — prefix path with `/zh` for Chinese, adds trailing slash
- `langSwitchPaths(pathname)` — returns `{ en, zh }` paths for the language switcher

**How it works:**
- All components accept an optional `lang` prop (defaults to `'en'`)
- English pages live in `src/pages/`, Chinese mirrors in `src/pages/zh/`
- Chinese pages are thin copies of English pages with `lang = 'zh'` — same data, translated UI chrome
- Only UI strings are translated; markdown content (blog posts, projects, publications) stays in English
- Language switcher (`EN / 中文`) is in the sidebar footer

**Adding a new UI string:** Add the key to both `en` and `zh` in `src/i18n/ui.ts`, then use `t(lang, 'your.key')` in templates.

**Adding a new page:** Create both `src/pages/<page>/index.astro` and `src/pages/zh/<page>/index.astro` with the appropriate `lang` value.

## Deployment

- **Site:** https://hxshen97.github.io
- **Hosting:** GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)
- **Branch:** Deploys on push to `master`
- **Trailing slashes:** `trailingSlash: 'always'` in `astro.config.mjs` — all internal links must end with `/` for GitHub Pages compatibility
