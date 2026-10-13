# CV PDF Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a script-based CV PDF generator that reads YAML data and produces a professional one-page A4 PDF.

**Architecture:** A standalone Node.js script reads `cv/data.yaml`, builds HTML sections, injects them into `cv/template.html`, and uses Puppeteer to render the final PDF to `public/cv.pdf`.

**Tech Stack:** Node.js (ES modules), Puppeteer, js-yaml, HTML/CSS

---

### Task 1: Install dependencies and add npm script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install puppeteer and js-yaml**

Run:
```bash
npm install --save-dev puppeteer js-yaml
```

Expected: Both packages added to `devDependencies` in `package.json`, `node_modules` updated.

- [ ] **Step 2: Add the `cv` script to package.json**

In `package.json`, add to the `"scripts"` block:

```json
"cv": "node cv/generate.js"
```

The scripts block should look like:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "cv": "node cv/generate.js"
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add puppeteer and js-yaml for CV PDF generation"
```

---

### Task 2: Create the CV data file

**Files:**
- Create: `cv/data.yaml`

- [ ] **Step 1: Create `cv/data.yaml`**

```yaml
contact:
  name: "Hanxiang Shen"
  email: "hxshen_fdu@outlook.com"
  phone: ""
  github: "hxshen97"
  linkedin: ""
  website: "https://hxshen97.github.io"

summary: >-
  Software engineer and mathematician with research experience in mathematical analysis
  and numerical methods. Skilled in Python, TypeScript, C++, and scientific computing.

education:
  - title: "PhD, Mathematics"
    org: "University Name"
    date: "2022 – present"
    description: "Research focus: your research area here."

  - title: "BSc, Computer Science & Mathematics"
    org: "University Name"
    date: "2018 – 2022"
    description: ""

experience:
  - title: "Software Engineer"
    org: "Company / Institution"
    date: "2022 – present"
    description:
      - "Designed and implemented data processing pipelines"
      - "Built web applications using TypeScript and modern frameworks"

skills:
  - label: "Languages"
    items: "Python, TypeScript, C++, Haskell"
  - label: "Mathematics"
    items: "Analysis, Algebra, Probability, Numerical Methods"
  - label: "Tools"
    items: "Git, Linux, LaTeX, SciPy, PyTorch"

publications:
  - title: "Paper Title"
    authors: "Shen, H. et al."
    venue: "Conference/Journal, 2025"
```

- [ ] **Step 2: Commit**

```bash
git add cv/data.yaml
git commit -m "feat: add CV data file"
```

---

### Task 3: Create the HTML/CSS template

**Files:**
- Create: `cv/template.html`

- [ ] **Step 1: Create `cv/template.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    @page { size: A4; margin: 0; }

    body {
      font-family: 'Inter', sans-serif;
      font-size: 9.5pt;
      line-height: 1.45;
      color: #1a1a1a;
      background: #ffffff;
      padding: 15mm;
      width: 210mm;
      min-height: 297mm;
    }

    /* Header */
    .cv-name {
      font-size: 22pt;
      font-weight: 700;
      color: #10b981;
      margin-bottom: 4px;
    }

    .cv-contact {
      font-size: 8.5pt;
      color: #555555;
      margin-bottom: 14px;
    }

    .cv-contact a {
      color: #555555;
      text-decoration: none;
    }

    .cv-contact span.sep {
      margin: 0 6px;
      color: #cccccc;
    }

    /* Summary */
    .cv-summary {
      font-size: 9.5pt;
      color: #333333;
      margin-bottom: 16px;
      line-height: 1.5;
    }

    /* Section */
    .cv-section {
      margin-bottom: 14px;
    }

    .cv-section-title {
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #10b981;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 3px;
      margin-bottom: 8px;
    }

    /* Entry */
    .cv-entry {
      margin-bottom: 8px;
    }

    .cv-entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .cv-entry-title {
      font-weight: 600;
      font-size: 9.5pt;
    }

    .cv-entry-date {
      font-size: 8.5pt;
      color: #555555;
      white-space: nowrap;
    }

    .cv-entry-org {
      font-size: 8.5pt;
      color: #555555;
      margin-bottom: 2px;
    }

    .cv-entry-desc {
      font-size: 9pt;
      color: #333333;
    }

    .cv-entry-bullets {
      list-style: disc;
      padding-left: 16px;
      font-size: 9pt;
      color: #333333;
    }

    .cv-entry-bullets li {
      margin-bottom: 1px;
    }

    /* Skills */
    .cv-skills-grid {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 3px 12px;
      font-size: 9pt;
    }

    .cv-skills-label {
      font-weight: 600;
      color: #10b981;
      font-size: 8.5pt;
    }

    .cv-skills-items {
      color: #333333;
    }

    /* Publications */
    .cv-pub {
      margin-bottom: 4px;
      font-size: 9pt;
      color: #333333;
    }

    .cv-pub-title {
      font-weight: 600;
    }

    .cv-pub-venue {
      font-style: italic;
      color: #555555;
    }
  </style>
