import { ImageResponse } from 'next/og'
export const dynamic = 'force-static'
const size = { width: 1200, height: 630 }
export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: '#faf9f6',
        color: '#292929',
        padding: '90px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', color: '#b83b08', fontSize: 30, marginBottom: 30 }}>
        APPLIED AI ENGINEERING
      </div>
      <div style={{ display: 'flex', fontSize: 88, fontWeight: 700 }}>Tien Yi Chen</div>
      <div style={{ display: 'flex', fontSize: 34, color: '#666', marginTop: 30 }}>
        Products. Systems. Delivery.
      </div>
      <div style={{ display: 'flex', fontSize: 24, color: '#666', marginTop: 65 }}>
        Taiwan · CV & selected work
      </div>
    </div>,
    size
  )
}
