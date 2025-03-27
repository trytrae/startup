import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 如果访问根路径,重定向到 auth
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  
  // 保持原有的 session 更新逻辑
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/',  // 添加根路径匹配
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}