export function isAdminRequest(request: Request) {
  const header = request.headers.get('x-admin-token') || ''
  const auth = (request.headers.get('authorization') || '').replace(/^Bearer\s+/, '')
  const token = header || auth
  const expected = (process.env.ADMIN_TOKEN as string) || (Bun.env.ADMIN_TOKEN as string)
  return Boolean(token && expected && token === expected)
}
