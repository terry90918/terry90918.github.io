import { readFileSync, writeFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'

const source = process.argv[2]
if (!source) throw new Error('Provide the selected Open Design index.html path')
const reference = new JSDOM(readFileSync(source, 'utf8')).window.document
const routes = {
  home: '/',
  about: '/about',
  story: '/story',
  work: '/work',
  'work-gj': '/work/gj',
  'work-nidin': '/work/nidin',
  'work-jurislm': '/work/jurislm',
  posts: '/posts',
  'ai-daily': '/posts/ai-daily',
  'cv-zh-TW': '/cv/zh-TW',
  'cv-en': '/cv/en',
}
const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const normalize = (value) => value.replace(/[\s↗←＋+]/g, '')
const rows = []
let missing = 0
for (const [view, route] of Object.entries(routes)) {
  const root = reference.getElementById(view)
  const file = route === '/' ? 'out/index.html' : `out${route}.html`
  const document = new JSDOM(readFileSync(file, 'utf8')).window.document
  const actual = document.querySelector('main')
  actual.querySelectorAll('script').forEach((script) => script.remove())
  const scopeFor = (element) => {
    if (element.closest('header.header')) return '.site-header'
    if (element.closest('footer.footer')) return '.site-footer'
    if (element.closest('.section-nav')) return '.cv-section-navigation'
    const section = element.closest('section')
    if (view.startsWith('cv-') && section?.id) return `#${section.id.replace(`${view}-`, '')}`
    if (view === 'story' && section?.id) return `#${section.id}`
    if (section?.classList.contains('contact-panel')) return '.site-contact-panel'
    if (section?.classList.contains('page-intro')) return '.site-page-intro'
    if (view === 'about')
      return section?.classList.contains('about-profile')
        ? '[data-testid="about-profile"]'
        : '[data-testid="about-connect"]'
    if (view === 'work' && section?.dataset.odId)
      return `[aria-labelledby="category-${section.dataset.odId.replace('work-category-', '')}"]`
    if (view.startsWith('work-') && section?.classList.contains('case-body'))
      return '.site-case-body'
    if (view === 'home') {
      if (element.closest('.hero')) return '[data-home-section="intro"]'
      const heading = section?.querySelector('h2')?.textContent
      return (
        {
          從這裡開始認識我: '[data-home-section="experiences"]',
          最近更新: '[data-home-section="updates"]',
          做過的作品: '[data-home-section="work"]',
        }[heading] ?? 'main'
      )
    }
    return 'main'
  }
  const selectors =
    'h1,h2,h3,h4,p,li,summary,a,.kicker,.badge,.eyebrow,.portrait-label,.split-index,.timeline-number,.contact-link > span'
  const blocks = [
    ...root.querySelectorAll(selectors),
    ...reference.querySelectorAll('header.header a,footer.footer a,footer.footer > span'),
  ]
  for (const element of blocks) {
    const expected = text(element)
    if (!expected) continue
    const implementation = scopeFor(element)
    const scope = implementation === 'main' ? actual : document.querySelector(implementation)
    const selector = element.matches('a')
      ? 'a,.site-text-link'
      : element.matches('h1,h2,h3,h4')
        ? element.tagName.toLowerCase()
        : 'p,li,summary,span,strong,a,div'
    const candidates = scope ? [...scope.querySelectorAll(selector)].map(text) : []
    let status = 'aligned'
    if (element.closest('.writing-row,.month-head,.id-card-visual') || /共 \d+ 篇/.test(expected))
      status = 'dynamic / retained implementation'
    else if (!candidates.some((candidate) => normalize(candidate) === normalize(expected))) {
      status = 'MISSING'
      missing++
    }
    rows.push({
      view,
      route,
      sourceBlock:
        element.closest('[data-od-id]')?.getAttribute('data-od-id') ??
        element.closest('section[id]')?.id ??
        element.tagName.toLowerCase(),
      expected,
      implementation,
      status,
    })
  }
  if (['home', 'posts', 'ai-daily'].includes(view)) {
    const implementation = {
      home: '[data-home-section="updates"] .site-writing-row',
      posts: '#all-posts .site-writing-row',
      'ai-daily': '.site-writing-row',
    }[view]
    const count = actual.querySelectorAll(implementation).length
    rows.push({
      view,
      route,
      sourceBlock:
        'design.js postRow / renderPosts / recentUpdates; #posts-data (71-post snapshot)',
      expected:
        'Use current published articles, dates, excerpts, counts and existing article routes; retain type labels and translation attribution',
      implementation,
      status: count
        ? `dynamic: ${count} current rows rendered; prototype snapshot intentionally not frozen`
        : 'MISSING',
    })
    if (!count) missing++
  }
}
const output = process.argv[3]
if (output) writeFileSync(output, `${JSON.stringify(rows, null, 2)}\n`)
console.log(
  JSON.stringify(
    {
      views: Object.keys(routes).length,
      blocks: rows.length,
      missing,
      failures: rows.filter((row) => row.status === 'MISSING'),
    },
    null,
    2
  )
)
if (missing) process.exitCode = 1
