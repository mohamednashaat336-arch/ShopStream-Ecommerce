const REGISTERED_ACCOUNTS_KEY = 'shopstream-registered-accounts'
const PASSWORD_ITERATIONS = 120_000

function readAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(REGISTERED_ACCOUNTS_KEY) || '[]')
    return Array.isArray(accounts) ? accounts : []
  } catch {
    return []
  }
}

function publicUser(account) {
  const { passwordSalt: _salt, passwordHash: _hash, ...user } = account
  return user
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle) throw new Error('Secure local registration is unavailable in this browser.')
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const result = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PASSWORD_ITERATIONS, hash: 'SHA-256' }, key, 256)
  return bytesToBase64(result)
}

export function getRegisteredAccounts() {
  return readAccounts().map(publicUser)
}

export function getRegisteredAccountById(id) {
  const account = readAccounts().find((item) => String(item.id) === String(id))
  return account ? publicUser(account) : null
}

export async function registerLocalAccount({ name, email, username, password }) {
  const accounts = readAccounts()
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = username.trim().toLowerCase()
  if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail || account.username.toLowerCase() === normalizedUsername)) {
    throw new Error('That email or username is already registered in this browser.')
  }

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const [firstName = '', ...lastNames] = name.trim().split(/\s+/)
  const account = {
    id: `local-account-${crypto.randomUUID()}`,
    source: 'local',
    accountType: 'registered',
    firstName,
    lastName: lastNames.join(' '),
    name: name.trim(),
    email: normalizedEmail,
    username: username.trim(),
    role: 'user',
    status: 'Active',
    image: '',
    passwordSalt: bytesToBase64(salt),
    passwordHash: await hashPassword(password, salt),
  }
  localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify([...accounts, account]))
  window.dispatchEvent(new Event('shopstream-users-updated'))
  return publicUser(account)
}

export async function loginLocalAccount(usernameOrEmail, password) {
  const identifier = usernameOrEmail.trim().toLowerCase()
  const account = readAccounts().find((item) => item.username.toLowerCase() === identifier || item.email.toLowerCase() === identifier)
  if (!account) return null
  const candidate = await hashPassword(password, base64ToBytes(account.passwordSalt))
  if (candidate !== account.passwordHash) throw new Error('Username or password is incorrect.')
  return { provider: 'local', user: publicUser(account), accessToken: '', refreshToken: '' }
}

export function updateRegisteredAccount(id, updates) {
  const accounts = readAccounts()
  const updated = accounts.map((account) => account.id === id ? { ...account, ...updates, id: account.id, passwordHash: account.passwordHash, passwordSalt: account.passwordSalt } : account)
  localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event('shopstream-users-updated'))
  const account = updated.find((item) => item.id === id)
  return account ? publicUser(account) : null
}

export function removeRegisteredAccount(id) {
  localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(readAccounts().filter((account) => account.id !== id)))
  window.dispatchEvent(new Event('shopstream-users-updated'))
}
