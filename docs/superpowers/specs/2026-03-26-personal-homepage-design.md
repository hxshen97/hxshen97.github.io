# HxS Homepage — Design Spec

**Date:** 2026-03-26
**Status:** Approved

## Overview

A personal homepage for HxS — a software engineer and mathematics PhD. The site serves as both a professional landing page (personal brand, CV, projects, publications) and a blog. Built with Astro 5, statically generated, deployed to GitHub Pages or Cloudflare Pages.

---

## Architecture

### Tech Stack

- **Framework:** Astro 5 (static output)
- **Language:** TypeScript
- **Styling:** Vanilla CSS with CSS custom properties — no UI framework
- **Math rendering:** `remark-math` + `rehype-katex` for LaTeX in Markdown/MDX
- **Content:** Astro content collections (Markdown/MDX files in `src/content/`)

### Site Structure

```
/                   → Landing page (hero, featured projects, recent posts, contact strip)
/projects           → Full projects list
/blog               → Blog post index
/blog/[slug]        → Individual blog post
/publications       → Papers, theses, mathematical work
/cv                 → Inline CV + PDF download link
/contact            → Contact/links page
```

### Content Collections (`src/content/`)

**`blog/`** — Markdown/MDX blog posts
```yaml
title: string
date: Date
description: string
tags: string[]
draft: boolean   # excluded from production build
```

**`projects/`** — Software and research projects
```yaml
title: string
description: string
tags: string[]
repo: string       # optional
demo: string       # optional
featured: boolean  # surfaces on landing page
```

**`publications/`** — Papers, theses, mathematical work
```yaml
title: string
authors: string[]
venue: string
year: number
pdf: string        # optional link
abstract: string   # optional
```

---

## Visual Design

### Color Palette

```css
--bg:          #0a0a0f    /* near-black base */
--bg-surface:  #111827    /* cards, sidebar background */
--border:      #1e293b    /* subtle dividers */
--text:        #e2e8f0    /* primary text */
--text-muted:  #94a3b8    /* secondary/meta text */
--accent-1:    #10b981    /* emerald — links, active nav, tags */
--accent-2:    #3b82f6    /* blue — hover states, gradient end */
--gradient:    linear-gradient(135deg, #10b981, #3b82f6)
```

### Typography

- **Headings & body:** `Inter`, fallback `system-ui, sans-serif`
- **Body size:** 16px, line-height 1.7
- **Code & math blocks:** `JetBrains Mono`, fallback `monospace`

### Layout

**Sidebar (fixed, ~220px, desktop):**
- Top: `HxS` logotype in gradient text, tagline "Software Engineer · Mathematician"
- Navigation: About, Projects, Blog, Publications, CV, Contact — active state shown as emerald left-bar indicator
- Bottom: Social/contact icons (GitHub, email)
- Mobile: collapses to top bar with hamburger menu

**Single shared layout:** `SidebarLayout.astro` wraps all pages.

### Landing Page Sections

1. **Hero** — Large name, title, one-sentence bio, two CTA buttons (View Projects, Read Blog)
2. **Featured Projects** — 2–3 cards pulled from `featured: true` projects; each shows title, description, tag chips, repo/demo links
3. **Recent Posts** — Latest 4 blog posts; each shows title, date, description
4. **Contact strip** — Email and social links, minimal

### Cards

Dark surface (`--bg-surface`), 1px border (`--border`), emerald left-accent bar on hover. No heavy box shadows.

---

## Data Flow

- All data fetched from content collections **at build time** — no runtime database or API calls
- Landing page queries: `featured: true` projects + latest 4 blog posts
- Tag filtering on `/blog` and `/projects`: client-side JS island (no full-page reload)
- `/publications` renders entries grouped by year, descending

---

## CV Page

- Inline CV content rendered from Markdown
- `public/cv.pdf` — maintained separately, linked for download
- No auto-generation of PDF from Markdown

---

## Deployment

- **Output mode:** `output: 'static'` (fully static, no server required)
- **Recommended hosts:** GitHub Pages or Cloudflare Pages (free, auto-deploy on push)
- **Custom domain:** supported on both hosts
- **No CMS** — content lives in git; adding a post = adding a Markdown file

---

## Out of Scope

- Comments system
- Search (may be added later as a client-side island)
- Authentication or user accounts
- Server-side rendering or dynamic API routes
