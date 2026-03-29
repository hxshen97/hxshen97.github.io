import { readFileSync } from 'node:fs';
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
