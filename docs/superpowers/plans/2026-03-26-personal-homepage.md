# HxS Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the HxS personal homepage — a professional landing page + blog for a software engineer and mathematics PhD, using Astro 5 with static output, a fixed sidebar layout, dark gradient visual style, and content collections for blog posts, projects, and publications.

**Architecture:** Astro 5 with `output: 'static'`. A single `SidebarLayout.astro` wraps all pages. Content (posts, projects, publications) lives as Markdown files in `src/content/` and is queried at build time via Astro content collections. Tag filtering uses a lightweight vanilla JS script island. KaTeX renders math via remark-math + rehype-katex.

**Tech Stack:** Astro 5, TypeScript (strict), vanilla CSS with CSS custom properties, remark-math, rehype-katex, KaTeX CDN CSS, Inter + JetBrains Mono (Google Fonts).

---

## File Map

```
astro.config.mjs                          Astro config: static output, KaTeX plugins
package.json                              Dependencies
tsconfig.json                             TypeScript strict config
.gitignore                                Standard Astro gitignore + .superpowers/
public/
  favicon.svg                             Site favicon
  cv.pdf                                  Placeholder CV PDF (user replaces)
  _headers                                Cloudflare Pages security headers
src/
  env.d.ts                                Astro type reference
  content.config.ts                       Content collection schemas (blog, projects, publications)
  content/
    blog/
      hello-world.md                      Sample blog post
      math-primer.md                      Sample math post (verifies KaTeX)
    projects/
      spectral-graph.md                   Sample featured project
      homepage.md                         Sample non-featured project
    publications/
      sgd-convergence.md                  Sample publication
  styles/
    global.css                            CSS variables, reset, base typography, utility classes
  layouts/
    SidebarLayout.astro                   Shared layout: sidebar + main content slot + head
  components/
    Sidebar.astro                         Fixed sidebar: logo, nav links, social icons, mobile header
    NavLink.astro                         Nav link with active-state indicator
    ProjectCard.astro                     Project card: title, description, tags, links
    PostCard.astro                        Blog post card: title, date, description, tags
    TagChip.astro                         Inline tag chip (renders .tag class)
    TagFilter.astro                       Client-side tag filter island (vanilla JS)
  pages/
    index.astro                           Landing page: hero, featured projects, recent posts, contact strip
    projects/
      index.astro                         Full projects list with tag filter
      [slug].astro                        Individual project page
    blog/
      index.astro                         Blog index with tag filter
      [slug].astro                        Individual blog post with KaTeX prose
    publications/
      index.astro                         Publications grouped by year, descending
    cv/
      index.astro                         Inline CV + PDF download link
    contact/
      index.astro                         Contact page: email + social links
```

---

## Task 1: Initialize project and install dependencies

**Files:**
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`

- [ ] **Step 1.1: Scaffold Astro project**

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git
```

If the CLI prompts interactively: choose template=minimal, TypeScript=strict, skip git, skip install.

Expected: project files written to current directory.

- [ ] **Step 1.2: Install dependencies**

```bash
npm install
npm install remark-math rehype-katex
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 1.3: Verify Astro version is 5.x**

```bash
npx astro --version
```

Expected: output contains `astro v5.`

- [ ] **Step 1.4: Overwrite astro.config.mjs**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  output: 'static',
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
```

- [ ] **Step 1.5: Overwrite tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": "."
  }
}
```

- [ ] **Step 1.6: Create src/env.d.ts**

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
```

- [ ] **Step 1.7: Verify build runs clean**

```bash
npx astro check && npx astro build
```

Expected: build succeeds, `dist/` created.

- [ ] **Step 1.8: Initialize git and commit**

```bash
git init
git add .
git commit -m "feat: initialize Astro 5 project with KaTeX support"
```

---

## Task 2: CSS design tokens and global styles

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 2.1: Create global.css**

```css
/* src/styles/global.css */

/* ── Design Tokens ─────────────────────────────── */
:root {
  --bg:          #0a0a0f;
  --bg-surface:  #111827;
  --border:      #1e293b;
  --text:        #e2e8f0;
  --text-muted:  #94a3b8;
  --accent-1:    #10b981;
  --accent-2:    #3b82f6;
  --gradient:    linear-gradient(135deg, #10b981, #3b82f6);
  --sidebar-w:   220px;
  --radius:      6px;
  --font-sans:   'Inter', system-ui, sans-serif;
  --font-mono:   'JetBrains Mono', monospace;
}

/* ── Reset ─────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Base ──────────────────────────────────────── */
html { font-size: 16px; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--accent-1);
  text-decoration: none;
}
a:hover { color: var(--accent-2); }

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-sans);
  font-weight: 700;
  line-height: 1.2;
  color: var(--text);
}

code, pre {
  font-family: var(--font-mono);
}

pre {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.875rem;
}

/* ── Utilities ─────────────────────────────────── */
.gradient-text {
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tag {
  display: inline-block;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--accent-1);
  font-size: 0.75rem;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-family: var(--font-mono);
}

.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.card:hover {
  border-color: var(--accent-1);
  box-shadow: -3px 0 0 0 var(--accent-1);
}

/* ── KaTeX ─────────────────────────────────────── */
.katex { font-size: 1.05em; }
.katex-display { overflow-x: auto; padding: 0.5rem 0; }
```

