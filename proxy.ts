import { NextRequest, NextResponse } from 'next/server'

/**
 * Staging 環境 HTTP Basic Auth 保護
 * 阻止未授權訪問（包括爬蟲）
 */
export function proxy(request: NextRequest) {
  // 只在 staging 環境啟用
  if (process.env.STAGING !== 'true') {
    return NextResponse.next()
  }

  // 跳過 Payload API 路徑（webhook 等需要程式化存取）
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ')
    if (scheme?.toLowerCase() === 'basic' && encoded) {
      try {
        const decoded = atob(encoded)
        const [user, pass] = decoded.split(':')

        const expectedUser = process.env.STAGING_USER
        const expectedPass = process.env.STAGING_PASSWORD

        if (!expectedUser || !expectedPass) {
          console.error('STAGING_USER and STAGING_PASSWORD must be set when STAGING=true')
          return new NextResponse('Server configuration error', { status: 500 })
        }

        if (user === expectedUser && pass === expectedPass) {
          return NextResponse.next()
        }
      } catch {
        // Invalid base64 — fall through to 401
      }
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Staging Environment"',
    },
  })
}

export const config = {
  matcher: [
    /*
     * 匹配所有路徑，除了：
     * - _next/static (靜態資源)
     * - _next/image (圖片優化)
     * - favicon.ico, robots.txt, sitemap.xml
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
