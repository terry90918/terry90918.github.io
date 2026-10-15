import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { JSDOM } from 'jsdom'

const source = process.argv[2]
if (!source) throw new Error('Provide the selected Open Design index.html path')
const html = readFileSync(source, 'utf8')
const document = new JSDOM(html).window.document
const text = (element) => element?.textContent.replace(/\s+/g, ' ').trim() ?? ''
const all = (element, selector) => [...element.querySelectorAll(selector)]
const cv = Object.fromEntries(
  ['zh-TW', 'en'].map((locale) => {
    const root = document.getElementById(`cv-${locale}`)
    const section = (id) => root.querySelector(`#cv-${locale}-${id}`)
    const labels = {}
    for (const [id, key] of [
      ['about', 'about'],
      ['featured-works', 'work'],
      ['experience', 'experience'],
      ['skills', 'skills'],
      ['contact', 'contact'],
    ]) {
      labels[key] = text(section(id).querySelector('.eyebrow'))
      labels[`${key}Title`] = text(section(id).querySelector('h2'))
    }
    return [
      locale,
      {
        role: text(root.querySelector('.cv-role')),
        labels,
        projects: all(section('featured-works'), 'article').map((card) => ({
          slug: card.querySelector('a').getAttribute('href').split('/').filter(Boolean).at(-1),
          organisation: text(card.querySelector('.kicker')),
          title: text(card.querySelector('h3')),
          description: text(card.querySelector('p')),
        })),
        experiences: all(section('experience'), '.timeline-row').map((row) => ({
          company: text(row.querySelector('.eyebrow')),
          role: text(row.querySelector('h3')),
          period: text(row.querySelector('h3 + p')),
          kind: '',
          team: '',
          bullets: all(row, ':scope > div > ul > li').map(text),
          projects: all(row, '.project').map((project) => ({
            name: text(project.querySelector('h4')),
            period: text(project.querySelector('p')),
            bullets: all(project, 'li').map(text),
          })),
        })),
        skills: all(section('skills'), 'details').map((skill) => ({
          title: text(skill.querySelector('summary')).replace(/＋$/, '').trim(),
          tags: all(skill, '.badge').map(text),
        })),
      },
    ]
  })
)
const snapshot = {
  source: {
    project: '76e33fa9-e2bc-4bf3-b92d-b38f0e5c0ae2',
    sha256: createHash('sha256').update(html).digest('hex'),
    skillsConfirmedByUser: '2026-10-15',
  },
  cv,
}
writeFileSync(
  new URL('../lib/site/design-reference.json', import.meta.url),
  `${JSON.stringify(snapshot, null, 2)}\n`
)
console.log(`Captured both CV views from ${snapshot.source.sha256}`)
