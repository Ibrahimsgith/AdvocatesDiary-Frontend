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

export const config = {
  port: numberFromEnv(process.env.PORT, 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@pashalawsenate.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'changeMe123',
  sessionTtlHours: numberFromEnv(process.env.SESSION_TTL_HOURS, 24),
  databasePath: stringFromEnv(process.env.DATABASE_PATH),
}
