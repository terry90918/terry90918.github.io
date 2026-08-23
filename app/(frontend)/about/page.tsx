import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Terry Chen — 建構企業可採用、可維運、可擴展的 AI 系統。',
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
              我在新竹地區打造能進入真實工作流程的 AI 系統。
            </p>
            <p className="text-foreground mb-2 text-sm opacity-70">
              從 AI agents、RAG 與 LLM 應用，到 agent harness
              與產品工程，我專注把前沿模型能力轉化為企業可採用、可維運、可擴展的解決方案。
            </p>
            <p className="text-foreground text-sm opacity-70">
              我持續開發對社會與產業有實際價值的 AI
              應用工具，讓技術不只停在展示，而能成為推動工作方式與產業升級的基礎能力。
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
              className="text-accent focus-visible:outline-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              GitHub — github.com/terry90918
            </Link>
            <Link
              href="https://x.com/zxtw17985321"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent focus-visible:outline-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              X — @zxtw17985321
            </Link>
            <Link
              href="https://www.linkedin.com/in/tien-yi-chen-98812812a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent focus-visible:outline-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              LinkedIn — Tien-Yi Chen
            </Link>
            <Link
              href="mailto:zxtw17985321@gmail.com"
              className="text-accent focus-visible:outline-accent rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Email — zxtw17985321@gmail.com
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
