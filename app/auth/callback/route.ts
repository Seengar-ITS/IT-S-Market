import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') || '/dashboard'
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error || 'no_code')}`)
  }

  try {
    // Exchange code for token via IT-S ID1
    const tokenRes = await fetch('https://its-id.vercel.app/api/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${origin}/auth/callback`,
        client_id: process.env.ITS_CLIENT_ID || '',
        client_secret: process.env.ITS_CLIENT_SECRET || ''
      })
    })
    
    if (!tokenRes.ok) throw new Error('Token exchange failed')
    const tokens = await tokenRes.json()
    
    const safeRedirect = state.startsWith('/') ? state : '/dashboard'
    const response = NextResponse.redirect(`${origin}${safeRedirect}`)
    
    response.cookies.set('its-access-token', tokens.access_token, {
      httpOnly: true, secure: true, sameSite: 'lax',
      maxAge: tokens.expires_in || 3600, path: '/'
    })
    if (tokens.refresh_token) {
      response.cookies.set('its-refresh-token', tokens.refresh_token, {
        httpOnly: true, secure: true, sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, path: '/'
      })
    }
    return response
  } catch (e) {
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }
}