- [ ] **Step 2.2: Verify no syntax errors**

```bash
npx astro check
```

Expected: no errors.

- [ ] **Step 2.3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add CSS design tokens and global styles"
```

---

## Task 3: Content collection schemas and sample content

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/blog/hello-world.md`
- Create: `src/content/blog/math-primer.md`
- Create: `src/content/projects/spectral-graph.md`
- Create: `src/content/projects/homepage.md`
- Create: `src/content/publications/sgd-convergence.md`

- [ ] **Step 3.1: Create src/content.config.ts**

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    featured: z.boolean().default(false),
  }),
});

const publications = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.number(),
    pdf: z.string().url().optional(),
    abstract: z.string().optional(),
  }),
});

export const collections = { blog, projects, publications };
```

- [ ] **Step 3.2: Create src/content/blog/hello-world.md**

```markdown
---
title: "Hello, World"
date: 2026-01-15
description: "First post on the HxS homepage — a quick introduction."
tags: ["meta", "intro"]
draft: false
---

Welcome to my personal homepage. I'm a software engineer and mathematics PhD.

This site hosts my projects, publications, and occasional writing on topics across engineering and mathematics.
```

- [ ] **Step 3.3: Create src/content/blog/math-primer.md**

```markdown
---
title: "A Note on Gradients"
date: 2026-02-10
description: "A short note on gradient operators and their geometric intuition."
tags: ["mathematics", "analysis"]
draft: false
---

The gradient of a scalar field $f : \mathbb{R}^n \to \mathbb{R}$ points in the direction of steepest ascent:

$$\nabla f = \left( \frac{\partial f}{\partial x_1}, \ldots, \frac{\partial f}{\partial x_n} \right)$$

Its magnitude $\|\nabla f\|$ gives the rate of change in that direction.
```

- [ ] **Step 3.4: Create src/content/projects/spectral-graph.md**

```markdown
---
title: "Spectral Graph Analysis Tool"
description: "A library for computing spectral properties of large graphs, including eigenvalue decomposition and Laplacian analysis."
tags: ["python", "graph-theory", "linear-algebra"]
repo: "https://github.com/hxs/spectral-graph"
featured: true
---

A performant Python library for spectral analysis of large sparse graphs. Uses SciPy's sparse eigensolvers under the hood.
```

- [ ] **Step 3.5: Create src/content/projects/homepage.md**

```markdown
---
title: "Personal Homepage"
description: "This website — built with Astro 5, static output, dark gradient design."
tags: ["astro", "typescript", "web"]
repo: "https://github.com/hxs/homepage"
featured: false
---

The source code for this site.
```

- [ ] **Step 3.6: Create src/content/publications/sgd-convergence.md**

```markdown
---
title: "On the Convergence of Stochastic Gradient Descent in Non-Convex Settings"
authors: ["H. S.", "A. Collaborator"]
venue: "Journal of Mathematical Analysis"
year: 2025
pdf: "https://arxiv.org/abs/placeholder"
abstract: "We establish convergence guarantees for SGD under relaxed smoothness assumptions, extending prior results to a broader class of non-convex objectives."
---
```

- [ ] **Step 3.7: Verify schemas compile and collections are recognized**

```bash
npx astro check
```

Expected: no type errors, Astro recognizes all three collections.

- [ ] **Step 3.8: Commit**

```bash
git add src/content.config.ts src/content/
git commit -m "feat: add content collection schemas and sample content"
```

---

## Task 4: SidebarLayout and navigation components

**Files:**
- Create: `src/components/NavLink.astro`
- Create: `src/components/Sidebar.astro`
- Create: `src/layouts/SidebarLayout.astro`
- Create: `public/favicon.svg`

- [ ] **Step 4.1: Create src/components/NavLink.astro**

```astro
---
// src/components/NavLink.astro
interface Props {
  href: string;
  label: string;
}
const { href, label } = Astro.props;
const isActive = Astro.url.pathname === href ||
  (href !== '/' && Astro.url.pathname.startsWith(href));
---
<a href={href} class:list={['nav-link', { active: isActive }]}>
  {label}
</a>

