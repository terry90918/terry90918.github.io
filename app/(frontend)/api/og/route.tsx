import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

// Design System 顏色常數
const COLORS = {
  primary: '#6a7e72',
  primaryLight: 'rgba(106, 126, 114, 0.08)',
  primaryBg: 'rgba(106, 126, 114, 0.1)',
  textDark: '#333331',
  textMuted: '#a8a5a0',
  bgLight: '#e6e4e1',
  bgLightDark: '#d8d6d3',
  white50: 'rgba(255, 255, 255, 0.5)',
}

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${COLORS.bgLight} 0%, ${COLORS.bgLightDark} 100%)`,
        position: 'relative',
      }}
    >
      {/* 背景裝飾文字 */}
      <div
        style={{
          position: 'absolute',
          right: '-50px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '280px',
          fontWeight: 900,
          color: COLORS.primaryLight,
          writingMode: 'vertical-rl',
        }}
      >
        律師
      </div>

      {/* 主要內容 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          padding: '60px 80px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* 頂部：Logo 和事務所名稱 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              border: `2px solid ${COLORS.primary}`,
              background: COLORS.white50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 700,
              color: COLORS.primary,
            }}
          >
            劉
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 500,
                letterSpacing: '0.2em',
                color: COLORS.textDark,
              }}
            >
              劉尹惠
            </div>
            <div
              style={{
                fontSize: '14px',
                letterSpacing: '0.15em',
                color: COLORS.textMuted,
              }}
            >
              律師事務所
            </div>
          </div>
        </div>

        {/* 中間：主要資訊 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            maxWidth: '700px',
          }}
        >
          {/* 標籤 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              letterSpacing: '0.3em',
              color: COLORS.primary,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '2px',
                background: COLORS.primary,
              }}
            />
            <span>新竹律師</span>
          </div>

          {/* 律師名字 */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: '80px',
                fontWeight: 700,
                color: COLORS.primary,
                lineHeight: 1.1,
                letterSpacing: '0.05em',
              }}
            >
              劉尹惠
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: 300,
                color: COLORS.textDark,
                letterSpacing: '0.1em',
              }}
            >
              律師
            </div>
          </div>

          {/* 標語 */}
          <div
            style={{
              fontSize: '24px',
              color: COLORS.textMuted,
              lineHeight: 1.6,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ color: COLORS.primary, fontWeight: 500 }}>以同理心為依歸的辯護。</span>
            <span>架起法條與故事的橋樑。</span>
          </div>
        </div>

        {/* 底部：服務項目和聯絡資訊 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          {/* 服務項目 */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              '民事訴訟',
              '刑事辯護',
              '婚姻家事',
              '遺產繼承',
              '房地糾紛',
              '契約審閱',
              '法人顧問',
            ].map((service) => (
              <div
                key={service}
                style={{
                  fontSize: '14px',
                  color: COLORS.textMuted,
                  padding: '6px 14px',
                  background: COLORS.primaryBg,
                  borderRadius: '20px',
                  letterSpacing: '0.05em',
                }}
              >
                {service}
              </div>
            ))}
          </div>

          {/* 聯絡資訊 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 600,
                color: COLORS.primary,
                letterSpacing: '0.05em',
              }}
            >
              03-657-5067
            </div>
            <div
              style={{
                fontSize: '14px',
                color: COLORS.textMuted,
                letterSpacing: '0.05em',
              }}
            >
              新竹縣竹北市
            </div>
          </div>
        </div>
      </div>

      {/* 底部裝飾線 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: `linear-gradient(to right, transparent 0%, ${COLORS.primary} 50%, transparent 100%)`,
        }}
      />
    </div>,
    {
      width: 1200,
      height: 630,
    }
  )
}
