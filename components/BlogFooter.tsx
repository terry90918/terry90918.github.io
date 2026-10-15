import Link from 'next/link'
import { CV_URL, SITE_EMAIL } from '@/lib/site/content'

export function BlogFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-links">
        <Link
          href="https://github.com/terry90918"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          GitHub
        </Link>
        <Link
          href="https://x.com/zxtw17985321"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (Twitter)"
        >
          X
        </Link>
        <Link
          href="https://www.linkedin.com/in/tien-yi-chen-98812812a"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </Link>
        <Link href={CV_URL} prefetch={false}>
          CV
        </Link>
        <Link href={SITE_EMAIL}>聯絡</Link>
      </div>
      <p>CC BY 4.0 · Code MIT</p>
    </footer>
  )
}
