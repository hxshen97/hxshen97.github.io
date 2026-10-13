# CV PDF Generator — Design Spec

## Overview

A Node.js script (`npm run cv`) that reads CV data from a YAML file, renders it into a styled HTML template, and uses Puppeteer to generate a one-page PDF at `public/cv.pdf`.

## Goals

- Single source of truth for CV content in `cv/data.yaml`
- Repeatable PDF generation via `npm run cv`
- Clean, professional one-page A4 PDF suitable for job applications
- Easy to edit and regenerate

## File Structure

```
cv/
├── data.yaml        # CV content (user edits this)
├── template.html    # Self-contained HTML/CSS template
└── generate.js      # Node.js generation script
public/
└── cv.pdf           # Generated output (committed to repo)
```

## Data File: `cv/data.yaml`

```yaml
contact:
  name: "Hanxiang Shen"
  email: "hxshen_fdu@outlook.com"
  phone: ""                          # optional
  github: "hxshen97"
  linkedin: ""                       # optional
  website: "https://hxshen97.github.io"

summary: >-
  Brief 2-3 sentence professional summary.

education:
  - title: "PhD, Mathematics"
    org: "University Name"
    date: "2022 – present"
    description: "Research focus area."

  - title: "BSc, Computer Science & Mathematics"
    org: "University Name"
    date: "2018 – 2022"
    description: ""

experience:
  - title: "Software Engineer"
    org: "Company / Institution"
    date: "2022 – present"
    description:
      - "Bullet point describing achievement with quantified impact"
      - "Another accomplishment"

skills:
  - label: "Languages"
    items: "Python, TypeScript, C++, Haskell"
  - label: "Mathematics"
    items: "Analysis, Algebra, Probability, Numerical Methods"
  - label: "Tools"
    items: "Git, Linux, LaTeX, SciPy, PyTorch"

publications:                        # optional section
  - title: "Paper Title"
    authors: "Shen, H. et al."
    venue: "Conference/Journal, 2025"
```

### Data rules

- `description` in experience can be a string or a list of strings (rendered as bullet points).
- Sections with empty arrays are omitted from the PDF.
- `publications` is optional — omitted if not present or empty.
- `phone`, `linkedin` in contact are optional — omitted from header if empty.

## Template: `cv/template.html`

Self-contained HTML file with inline `<style>`. Design:

- **Paper:** A4 (210mm x 297mm)
- **Background:** White (#ffffff)
- **Text:** Dark (#1a1a1a) with muted secondary (#555555)
- **Font:** Inter (sans-serif), loaded via Google Fonts link
- **Accent:** A single subtle color for section headings and name — use the site's green (#10b981)
- **Layout:**
  - Name large at top, contact info in a single line below (email | github | website, separated by pipes or dots)
  - Professional summary below contact
  - Sections: Education, Experience, Skills, Publications (if present)
  - Section headings: uppercase, small font, accent color, with a thin bottom border
  - Entries: title + date on one line (flexbox space-between), org below, description/bullets below that
  - Skills: compact grid or inline layout
- **Spacing:** Compact — tuned so all content fits one A4 page. Margins ~15mm on all sides via CSS.
- **No images or icons** — text only for ATS compatibility.

The template uses `{{BODY}}` as a placeholder where the script injects the generated HTML sections.

## Script: `cv/generate.js`

ES module (matches project's `"type": "module"`).

### Dependencies

- `puppeteer` — headless Chrome for HTML-to-PDF rendering
- `js-yaml` — YAML parsing

### Logic

1. Read `cv/data.yaml`, parse with `js-yaml`
2. Read `cv/template.html`
3. Build HTML for each section from data:
   - Contact header (name + info line)
   - Summary paragraph
   - Education entries
   - Experience entries (handle string vs array descriptions)
   - Skills grid
   - Publications (if present)
4. Replace `{{BODY}}` in template with built HTML
5. Launch Puppeteer, create page, set HTML content
6. Generate PDF: A4 format, `printBackground: true`, no extra margins (CSS handles margins)
7. Save to `public/cv.pdf`
8. Close browser, log success

### Error handling

- Exit with error if `data.yaml` or `template.html` is missing
- Exit with error if Puppeteer fails to launch

## npm Integration

Add to `package.json`:

```json
{
  "scripts": {
    "cv": "node cv/generate.js"
  },
  "devDependencies": {
    "puppeteer": "^24.0.0",
    "js-yaml": "^4.1.0"
  }
}
```

## Workflow

1. Edit `cv/data.yaml` with your content
2. Run `npm run cv`
3. Open `public/cv.pdf` to review
4. Iterate until satisfied
5. Commit the updated `cv.pdf`

## Out of Scope

- No watch mode or hot reload
- No multiple output formats (only PDF)
- No Astro integration (standalone script)
- No automatic deployment of the PDF