<style>
.nav-link {
  display: block;
  padding: 0.4rem 0.75rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  border-radius: var(--radius);
  border-left: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.nav-link:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.04);
}
.nav-link.active {
  color: var(--accent-1);
  border-left-color: var(--accent-1);
  background: rgba(16, 185, 129, 0.06);
}
</style>
```

- [ ] **Step 4.2: Create src/components/Sidebar.astro**

```astro
---
// src/components/Sidebar.astro
import NavLink from './NavLink.astro';
---
<aside class="sidebar" id="sidebar">
  <div class="sidebar-top">
    <a href="/" class="logo">
      <span class="gradient-text">HxS</span>
    </a>
    <p class="tagline">Software Engineer · Mathematician</p>
  </div>

  <nav class="sidebar-nav" aria-label="Main navigation">
    <NavLink href="/" label="About" />
    <NavLink href="/projects" label="Projects" />
    <NavLink href="/blog" label="Blog" />
    <NavLink href="/publications" label="Publications" />
    <NavLink href="/cv" label="CV" />
    <NavLink href="/contact" label="Contact" />
  </nav>

  <div class="sidebar-footer">
    <a href="https://github.com/hxs" aria-label="GitHub" target="_blank" rel="noopener">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.745 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    </a>
    <a href="mailto:hxs@example.com" aria-label="Email">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    </a>
  </div>
</aside>

<!-- Mobile top bar -->
<header class="mobile-header">
  <a href="/" class="logo gradient-text">HxS</a>
  <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</header>

<script>
const btn = document.getElementById('hamburger')!;
const sidebar = document.getElementById('sidebar')!;
btn.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(open));
});
// Close sidebar when clicking a nav link on mobile
sidebar.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => sidebar.classList.remove('open'));
});
</script>

<style>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-w);
  height: 100vh;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
  z-index: 100;
  overflow-y: auto;
}

.sidebar-top { margin-bottom: 2rem; }

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  display: block;
  margin-bottom: 0.25rem;
}

.tagline {
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
}

.sidebar-footer {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}
.sidebar-footer a { color: var(--text-muted); }
.sidebar-footer a:hover { color: var(--accent-1); }

/* Mobile */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  padding: 0 1.25rem;
  align-items: center;
  justify-content: space-between;
  z-index: 200;
}

.hamburger {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 4px;
}
.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transition: transform 0.2s, opacity 0.2s;
}

@media (max-width: 768px) {
  .mobile-header { display: flex; }
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    top: 56px;
    height: calc(100vh - 56px);
  }
  .sidebar.open { transform: translateX(0); }
}
</style>
```

- [ ] **Step 4.3: Create src/layouts/SidebarLayout.astro**

```astro
---
// src/layouts/SidebarLayout.astro
import Sidebar from '../components/Sidebar.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}
const { title, description = 'HxS — Software Engineer & Mathematician' } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title} | HxS</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <Sidebar />
    <main class="main-content">
      <slot />
    </main>
  </body>
</html>

<style>
.main-content {
  margin-left: var(--sidebar-w);
  min-height: 100vh;
  padding: 3rem;
  max-width: calc(var(--sidebar-w) + 860px);
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 76px 1.25rem 2rem;
    max-width: 100%;
  }
}
</style>
```

- [ ] **Step 4.4: Create public/favicon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <text y=".9em" font-size="80" font-family="system-ui" font-weight="800" fill="url(#g)">H</text>
</svg>
```

- [ ] **Step 4.5: Replace placeholder index.astro to smoke-test the layout**

```astro
---
// src/pages/index.astro
import SidebarLayout from '../layouts/SidebarLayout.astro';
---
<SidebarLayout title="Home">
  <h1>Hello</h1>
</SidebarLayout>
```

- [ ] **Step 4.6: Build and verify sidebar renders**

```bash
npx astro build
```

Expected: build succeeds, `dist/index.html` exists and contains `sidebar`.

- [ ] **Step 4.7: Commit**

```bash
git add src/components/NavLink.astro src/components/Sidebar.astro src/layouts/ src/pages/index.astro public/favicon.svg
git commit -m "feat: add SidebarLayout, Sidebar, and NavLink components"
```

---

## Task 5: Reusable card components

**Files:**
- Create: `src/components/TagChip.astro`
- Create: `src/components/ProjectCard.astro`
- Create: `src/components/PostCard.astro`

- [ ] **Step 5.1: Create src/components/TagChip.astro**

```astro
---
// src/components/TagChip.astro
interface Props {
  tag: string;
}
const { tag } = Astro.props;
---
<span class="tag">{tag}</span>
```

No additional styles — `.tag` is defined in `global.css`.

- [ ] **Step 5.2: Create src/components/ProjectCard.astro**

```astro
---
// src/components/ProjectCard.astro
import TagChip from './TagChip.astro';

interface Props {
  title: string;
  description: string;
  tags: string[];
  repo?: string;
  demo?: string;
  slug: string;
}
const { title, description, tags, repo, demo, slug } = Astro.props;
---
<article class="card project-card" data-tags={tags.join(',')}>
  <h3><a href={`/projects/${slug}`}>{title}</a></h3>
  <p class="desc">{description}</p>
  <div class="tags">
    {tags.map(t => <TagChip tag={t} />)}
  </div>
  <div class="links">
    {repo && <a href={repo} target="_blank" rel="noopener">GitHub →</a>}
    {demo && <a href={demo} target="_blank" rel="noopener">Demo →</a>}
  </div>
</article>

<style>
.project-card h3 { margin-bottom: 0.5rem; font-size: 1.05rem; }
.project-card h3 a { color: var(--text); }
.project-card h3 a:hover { color: var(--accent-1); }
.desc { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.75rem; }
.tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.75rem; }
.links { display: flex; gap: 1rem; font-size: 0.85rem; }
.links a { color: var(--accent-1); }
.links a:hover { color: var(--accent-2); }
</style>
```

