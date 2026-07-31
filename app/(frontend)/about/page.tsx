import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Terry Chen — 在台北打造 AI 系統，讓複雜工作轉化為可靠、可落地的產品。',
}

export default function AboutPage() {
  return (
    <section className="py-8">
      <h1 className="text-foreground mb-8 text-2xl font-bold">About</h1>

      <div className="flex flex-col gap-12">
        {/* Avatar + bio */}
        <div
          data-testid="about-profile"
          className="flex flex-col items-start gap-6 sm:flex-row sm:gap-8"
        >
          <Image
            src="https://github.com/terry90918.png"
            alt="Terry Chen avatar"
            width={160}
            height={160}
            className="w-28 flex-shrink-0 rounded-full sm:w-40"
            unoptimized
          />
          <div className="max-w-prose space-y-2">
            <p className="text-foreground mb-2 text-sm opacity-70">
              我在台北打造 AI 系統，讓複雜的法律與營運工作轉化為可靠、可落地的產品。
            </p>
            <p className="text-foreground mb-2 text-sm opacity-70">
              我從產品方向一路做到正式環境：LLM agents、檢索系統與 MCP 工具，讓模型真正接上真實工作流程。
            </p>
            <p className="text-foreground text-sm opacity-70">
              目前我正建構 JurisLM 的開源基礎，包括 judicial-mcp、coolify-mcp 與 hetzner-mcp。
            </p>
          </div>
        </div>

        {/* GitHub Activity */}
        <div className="max-w-3xl">
          <h2 className="text-foreground mb-4 text-sm font-bold tracking-widest uppercase opacity-40">
            GitHub Activity
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://ghchart.rshah.org/terry90918"
            alt="Terry Chen's GitHub contribution chart"
            className="w-full"
          />
        </div>

        {/* Connect */}
        <div data-testid="about-connect">
          <h2 className="text-foreground mb-4 text-sm font-bold tracking-widest uppercase opacity-40">
            Connect
          </h2>
          <div className="flex flex-col gap-2 text-sm">
            <Link
              href="https://github.com/terry90918"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              GitHub — github.com/terry90918
            </Link>
            <Link
              href="https://x.com/zxtw17985321"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              X — @zxtw17985321
            </Link>
            <Link
              href="https://www.linkedin.com/in/tien-yi-chen-98812812a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              LinkedIn — Tien-Yi Chen
            </Link>
            <Link
              href="mailto:zxtw17985321@gmail.com"
              className="text-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Email — zxtw17985321@gmail.com
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
