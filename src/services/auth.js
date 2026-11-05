const AUTH_URL = 'https://dummyjson.com/auth'

async function requestJson(url, options = {}) {
  const response = await fetch(url, options)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'The authentication request failed.')
  return data
}

export function normalizeAuthUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username,
    email: user.email || '',
    phone: user.phone || '',
    image: user.image || '',
    role: user.role || 'user',
  }
}

export async function getCurrentAuthUser(accessToken, signal) {
  return requestJson(`${AUTH_URL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
    signal,
  })
}

export async function loginWithDummyJson(username, password) {
  const loginData = await requestJson(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, expiresInMins: 60 }),
  })

  const accessToken = loginData.accessToken || loginData.token
  if (!accessToken) throw new Error('DummyJSON did not return an access token.')

  let profile = loginData
  try {
    profile = await getCurrentAuthUser(accessToken)
  } catch {
    // The successful login response still contains enough data for a basic profile.
  }

  return {
    user: normalizeAuthUser(profile),
    accessToken,
    refreshToken: loginData.refreshToken || '',
  }
}

export async function refreshDummyJsonSession(refreshToken) {
  const tokens = await requestJson(`${AUTH_URL}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ refreshToken, expiresInMins: 60 }),
  })
  const accessToken = tokens.accessToken || tokens.token
  if (!accessToken) throw new Error('DummyJSON could not refresh the session.')
  const profile = await getCurrentAuthUser(accessToken)
  return {
    user: normalizeAuthUser(profile),
    accessToken,
    refreshToken: tokens.refreshToken || refreshToken,
  }
}