- [ ] **Step 5.3: Create src/components/PostCard.astro**

```astro
---
// src/components/PostCard.astro
import TagChip from './TagChip.astro';

interface Props {
  title: string;
  date: Date;
  description: string;
  tags: string[];
  slug: string;
}
const { title, date, description, tags, slug } = Astro.props;
const formatted = date.toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric',
});
---
<article class="card post-card" data-tags={tags.join(',')}>
  <time class="date" datetime={date.toISOString()}>{formatted}</time>
  <h3><a href={`/blog/${slug}`}>{title}</a></h3>
  <p class="desc">{description}</p>
  <div class="tags">
    {tags.map(t => <TagChip tag={t} />)}
  </div>
</article>

<style>
.post-card { display: flex; flex-direction: column; gap: 0.35rem; }
.date { font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono); }
.post-card h3 { font-size: 1.05rem; }
.post-card h3 a { color: var(--text); }
.post-card h3 a:hover { color: var(--accent-1); }
.desc { color: var(--text-muted); font-size: 0.9rem; }
.tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.25rem; }
</style>
```

- [ ] **Step 5.4: Verify type check**

```bash
npx astro check
```

Expected: no errors.

- [ ] **Step 5.5: Commit**

```bash
git add src/components/TagChip.astro src/components/ProjectCard.astro src/components/PostCard.astro
git commit -m "feat: add TagChip, ProjectCard, and PostCard components"
```

---

## Task 6: Landing page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 6.1: Write the full landing page**

```astro
---
// src/pages/index.astro
import SidebarLayout from '../layouts/SidebarLayout.astro';
import ProjectCard from '../components/ProjectCard.astro';
import PostCard from '../components/PostCard.astro';
import { getCollection } from 'astro:content';

const featuredProjects = (await getCollection('projects', ({ data }) => data.featured))
  .slice(0, 3);
const recentPosts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 4);
---
<SidebarLayout title="Home" description="HxS — Software Engineer & Mathematician">

  <!-- Hero -->
  <section class="hero">
    <h1><span class="gradient-text">HxS</span></h1>
    <p class="role">Software Engineer · Mathematics PhD</p>
    <p class="bio">
      I build systems and study structure — working at the intersection of
      computation and mathematics.
    </p>
    <div class="cta">
      <a href="/projects" class="btn btn-primary">View Projects</a>
      <a href="/blog" class="btn btn-secondary">Read Blog</a>
    </div>
  </section>

  <!-- Featured Projects -->
  {featuredProjects.length > 0 && (
    <section class="section">
      <div class="section-header">
        <h2>Featured Projects</h2>
        <a href="/projects" class="see-all">All projects →</a>
      </div>
      <div class="card-grid">
        {featuredProjects.map(p => (
          <ProjectCard
            title={p.data.title}
            description={p.data.description}
            tags={p.data.tags}
            repo={p.data.repo}
            demo={p.data.demo}
            slug={p.slug}
          />
        ))}
      </div>
    </section>
  )}

  <!-- Recent Posts -->
  {recentPosts.length > 0 && (
    <section class="section">
      <div class="section-header">
        <h2>Recent Posts</h2>
        <a href="/blog" class="see-all">All posts →</a>
      </div>
      <div class="card-grid">
        {recentPosts.map(p => (
          <PostCard
            title={p.data.title}
            date={p.data.date}
            description={p.data.description}
            tags={p.data.tags}
            slug={p.slug}
          />
        ))}
      </div>
    </section>
  )}

  <!-- Contact Strip -->
  <section class="contact-strip">
    <p>Get in touch</p>
    <div class="contact-links">
      <a href="mailto:hxs@example.com">hxs@example.com</a>
      <a href="https://github.com/hxs" target="_blank" rel="noopener">GitHub</a>
    </div>
  </section>

</SidebarLayout>

<style>
/* Hero */
.hero { padding: 2rem 0 3.5rem; }
.hero h1 {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-bottom: 0.5rem;
}
.role {
  font-size: 1.05rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  margin-bottom: 1rem;
}
.bio {
  font-size: 1.05rem;
  max-width: 520px;
  color: var(--text-muted);
  margin-bottom: 1.75rem;
}
.cta { display: flex; gap: 1rem; flex-wrap: wrap; }

.btn {
  display: inline-block;
  padding: 0.6rem 1.4rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 600;
  transition: opacity 0.2s, border-color 0.2s, color 0.2s;
}
.btn-primary {
  background: var(--gradient);
  color: #fff;
}
.btn-primary:hover { opacity: 0.85; color: #fff; }
.btn-secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}
.btn-secondary:hover { border-color: var(--accent-1); color: var(--accent-1); }

/* Sections */
.section { margin-bottom: 3.5rem; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1.25rem;
}
.section-header h2 { font-size: 1.15rem; }
.see-all { font-size: 0.85rem; color: var(--accent-1); }
.see-all:hover { color: var(--accent-2); }

.card-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

/* Contact strip */
.contact-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: 2rem;
  margin-top: 1rem;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.9rem;
}
.contact-links { display: flex; gap: 1.5rem; }
.contact-links a { color: var(--accent-1); }
</style>
```

