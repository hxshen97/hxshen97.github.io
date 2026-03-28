# Personal Portfolio Site

A minimal, dark-themed portfolio site built with **Astro 5**, TypeScript, and scoped CSS. Supports bilingual UI (English / Chinese), blog with LaTeX math, project showcase, publications list, and CV page.

## Quick Start

```bash
npm install          # Install dependencies (Node >= 22.12.0)
npm run dev          # Dev server at http://localhost:4321
npm run build        # Build to ./dist/
npm run preview      # Preview production build locally
```

## Deployment

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
| Homepage hero | `src/pages/index.astro` | Name in the `<h1>`, email and GitHub links |
| Contact links | `src/pages/contact/index.astro` | Email, GitHub, LinkedIn URLs and display text |
| CV content | `src/pages/cv/index.astro` | Education, experience, and skills sections |
| CV PDF download | `public/cv.pdf` | Replace with your own PDF |
| Sidebar social links | `src/components/Sidebar.astro` | GitHub URL and email `href` |

### Theme Colors

Edit CSS variables in `src/styles/global.css`:

```css
:root {
  --bg:        #0a0a0f;   /* page background */
  --bg-surface:#111827;   /* card / surface background */
  --border:    #1e293b;
  --text:      #e2e8f0;   /* primary text */
  --text-muted:#94a3b8;   /* secondary text */
  --accent-1:  #10b981;   /* green accent */
  --accent-2:  #3b82f6;   /* blue accent */
  --sidebar-w: 220px;
  --radius:    6px;
  --font-sans: 'Inter';
  --font-mono: 'JetBrains Mono';
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
├── cv.pdf             # Downloadable CV
├── favicon.ico
└── favicon.svg
```

## License

MIT
