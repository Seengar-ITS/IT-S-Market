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
