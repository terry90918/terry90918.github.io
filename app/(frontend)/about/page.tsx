import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Terry Chen — AI Engineer building LLM agent systems and MCP tooling in Taipei, Taiwan.',
}

export default function AboutPage() {
  return (
    <section className="py-8">
      <h1 className="text-foreground mb-8 text-2xl font-bold">About</h1>

      <div className="flex flex-col gap-8">
        {/* Avatar + bio */}
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <Image
            src="https://github.com/terry90918.png"
            alt="Terry Chen avatar"
            width={96}
            height={96}
            className="flex-shrink-0 rounded-full"
            unoptimized
          />
          <div>
            <p className="text-foreground mb-2 text-sm opacity-70">Based in Taipei, Taiwan.</p>
            <p className="text-foreground mb-2 text-sm opacity-70">
              AI Engineer building LLM agent systems and MCP tooling.
            </p>
            <p className="text-foreground text-sm opacity-70">
              Building judicial-mcp, coolify-mcp, hetzner-mcp.
            </p>
          </div>
        </div>

        {/* GitHub Activity */}
        <div>
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
        <div>
          <h2 className="text-foreground mb-4 text-sm font-bold tracking-widest uppercase opacity-40">
            Connect
          </h2>
          <div className="flex flex-col gap-2 text-sm">
            <Link
              href="https://github.com/terry90918"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              GitHub — github.com/terry90918
            </Link>
            <Link
              href="https://x.com/zxtw17985321"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              X — @zxtw17985321
            </Link>
            <Link
              href="https://www.linkedin.com/in/tien-yi-chen-98812812a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              LinkedIn — Tien-Yi Chen
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
