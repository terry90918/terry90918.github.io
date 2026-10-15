import Image from 'next/image'
import Link from 'next/link'

export function SiteEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="site-eyebrow">{children}</p>
}

export function SitePageIntro({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children?: React.ReactNode
}) {
  return (
    <header className="site-page-intro">
      <SiteEyebrow>
        <span className="site-dot" />
        {label}
      </SiteEyebrow>
      <h1>{title}</h1>
      {children}
    </header>
  )
}

export function SitePortrait({ priority = false }: { priority?: boolean }) {
  return (
    <Link href="/about" className="site-portrait">
      <Image
        src="/images/profile/avatar.webp"
        alt="Terry Chen 的照片"
        width={252}
        height={252}
        priority={priority}
        unoptimized
      />
      <span className="site-portrait-label">Terry Chen</span>
    </Link>
  )
}

export function SiteSectionHeading({
  label,
  title,
  id,
  children,
}: {
  label: string
  title: string
  id?: string
  children?: React.ReactNode
}) {
  return (
    <div className="site-section-head">
      <div>
        <SiteEyebrow>{label}</SiteEyebrow>
        <h2 id={id}>{title}</h2>
      </div>
      {children}
    </div>
  )
}
