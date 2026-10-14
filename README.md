# Personal Portfolio Site

A minimal, Apple-inspired light-themed portfolio site built with **Astro 5**, TypeScript, and scoped CSS. Supports bilingual UI (English / Chinese), blog with LaTeX math, project showcase, publications list, and CV page.

## Quick Start

```bash
npm install          # Install dependencies (Node >= 22.12.0)
npm run dev          # Dev server at http://localhost:4321
npm run build        # Build to ./dist/
npm run preview      # Preview production build locally
```

## Automated development

Development and review run in local Codex using a ChatGPT subscription login. Submit a requirement in the Codex chat; the agent writes the plan, implements the change, runs tests and creates a PR through the connected GitHub tools. Approve that PR's current commit in the chat; the agent checks its head and CI before merging. See [AGENTS.md](AGENTS.md) and [docs/automation.md](docs/automation.md).

Local acceptance (Node version is pinned in `.nvmrc`):

```bash
npm ci
npx playwright install chromium
npm run verify
```

CI requires the `quality` and `browser` checks. This mode requires no OpenAI API key, API billing or GitHub App. GitHub Actions runs tests and deployment only; the former API workflows are archived outside `.github/workflows/`. Issues can record requirements but do not start unattended development.

## GitHub Pages deployment

Deploys automatically to GitHub Pages via GitHub Actions on push to `master`.

**Important:** In your GitHub repo, go to **Settings > Pages** and set **Source** to **"GitHub Actions"** (not "Deploy from a branch").

Then update the site URL in `astro.config.mjs`:

```js
site: 'https://<your-username>.github.io'
```

## Customization Guide

### Personal Info

| What to change | File | Details |
|:--|:--|:--|
| Name / initials | `src/components/Sidebar.astro` | Replace `HxS` in the logo `<span>` (appears twice: desktop and mobile) |
| Tagline & bio | `src/i18n/ui.ts` | Edit `sidebar.tagline`, `home.role`, `home.bio` |
| Profile photo | `public/profile.jpg` | Replace with your own photo (displayed in homepage hero) |
| Homepage | `src/components/HomePage.astro` | Shared bilingual layout, content selection, email and GitHub links; UI text and name in `src/i18n/ui.ts` |
| Contact links | `src/pages/contact/index.astro` | Email, GitHub, LinkedIn URLs and display text |
| CV content | `src/pages/cv/index.astro` | Education, experience, and skills sections |
| Sidebar social links | `src/components/Sidebar.astro` | GitHub URL and email `href` |

### Theme Colors

The homepage routes (`src/pages/index.astro` and `src/pages/zh/index.astro`) are thin entries for `HomePage.astro`. Its scoped styles follow `DESIGN.md`: black introduction and contact sections, light project and writing sections, blue actions, and responsive typography. Homepage entrance and scroll reveals use native browser animation with no extra dependency; content stays visible without JavaScript and animations respect `prefers-reduced-motion`. Featured projects (up to 3), publications (up to 2, newest year first), and published posts (up to 4, newest date first) still come from the existing collections. With no posts, the homepage shows an empty state and a working blog link.

Edit CSS variables in `src/styles/global.css`:

```css
:root {
  --bg:           #ffffff;   /* page background */
  --bg-alt:       #f5f5f7;   /* alternate background */
  --bg-surface:   #f5f5f7;   /* card / surface background */
  --text:         #1d1d1f;   /* primary text */
  --text-muted:   rgba(0, 0, 0, 0.56);  /* secondary text */
  --accent:       #0071e3;   /* Apple blue accent */
  --link:         #0066cc;   /* link color */
  --sidebar-w:    220px;
  --radius:       8px;
  --font-display: 'SF Pro Display', -apple-system, ...;
  --font-text:    'SF Pro Text', -apple-system, ...;
  --font-mono:    'JetBrains Mono';
}
```

### Favicon

Replace `public/favicon.ico` and `public/favicon.svg` with your own icons.

### Adding Content

All content lives in `src/content/` as Markdown files with YAML frontmatter.

**Blog post** — create `src/content/blog/<slug>.md`:

```yaml
---
title: My Post Title
date: 2025-01-15
description: A short summary
tags: [math, notes]
draft: false          # optional, hides from listing when true
---

Your content here. LaTeX is supported: $E = mc^2$
```

**Project** — create `src/content/projects/<slug>.md`:

```yaml
---
title: Project Name
description: What it does
tags: [python, ml]
repo: https://github.com/you/repo   # optional
demo: https://demo.example.com       # optional
featured: true                        # shows on homepage
---

Project details here.
```

**Publication** — create `src/content/publications/<slug>.md`:

```yaml
---
title: Paper Title
authors: [Your Name, Co-Author]
venue: NeurIPS 2025
year: 2025
pdf: https://arxiv.org/abs/...       # optional
abstract: A brief abstract            # optional
---
```

### UI Strings & Translations

All UI text is in `src/i18n/ui.ts`. Each key has an `en` and `zh` version:

```ts
'sidebar.tagline': 'Software Engineer · Mathematician',
'home.role': '...',
'home.bio': '...',
'nav.blog': 'Blog',
// ... etc.
```

To change any label or text shown in the UI, edit the corresponding key. The Chinese mirror pages under `src/pages/zh/` use the `zh` translations automatically.

### Adding a New Page

1. Create `src/pages/<page>/index.astro` (English)
2. Create `src/pages/zh/<page>/index.astro` (Chinese, with `lang="zh"`)
3. Add navigation entry in `src/components/Sidebar.astro`
4. Add nav label keys in `src/i18n/ui.ts`

## Project Structure

```
src/
├── components/        # Astro components (Sidebar, TagFilter, etc.)
├── content/
│   ├── blog/          # Blog posts (.md)
│   ├── projects/      # Projects (.md)
│   └── publications/  # Publications (.md)
├── content.config.ts  # Collection schemas (Zod)
├── i18n/ui.ts         # UI strings (en/zh)
├── layouts/           # SidebarLayout.astro
├── pages/             # File-based routing
│   ├── zh/            # Chinese mirror pages
│   └── ...
└── styles/global.css  # Theme variables & global styles
public/
├── profile.jpg        # Homepage profile photo
├── favicon.ico
└── favicon.svg
```

## License

MIT