- [ ] **Step 6.2: Build and verify**

```bash
npx astro build
```

Expected: `dist/index.html` exists, no errors.

- [ ] **Step 6.3: Preview and spot-check**

```bash
npx astro preview
```

Open http://localhost:4321 in browser. Verify: sidebar visible, hero renders, project cards appear, post cards appear, contact strip at bottom. Press Ctrl+C to stop.

- [ ] **Step 6.4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add landing page with hero, featured projects, recent posts"
```

---

## Task 7: Tag filter component and blog pages

**Files:**
- Create: `src/components/TagFilter.astro`
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[slug].astro`

- [ ] **Step 7.1: Create src/components/TagFilter.astro**

```astro
---
// src/components/TagFilter.astro
interface Props {
  tags: string[];
}
const { tags } = Astro.props;
---
<div class="tag-filter" id="tag-filter">
  <button class="filter-btn active" data-tag="all">All</button>
  {tags.map(t => (
    <button class="filter-btn" data-tag={t}>{t}</button>
  ))}
</div>

<script>
const filter = document.getElementById('tag-filter')!;
const buttons = filter.querySelectorAll<HTMLButtonElement>('.filter-btn');
const cards = document.querySelectorAll<HTMLElement>('.card[data-tags]');

filter.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.filter-btn');
  if (!btn) return;
  const tag = btn.dataset.tag!;

  buttons.forEach(b => b.classList.toggle('active', b === btn));
  cards.forEach(card => {
    const cardTags = card.dataset.tags?.split(',') ?? [];
    card.style.display = (tag === 'all' || cardTags.includes(tag)) ? '' : 'none';
  });
});
</script>

<style>
.tag-filter { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
.filter-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.filter-btn:hover { color: var(--text); border-color: var(--text-muted); }
.filter-btn.active {
  color: var(--accent-1);
  border-color: var(--accent-1);
  background: rgba(16, 185, 129, 0.06);
}
</style>
```

- [ ] **Step 7.2: Create src/pages/blog/index.astro**

```astro
---
// src/pages/blog/index.astro
import SidebarLayout from '../../layouts/SidebarLayout.astro';
import PostCard from '../../components/PostCard.astro';
import TagFilter from '../../components/TagFilter.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

const allTags = [...new Set(posts.flatMap(p => p.data.tags))].sort();
---
<SidebarLayout title="Blog" description="Writing on mathematics, engineering, and more.">
  <h1>Blog</h1>
  <p class="subtitle">Thoughts on mathematics, engineering, and whatever else.</p>

  <TagFilter tags={allTags} />

  <div class="card-grid">
    {posts.map(p => (
      <PostCard
        title={p.data.title}
        date={p.data.date}
        description={p.data.description}
        tags={p.data.tags}
        slug={p.slug}
      />
    ))}
  </div>
</SidebarLayout>

<style>
h1 { font-size: 2rem; margin-bottom: 0.5rem; }
.subtitle { color: var(--text-muted); margin-bottom: 2rem; }
.card-grid { display: grid; gap: 1rem; }
</style>
```

- [ ] **Step 7.3: Create src/pages/blog/[slug].astro**

```astro
---
// src/pages/blog/[slug].astro
import SidebarLayout from '../../layouts/SidebarLayout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
const formatted = post.data.date.toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric',
});
---
<SidebarLayout title={post.data.title} description={post.data.description}>
  <article class="post">
    <header>
      <div class="tags">
        {post.data.tags.map(t => <span class="tag">{t}</span>)}
      </div>
      <h1>{post.data.title}</h1>
      <time class="date" datetime={post.data.date.toISOString()}>{formatted}</time>
    </header>
    <div class="prose">
      <Content />
    </div>
  </article>
</SidebarLayout>

<style>
.post header {
  margin-bottom: 2.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1.5rem;
}
.tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); margin-bottom: 0.5rem; }
.date { font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-mono); }

.prose { max-width: 68ch; }
.prose :global(h2) { font-size: 1.4rem; margin: 2rem 0 0.75rem; }
.prose :global(h3) { font-size: 1.15rem; margin: 1.5rem 0 0.5rem; }
.prose :global(p) { margin-bottom: 1.2rem; }
.prose :global(ul),
.prose :global(ol) { margin: 0 0 1.2rem 1.5rem; }
.prose :global(li) { margin-bottom: 0.3rem; }
.prose :global(blockquote) {
  border-left: 3px solid var(--accent-1);
  padding-left: 1rem;
  color: var(--text-muted);
  font-style: italic;
  margin: 1.5rem 0;
}
.prose :global(a) { color: var(--accent-1); text-decoration: underline; }
.prose :global(code:not(pre code)) {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  padding: 0.1em 0.35em;
  border-radius: 3px;
  font-size: 0.875em;
}
</style>
```

