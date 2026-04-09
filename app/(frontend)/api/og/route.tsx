import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Terry Chen'

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        background: '#fdfdfd',
        padding: '60px 80px',
      }}
    >
      {/* Top: site name */}
      <div
        style={{
          fontSize: '18px',
          color: '#006cac',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        terry90918.dev
      </div>

      {/* Middle: post title */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '900px',
        }}
      >
        <div
          style={{
            fontSize: title.length > 40 ? '52px' : '64px',
            fontWeight: 700,
            color: '#282728',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
      </div>

      {/* Bottom: author */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            fontSize: '18px',
            color: '#282728',
            opacity: 0.6,
          }}
        >
          Terry Chen · Building AI agent systems in Taiwan
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  )
}
