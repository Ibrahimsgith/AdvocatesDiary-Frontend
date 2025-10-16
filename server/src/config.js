import dotenv from 'dotenv'

dotenv.config()

const numberFromEnv = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const stringFromEnv = (value, fallback = '') => {
  if (!value) return fallback
  const trimmed = String(value).trim()
  return trimmed || fallback
}

const parseOrigins = (value) => {
  if (!value) return []
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .map((item) => item.replace(/\/$/, ''))
    .filter(Boolean)
}

const DEFAULT_CLIENT_ORIGINS = ['http://localhost:5173']

const resolvedOrigins = parseOrigins(process.env.CLIENT_ORIGIN)
const clientOrigins = resolvedOrigins.length ? resolvedOrigins : DEFAULT_CLIENT_ORIGINS
const allowAnyOrigin = clientOrigins.includes('*')

export const config = {
  port: numberFromEnv(process.env.PORT, 4000),
  clientOrigin: clientOrigins[0] || '',
  clientOrigins,
  allowAnyOrigin,
  adminEmail: process.env.ADMIN_EMAIL || 'admin@pashalawsenate.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'changeMe123',
  sessionTtlHours: numberFromEnv(process.env.SESSION_TTL_HOURS, 24),
  databasePath: stringFromEnv(process.env.DATABASE_PATH),
}
