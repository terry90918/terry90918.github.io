import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { ArticleOutline } from '../../components/article/ArticleOutline'

let container: HTMLDivElement
let heading: HTMLHeadingElement
let root: Root

beforeEach(async () => {
  container = document.createElement('div')
  heading = document.createElement('h2')
  heading.id = 'test-chapter'
  document.body.append(container, heading)
  root = createRoot(container)
  await act(async () =>
    root.render(<ArticleOutline headings={[{ id: heading.id, text: '章節' }]} mobile />)
  )
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  heading.remove()
})

it('closes the mobile outline and moves focus to the selected heading', async () => {
  const trigger = container.querySelector<HTMLButtonElement>('button')!
  expect(trigger.dataset.slot).toBe('collapsible-trigger')
  await act(async () => trigger.click())
  expect(trigger.getAttribute('aria-expanded')).toBe('true')
  await act(async () => container.querySelector('a')!.click())
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
  expect(document.activeElement).toBe(heading)
})