- [ ] **Step 7.4: Build and verify all blog routes exist**

```bash
npx astro build && ls dist/blog/
```

Expected output includes: `index.html  hello-world/  math-primer/`

- [ ] **Step 7.5: Verify KaTeX output in math post**

```bash
grep -c "katex" dist/blog/math-primer/index.html
```

Expected: number greater than 0 — KaTeX CSS classes are present in the rendered HTML.

- [ ] **Step 7.6: Commit**

```bash
git add src/components/TagFilter.astro src/pages/blog/
git commit -m "feat: add blog index, post pages, and tag filter component"
```

---

## Task 8: Projects pages

**Files:**
- Create: `src/pages/projects/index.astro`
- Create: `src/pages/projects/[slug].astro`

- [ ] **Step 8.1: Create src/pages/projects/index.astro**

```astro
---
// src/pages/projects/index.astro
import SidebarLayout from '../../layouts/SidebarLayout.astro';
import ProjectCard from '../../components/ProjectCard.astro';
import TagFilter from '../../components/TagFilter.astro';
import { getCollection } from 'astro:content';

const projects = await getCollection('projects');
const allTags = [...new Set(projects.flatMap(p => p.data.tags))].sort();
---
<SidebarLayout title="Projects" description="Software and research projects by HxS.">
  <h1>Projects</h1>
  <p class="subtitle">Software, research tools, and experiments.</p>

  <TagFilter tags={allTags} />

  <div class="card-grid">
    {projects.map(p => (
      <ProjectCard
        title={p.data.title}
        description={p.data.description}
        tags={p.data.tags}
        repo={p.data.repo}
        demo={p.data.demo}
        slug={p.slug}
      />
    ))}
  </div>
</SidebarLayout>

<style>
h1 { font-size: 2rem; margin-bottom: 0.5rem; }
.subtitle { color: var(--text-muted); margin-bottom: 2rem; }
.card-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
</style>
```

- [ ] **Step 8.2: Create src/pages/projects/[slug].astro**

```astro
---
// src/pages/projects/[slug].astro
import SidebarLayout from '../../layouts/SidebarLayout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map(p => ({
    params: { slug: p.slug },
    props: { project: p },
  }));
}

const { project } = Astro.props;
const { Content } = await project.render();
---
<SidebarLayout title={project.data.title} description={project.data.description}>
  <article class="project">
    <header>
      <div class="tags">
        {project.data.tags.map(t => <span class="tag">{t}</span>)}
      </div>
      <h1>{project.data.title}</h1>
      <p class="desc">{project.data.description}</p>
      <div class="links">
        {project.data.repo && (
          <a href={project.data.repo} target="_blank" rel="noopener">GitHub →</a>
        )}
        {project.data.demo && (
          <a href={project.data.demo} target="_blank" rel="noopener">Demo →</a>
        )}
      </div>
    </header>
    <div class="prose">
      <Content />
    </div>
  </article>
</SidebarLayout>

<style>
.project header {
  margin-bottom: 2.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1.5rem;
}
.tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); margin-bottom: 0.5rem; }
.desc { color: var(--text-muted); margin-bottom: 1rem; }
.links { display: flex; gap: 1.5rem; }
.links a { color: var(--accent-1); font-size: 0.9rem; }
.prose { max-width: 68ch; margin-top: 2rem; }
.prose :global(p) { margin-bottom: 1.2rem; }
.prose :global(h2) { font-size: 1.4rem; margin: 2rem 0 0.75rem; }
.prose :global(code:not(pre code)) {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  padding: 0.1em 0.35em;
  border-radius: 3px;
  font-size: 0.875em;
}
</style>
```

- [ ] **Step 8.3: Build and verify**

```bash
npx astro build && ls dist/projects/
```

Expected: `index.html  spectral-graph/  homepage/`

- [ ] **Step 8.4: Commit**

```bash
git add src/pages/projects/
git commit -m "feat: add projects list and individual project pages"
```

---

## Task 9: Publications page

**Files:**
- Create: `src/pages/publications/index.astro`

- [ ] **Step 9.1: Create src/pages/publications/index.astro**

