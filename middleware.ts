// IT-S ID1 auth — deployed 2026-05-16T07:21:31Z
export const config = {
  matcher: '/((?!assets|_vercel|favicon\\.ico).*)'
}

export default function middleware(request: Request) {
  const cookie = request.headers.get('cookie') || ''
  const hasSession = /(?:^|;)\s*its_session=/.test(cookie)

  if (!hasSession) {
    const loginUrl = 'https://its-id1.vercel.app/login?redirect=' + encodeURIComponent(request.url)
    return Response.redirect(loginUrl, 302)
  }
}