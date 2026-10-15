# Personal Portfolio Site

A bilingual portfolio built with **Astro 5**, TypeScript, and scoped CSS. The experimental homepage uses a dark reading layout and **React 19 + React Three Fiber 9 / Three.js + GSAP** for interactive GPU animation. Blog with LaTeX math, projects, publications, CV, and contact pages retain their content and routes.

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

The homepage routes (`src/pages/index.astro` and `src/pages/zh/index.astro`) are thin entries for `HomePage.astro`. This experimental branch keeps the left navigation and a readable content column, with an independent React animation island in `src/components/motion/`. `MotionExperience.tsx` owns controls, visibility, accessibility and the lazy scene import. `GPUScene.tsx` renders GPU shader particles, torus-knot/orbital/wave morphs, desktop Bloom, interaction pulses and GSAP/ScrollTrigger camera motion. The homepage theme is scoped to `body.motion-theme`; the remaining pages keep the existing light theme. `DESIGN.md` records the previous Apple direction; the current experiment is documented in `docs/changes/geek-ui-exploration/`.

The scene pauses offscreen, in a hidden tab, on request, or under `prefers-reduced-motion`. Mobile/low-core devices use fewer particles and no Bloom. Without JavaScript, WebGL2, or a working GPU context, content stays readable and a static graphic is available. This is a visual mathematical illustration, not a plot of research results. A GPU scene adds a lazy bundle of approximately 273 kB gzip, in addition to React and the controls; it is only requested on the homepage when WebGL2 is available. Existing entrance/reveal animations remain native browser animations, separate from the scene timeline.

Featured projects (up to 3), publications (up to 2, newest year first), and published posts (up to 4, newest date first) still come from the existing collections. With no posts, the homepage shows an empty state and a working blog link. All new scene UI strings are maintained in both dictionaries in `src/i18n/ui.ts`.

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
