import { tap } from './lib/utils'
import Session from './lib/session'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const middleware = async (request: NextRequest) => {
	const path = request.nextUrl.pathname
	const session = await Session.fromRequest(request)

	if (!session.userId) {
		if (path.startsWith('/login')) return
		return NextResponse.redirect(new URL('/login', request.url))
	}

	if (!session.teamId) {
		return tap(NextResponse.redirect(new URL('/login', request.url)), res => session.clear(res))
	}

	if (path == '/' || path.startsWith('/login')) {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}
}

export const config = {
	matcher: ['/', '/login', '/dashboard/:path*'],
}
