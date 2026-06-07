import { describe, it, expect } from 'vitest'
import { PROTECTED_ROUTES, AUTH_ROUTES } from './proxy'

function isProtected(pathname: string) {
  return PROTECTED_ROUTES.some(r => pathname.startsWith(r))
}
function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some(r => pathname.startsWith(r))
}

describe('route classification', () => {
  it('marks /feed as protected', () => expect(isProtected('/feed')).toBe(true))
  it('marks /search as protected', () => expect(isProtected('/search')).toBe(true))
  it('marks /settings as protected', () => expect(isProtected('/settings')).toBe(true))
  it('does not mark /someuser as protected', () => expect(isProtected('/someuser')).toBe(false))
  it('marks /login as auth route', () => expect(isAuthRoute('/login')).toBe(true))
  it('marks /signup as auth route', () => expect(isAuthRoute('/signup')).toBe(true))
})