```astro
---
// src/pages/publications/index.astro
import SidebarLayout from '../../layouts/SidebarLayout.astro';
import { getCollection } from 'astro:content';

const pubs = await getCollection('publications');

// Group by year, descending
const byYear = pubs.reduce<Record<number, typeof pubs>>((acc, p) => {
  (acc[p.data.year] ??= []).push(p);
  return acc;
}, {});
const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);
---
<SidebarLayout title="Publications" description="Research papers and mathematical work by HxS.">
  <h1>Publications</h1>
  <p class="subtitle">Papers, theses, and mathematical writing.</p>

  {years.map(year => (
    <section class="year-group">
      <h2 class="year-label">{year}</h2>
      <ul class="pub-list">
        {byYear[year].map(p => (
          <li class="pub-item">
            <div class="pub-title">
              {p.data.pdf
                ? <a href={p.data.pdf} target="_blank" rel="noopener">{p.data.title}</a>
                : p.data.title
              }
            </div>
            <div class="pub-authors">{p.data.authors.join(', ')}</div>
            <div class="pub-venue">{p.data.venue}</div>
            {p.data.abstract && (
              <p class="pub-abstract">{p.data.abstract}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  ))}
</SidebarLayout>

<style>
h1 { font-size: 2rem; margin-bottom: 0.5rem; }
.subtitle { color: var(--text-muted); margin-bottom: 2.5rem; }

.year-group { margin-bottom: 2.5rem; }
.year-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-1);
  font-family: var(--font-mono);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.pub-list { list-style: none; display: flex; flex-direction: column; gap: 1.5rem; }
.pub-item {
  padding-left: 1rem;
  border-left: 2px solid var(--border);
  transition: border-color 0.2s;
}
.pub-item:hover { border-left-color: var(--accent-1); }

.pub-title { font-weight: 600; margin-bottom: 0.2rem; }
.pub-title a { color: var(--text); }
.pub-title a:hover { color: var(--accent-1); }
.pub-authors { font-size: 0.875rem; color: var(--text-muted); }
.pub-venue { font-size: 0.875rem; color: var(--accent-2); font-style: italic; }
.pub-abstract {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
  line-height: 1.6;
  max-width: 68ch;
}
</style>
```

- [ ] **Step 9.2: Build and verify**

```bash
npx astro build && ls dist/publications/
```

Expected: `index.html`

- [ ] **Step 9.3: Commit**

```bash
git add src/pages/publications/
git commit -m "feat: add publications page grouped by year"
```

---

## Task 10: CV page

**Files:**
- Create: `src/pages/cv/index.astro`
- Create: `public/cv.pdf`

- [ ] **Step 10.1: Create placeholder cv.pdf**

```bash
printf '%PDF-1.4\n%%placeholder - replace with real CV\n' > public/cv.pdf
```

- [ ] **Step 10.2: Create src/pages/cv/index.astro**

```astro
---
// src/pages/cv/index.astro
import SidebarLayout from '../../layouts/SidebarLayout.astro';
---
<SidebarLayout title="CV" description="Curriculum vitae of HxS.">
  <div class="cv-header">
    <h1>Curriculum Vitae</h1>
    <a href="/cv.pdf" download class="btn-download">Download PDF →</a>
  </div>

  <section class="cv-section">
    <h2>Education</h2>
    <div class="cv-entry">
      <div class="cv-entry-header">
        <strong>PhD, Mathematics</strong>
        <span class="cv-date">2022 – present</span>
      </div>
      <div class="cv-entry-sub">University Name</div>
      <p>Research focus: your research area here.</p>
    </div>
    <div class="cv-entry">
      <div class="cv-entry-header">
        <strong>BSc, Computer Science &amp; Mathematics</strong>
        <span class="cv-date">2018 – 2022</span>
      </div>
      <div class="cv-entry-sub">University Name</div>
    </div>
  </section>

  <section class="cv-section">
    <h2>Experience</h2>
    <div class="cv-entry">
      <div class="cv-entry-header">
        <strong>Software Engineer</strong>
        <span class="cv-date">2022 – present</span>
      </div>
      <div class="cv-entry-sub">Company / Institution</div>
      <p>Description of role and responsibilities.</p>
    </div>
  </section>

  <section class="cv-section">
    <h2>Skills</h2>
    <div class="skills-grid">
      <div>
        <span class="skills-label">Languages</span>
        Python, TypeScript, C++, Haskell
      </div>
      <div>
        <span class="skills-label">Mathematics</span>
        Analysis, Algebra, Probability, Numerical Methods
      </div>
      <div>
        <span class="skills-label">Tools</span>
        Git, Linux, LaTeX, SciPy, PyTorch
      </div>
    </div>
  </section>
</SidebarLayout>

<style>
.cv-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
h1 { font-size: 2rem; }

.btn-download {
  padding: 0.5rem 1.2rem;
  background: var(--gradient);
  color: #fff;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 600;
}
.btn-download:hover { opacity: 0.85; color: #fff; }

.cv-section { margin-bottom: 2.5rem; }
.cv-section h2 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-1);
  font-family: var(--font-mono);
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.cv-entry {
  margin-bottom: 1.25rem;
  padding-left: 1rem;
  border-left: 2px solid var(--border);
}
.cv-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}
.cv-date {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.cv-entry-sub {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}
.cv-entry p { font-size: 0.9rem; color: var(--text-muted); }

.skills-grid { display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.9rem; }
.skills-label {
  font-family: var(--font-mono);
  color: var(--accent-1);
  font-size: 0.8rem;
  margin-right: 0.75rem;
}
</style>
```

- [ ] **Step 10.3: Build and verify**

```bash
npx astro build && ls dist/cv/
```

Expected: `index.html`

- [ ] **Step 10.4: Commit**

