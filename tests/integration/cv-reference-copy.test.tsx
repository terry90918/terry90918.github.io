import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import CvHome from '../../components/cv/cv-home'
import { getCaseStudies } from '../../lib/cv/case-studies'
import { profiles } from '../../lib/cv/profile'

describe('Selected bilingual CV presentation', () => {
  for (const locale of ['zh-TW', 'en'] as const) {
    it(`renders the confirmed taxonomy and concise project reading paths in ${locale}`, async () => {
      const projects = await getCaseStudies(locale)
      const doc = new DOMParser().parseFromString(
        renderToStaticMarkup(
          <CvHome locale={locale} profile={profiles[locale]} projects={projects} />
        ),
        'text/html'
      )
      expect(doc.querySelector('h1')?.textContent).toBe(
        locale === 'en' ? 'Tien Yi Chen.' : '陳天一.'
      )
      expect(doc.querySelector('.cv-reference-role')?.textContent).toBe(
        locale === 'en' ? 'Freelancer' : '自由工作者'
      )
      expect(doc.querySelectorAll('#skills [data-slot=accordion-item]')).toHaveLength(31)
      expect(
        doc.querySelectorAll('#skills [data-slot=accordion-item][data-state=open]')
      ).toHaveLength(1)
      for (const tool of ['Haystack', 'Semantic Kernel', 'CrewAI', 'Ragas']) {
        expect(doc.querySelector('#skills')?.textContent).toContain(tool)
      }
      expect(
        [...doc.querySelectorAll('#featured-works a')].map((link) => link.getAttribute('href'))
      ).toEqual(
        ['jurislm', 'nidin', 'vclass', 'gj', 'channel-t', 'backlight-memory'].map(
          (slug) => `/cv/${locale}/case-study/${slug}#case-study-top`
        )
      )
      expect(
        [...doc.querySelectorAll('.cv-home-reference > section')].map((section) => section.id)
      ).toEqual(['top', 'about', 'featured-works', 'experience', 'education', 'contact', 'skills'])
      expect(doc.querySelector('#experience')?.textContent).toContain(
        locale === 'en' ? 'Work history overview' : '經歷一覽'
      )
      const management =
        locale === 'en'
          ? 'Managed the engineering team and supported work allocation and technical decision-making.'
          : '管理工程部門團隊，協助工作分派與技術決策。'
      expect(doc.querySelectorAll('#codex-profile')).toHaveLength(1)
      expect(doc.querySelector('#about #codex-profile')).not.toBeNull()
      expect(doc.querySelector('#about h2')?.textContent).toBe('OpenAI')
      expect(doc.querySelector('#experience')?.textContent).toContain(management)
      expect(doc.querySelector('#experience')?.textContent).toContain(
        locale === 'en' ? 'Managed 20 engineers' : '管理 20 人'
      )
    })
  }
})