</head>
<body>
  {{BODY}}
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add cv/template.html
git commit -m "feat: add CV HTML/CSS template"
```

---

### Task 4: Create the generation script

**Files:**
- Create: `cv/generate.js`

- [ ] **Step 1: Create `cv/generate.js`**

```js
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// --- Read inputs ---
const dataPath = join(__dirname, 'data.yaml');
const templatePath = join(__dirname, 'template.html');
const outputPath = join(ROOT, 'public', 'cv.pdf');

let data;
try {
  data = yaml.load(readFileSync(dataPath, 'utf-8'));
} catch (err) {
  console.error(`Error reading ${dataPath}: ${err.message}`);
  process.exit(1);
}

let template;
try {
  template = readFileSync(templatePath, 'utf-8');
} catch (err) {
  console.error(`Error reading ${templatePath}: ${err.message}`);
  process.exit(1);
}

// --- Build HTML sections ---

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildContact(contact) {
  const parts = [];
  if (contact.email) parts.push(`<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>`);
  if (contact.phone) parts.push(escapeHtml(contact.phone));
  if (contact.github) parts.push(`<a href="https://github.com/${escapeHtml(contact.github)}">github.com/${escapeHtml(contact.github)}</a>`);
  if (contact.linkedin) parts.push(`<a href="https://linkedin.com/in/${escapeHtml(contact.linkedin)}">linkedin.com/in/${escapeHtml(contact.linkedin)}</a>`);
  if (contact.website) parts.push(`<a href="${escapeHtml(contact.website)}">${escapeHtml(contact.website)}</a>`);

  return `<div class="cv-name">${escapeHtml(contact.name)}</div>
<div class="cv-contact">${parts.join('<span class="sep">|</span>')}</div>`;
}

function buildSummary(summary) {
  if (!summary) return '';
  return `<div class="cv-summary">${escapeHtml(summary)}</div>`;
}

function buildEntries(title, entries) {
  if (!entries || entries.length === 0) return '';

  const items = entries.map(entry => {
    let descHtml = '';
    if (Array.isArray(entry.description)) {
      descHtml = `<ul class="cv-entry-bullets">${entry.description.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>`;
    } else if (entry.description) {
      descHtml = `<div class="cv-entry-desc">${escapeHtml(entry.description)}</div>`;
    }

    return `<div class="cv-entry">
  <div class="cv-entry-header">
    <span class="cv-entry-title">${escapeHtml(entry.title)}</span>
    <span class="cv-entry-date">${escapeHtml(entry.date)}</span>
  </div>
  <div class="cv-entry-org">${escapeHtml(entry.org)}</div>
  ${descHtml}
</div>`;
  }).join('\n');

  return `<div class="cv-section">
  <div class="cv-section-title">${escapeHtml(title)}</div>
  ${items}
</div>`;
}

function buildSkills(skills) {
  if (!skills || skills.length === 0) return '';

  const rows = skills.map(s =>
    `<div class="cv-skills-label">${escapeHtml(s.label)}</div><div class="cv-skills-items">${escapeHtml(s.items)}</div>`
  ).join('\n');

  return `<div class="cv-section">
  <div class="cv-section-title">Skills</div>
  <div class="cv-skills-grid">${rows}</div>
</div>`;
}

function buildPublications(pubs) {
  if (!pubs || pubs.length === 0) return '';

  const items = pubs.map(p =>
    `<div class="cv-pub"><span class="cv-pub-title">${escapeHtml(p.title)}</span>. ${escapeHtml(p.authors)}. <span class="cv-pub-venue">${escapeHtml(p.venue)}</span></div>`
  ).join('\n');

  return `<div class="cv-section">
  <div class="cv-section-title">Publications</div>
  ${items}
</div>`;
}

const body = [
  buildContact(data.contact),
  buildSummary(data.summary),
  buildEntries('Education', data.education),
  buildEntries('Experience', data.experience),
  buildSkills(data.skills),
  buildPublications(data.publications),
].join('\n');

const html = template.replace('{{BODY}}', body);

// --- Generate PDF ---
console.log('Launching browser...');
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});
await browser.close();
console.log(`CV generated: ${outputPath}`);
```

- [ ] **Step 2: Run the script to verify it works**

Run:
```bash
npm run cv
```

Expected output:
```
Launching browser...
CV generated: C:\Users\HanS\Documents\cpp\public\cv.pdf
```

Open `public/cv.pdf` to verify it's a clean one-page A4 PDF with all sections rendered correctly.

- [ ] **Step 3: Commit**

```bash
git add cv/generate.js
git commit -m "feat: add CV PDF generation script"
```

---

### Task 5: End-to-end verification and final commit

**Files:**
- Verify: `public/cv.pdf`

- [ ] **Step 1: Regenerate the PDF from scratch**

Run:
```bash
npm run cv
```

Expected: `public/cv.pdf` is created/updated, one A4 page, all sections present (contact, summary, education, experience, skills, publications).

- [ ] **Step 2: Verify the PDF renders correctly**

Open `public/cv.pdf` and check:
- Name "Hanxiang Shen" in green at the top
- Contact line with email, github, website separated by pipes
- Summary paragraph
- Education section with 2 entries
- Experience section with bullet points
- Skills grid with 3 rows
- Publications section at the bottom
- Everything fits on one page
- Clean white background, professional typography

- [ ] **Step 3: Commit all generated files**

```bash
git add cv/ public/cv.pdf
git commit -m "feat: complete CV PDF generator pipeline"
```