```bash
git add src/pages/cv/ public/cv.pdf
git commit -m "feat: add CV page with download link"
```

---

## Task 11: Contact page

**Files:**
- Create: `src/pages/contact/index.astro`

- [ ] **Step 11.1: Create src/pages/contact/index.astro**

```astro
---
// src/pages/contact/index.astro
import SidebarLayout from '../../layouts/SidebarLayout.astro';
---
<SidebarLayout title="Contact" description="Get in touch with HxS.">
  <h1>Contact</h1>
  <p class="subtitle">The best way to reach me is by email.</p>

  <div class="contact-list">
    <a href="mailto:hxs@example.com" class="contact-item">
      <span class="contact-label">Email</span>
      <span class="contact-value">hxs@example.com</span>
    </a>
    <a href="https://github.com/hxs" target="_blank" rel="noopener" class="contact-item">
      <span class="contact-label">GitHub</span>
      <span class="contact-value">github.com/hxs</span>
    </a>
    <a href="https://linkedin.com/in/hxs" target="_blank" rel="noopener" class="contact-item">
      <span class="contact-label">LinkedIn</span>
      <span class="contact-value">linkedin.com/in/hxs</span>
    </a>
  </div>
</SidebarLayout>

<style>
h1 { font-size: 2rem; margin-bottom: 0.5rem; }
.subtitle { color: var(--text-muted); margin-bottom: 2.5rem; }

.contact-list { display: flex; flex-direction: column; gap: 1rem; max-width: 480px; }
.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color 0.2s;
  color: var(--text);
}
.contact-item:hover { border-color: var(--accent-1); color: var(--text); }
.contact-label {
  font-size: 0.8rem;
  font-family: var(--font-mono);
  color: var(--accent-1);
}
.contact-value { font-size: 0.9rem; color: var(--text-muted); }
</style>
```

- [ ] **Step 11.2: Build and verify**

```bash
npx astro build && ls dist/contact/
```

Expected: `index.html`

- [ ] **Step 11.3: Commit**

```bash
git add src/pages/contact/
git commit -m "feat: add contact page"
```

---

## Task 12: Final verification and deployment config

**Files:**
- Modify: `.gitignore`
- Create: `public/_headers`
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 12.1: Full clean build**

```bash
rm -rf dist/ && npx astro build
```

Expected: build completes with no errors.

- [ ] **Step 12.2: Verify all routes exist**

```bash
ls dist/ dist/blog/ dist/projects/ dist/publications/ dist/cv/ dist/contact/
```

Expected:
```
dist/:              index.html  blog/  contact/  cv/  projects/  publications/  _headers  ...
dist/blog/:         index.html  hello-world/  math-primer/
dist/projects/:     index.html  spectral-graph/  homepage/
dist/publications/: index.html
dist/cv/:           index.html
dist/contact/:      index.html
```

- [ ] **Step 12.3: Update .gitignore**

Open `.gitignore` and ensure it contains these lines (add any missing):

```
dist/
node_modules/
.astro/
.superpowers/
```

- [ ] **Step 12.4: Create public/_headers for Cloudflare Pages**

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

- [ ] **Step 12.5: Create GitHub Actions deploy workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deploy
        uses: actions/deploy-pages@v4
```

- [ ] **Step 12.6: Final commit**

```bash
git add .
git commit -m "feat: complete HxS homepage — all pages, deployment config"
```

- [ ] **Step 12.7: Deployment instructions**

**GitHub Pages:** Push repo to GitHub. In repo Settings → Pages → Source, select "GitHub Actions". The workflow runs on every push to `main`.

**Cloudflare Pages (alternative):** Connect the repo in the Cloudflare dashboard. Set build command: `npm run build`. Set output directory: `dist`. Deploy automatically on push.

---

## Self-Review

**Spec coverage:**
- ✅ `/` — hero, featured projects, recent posts, contact strip
- ✅ `/projects` — full list with tag filter
- ✅ `/projects/[slug]` — individual project page (linked from ProjectCard)
- ✅ `/blog` — index with tag filter
- ✅ `/blog/[slug]` — individual post with KaTeX prose
- ✅ `/publications` — grouped by year descending
- ✅ `/cv` — inline + PDF download
- ✅ `/contact` — email + social links
- ✅ Sidebar: gradient logo, tagline, nav with active indicator, social icons, mobile hamburger
- ✅ Content collections: blog (draft filter), projects (featured filter), publications
- ✅ CSS design tokens matching spec exactly
- ✅ Inter + JetBrains Mono
- ✅ KaTeX via remark-math + rehype-katex + CDN CSS
- ✅ Static output
- ✅ Deployment config (GitHub Pages + Cloudflare Pages)

**Placeholder scan:** No TBD/TODO in implementation steps. CV page contains placeholder text ("University Name", "hxs@example.com") — intentional; user fills in their own details.

**Type consistency:** `post.slug`, `project.slug`, `p.data.tags`, `p.data.title`, `p.data.description` used consistently across all tasks. `data.draft` filter applied in all blog collection queries.
