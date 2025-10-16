import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { fileURLToPath } from 'url'
import { config } from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEFAULT_DB_DIR = path.join(__dirname, '..', 'data')
const DEFAULT_DB_FILENAME = 'pasha-law-senate.db'

const normaliseDatabasePath = () => {
  const configured = config.databasePath
  if (!configured) {
    return path.join(DEFAULT_DB_DIR, DEFAULT_DB_FILENAME)
  }

  const endsWithSeparator = configured.endsWith('/') || configured.endsWith('\\')
  const withFilename = endsWithSeparator
    ? path.join(configured, DEFAULT_DB_FILENAME)
    : configured

  if (path.isAbsolute(withFilename)) {
    return withFilename
  }

  return path.join(__dirname, '..', withFilename)
}

const databasePath = normaliseDatabasePath()
const databaseDir = path.dirname(databasePath)

fs.mkdirSync(databaseDir, { recursive: true })

if (!config.databasePath) {
  console.warn(
    `Using default SQLite location at ${databasePath}. Attach a persistent disk and set DATABASE_PATH to retain data across deployments.`
  )
}

export const db = new Database(databasePath)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS stats (
    key TEXT PRIMARY KEY,
    value REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    case_number TEXT NOT NULL,
    client TEXT NOT NULL,
    opponent TEXT,
    practice_area TEXT,
    next_date TEXT,
    status TEXT,
    courtroom TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    organisation TEXT NOT NULL,
    primary_contact TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    owner TEXT NOT NULL,
    due TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT,
    link TEXT,
    owner TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS support_desks (
    id TEXT PRIMARY KEY,
    department TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    hours TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`)

const STAT_KEYS = ['activeMatters', 'hearingsThisWeek', 'filingsPending', 'teamUtilisation']

const hashPassword = (password) => {
  const salt = randomBytes(16)
  const hashed = scryptSync(password, salt, 64)
  return `${salt.toString('hex')}:${hashed.toString('hex')}`
}

export const seedDefaults = () => {
  const insertStat = db.prepare('INSERT OR IGNORE INTO stats (key, value) VALUES (?, 0)')
  for (const key of STAT_KEYS) {
    insertStat.run(key)
  }

  const adminEmail = config.adminEmail.toLowerCase()
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail)
  if (!existingUser) {
    const passwordHash = hashPassword(config.adminPassword)
    db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)').run(
      adminEmail,
      passwordHash,
      'Pasha Law Senate Admin'
    )
  }
}

export const findUserByEmail = (email) => {
  return db.prepare('SELECT id, email, password_hash, name FROM users WHERE email = ?').get(email.toLowerCase())
}

export const createUser = ({ email, password, name }) => {
  const normalisedEmail = String(email || '').trim().toLowerCase()
  const trimmedName = String(name || '').trim()
  if (!normalisedEmail || !trimmedName) {
    throw new Error('Name and email are required.')
  }

  const passwordValue = String(password || '')
  const passwordHash = hashPassword(passwordValue)

  try {
    const result = db
      .prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
      .run(normalisedEmail, passwordHash, trimmedName)

    return {
      id: Number(result.lastInsertRowid),
      email: normalisedEmail,
      name: trimmedName,
    }
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      const duplicateError = new Error('A user with this email already exists.')
      duplicateError.code = 'USER_EXISTS'
      throw duplicateError
    }
    throw error
  }
}

export const createSession = (userId) => {
  const token = randomUUID()
  const createdAt = new Date()
  const expiresAt = new Date(createdAt.getTime() + config.sessionTtlHours * 60 * 60 * 1000)
  db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    token,
    userId,
    createdAt.toISOString(),
    expiresAt.toISOString()
  )
  return { token, createdAt: createdAt.toISOString(), expiresAt: expiresAt.toISOString() }
}

export const findSession = (token) => {
  const session = db
    .prepare(
      `SELECT sessions.token, sessions.user_id, sessions.expires_at, users.name, users.email
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token = ?`
    )
    .get(token)

  if (!session) return null
  if (new Date(session.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
    return null
  }
  return session
}

export const deleteSession = (token) => {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
}

const statsStatement = db.prepare('SELECT key, value FROM stats')

export const getStats = () => {
  const rows = statsStatement.all()
  return rows.reduce((acc, row) => {
    acc[row.key] = Number(row.value) || 0
    return acc
  }, {})
}

export const updateStats = (nextStats) => {
  const update = db.prepare('UPDATE stats SET value = ? WHERE key = ?')
  const stats = {}
  for (const key of STAT_KEYS) {
    const numericValue = Number(nextStats[key]) || 0
    update.run(numericValue, key)
    stats[key] = numericValue
  }
  return stats
}

const selectAll = (table) => db.prepare(`SELECT * FROM ${table} ORDER BY datetime(created_at) DESC`)

const mapCase = (row) => ({
  id: row.id,
  caseNumber: row.case_number,
  client: row.client,
  opponent: row.opponent,
  practiceArea: row.practice_area,
  nextDate: row.next_date,
  status: row.status,
  courtroom: row.courtroom,
  notes: row.notes,
  createdAt: row.created_at,
})

const mapClient = (row) => ({
  id: row.id,
  organisation: row.organisation,
  primaryContact: row.primary_contact,
  email: row.email,
  phone: row.phone,
  address: row.address,
  notes: row.notes,
  createdAt: row.created_at,
})

const mapTask = (row) => ({
  id: row.id,
  title: row.title,
  owner: row.owner,
  due: row.due,
  createdAt: row.created_at,
})

const mapTeamMember = (row) => ({
  id: row.id,
  name: row.name,
  role: row.role,
  phone: row.phone,
  email: row.email,
  createdAt: row.created_at,
})

const mapResource = (row) => ({
  id: row.id,
  title: row.title,
  type: row.type,
  link: row.link,
  owner: row.owner,
  notes: row.notes,
  createdAt: row.created_at,
})

const mapSupportDesk = (row) => ({
  id: row.id,
  department: row.department,
  phone: row.phone,
  email: row.email,
  hours: row.hours,
  notes: row.notes,
  createdAt: row.created_at,
})

export const getPortalData = () => ({
  stats: getStats(),
  cases: selectAll('cases')
    .all()
    .map(mapCase),
  clients: selectAll('clients')
    .all()
    .map(mapClient),
  tasks: selectAll('tasks')
    .all()
    .map(mapTask),
  team: selectAll('team_members')
    .all()
    .map(mapTeamMember),
  resources: selectAll('resources')
    .all()
    .map(mapResource),
  supportDesks: selectAll('support_desks')
    .all()
    .map(mapSupportDesk),
})

const replaceStatsStatement = db.prepare(
  'INSERT INTO stats (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
)

const replaceCaseStatement = db.prepare(
  `INSERT INTO cases (id, case_number, client, opponent, practice_area, next_date, status, courtroom, notes, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
   ON CONFLICT(id) DO UPDATE SET
     case_number = excluded.case_number,
     client = excluded.client,
     opponent = excluded.opponent,
     practice_area = excluded.practice_area,
     next_date = excluded.next_date,
     status = excluded.status,
     courtroom = excluded.courtroom,
     notes = excluded.notes,
     created_at = excluded.created_at`
)

const replaceClientStatement = db.prepare(
  `INSERT INTO clients (id, organisation, primary_contact, email, phone, address, notes, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)
   ON CONFLICT(id) DO UPDATE SET
     organisation = excluded.organisation,
     primary_contact = excluded.primary_contact,
     email = excluded.email,
     phone = excluded.phone,
     address = excluded.address,
     notes = excluded.notes,
     created_at = excluded.created_at`
)

const replaceTaskStatement = db.prepare(
  `INSERT INTO tasks (id, title, owner, due, created_at)
   VALUES (?, ?, ?, ?, ?)
   ON CONFLICT(id) DO UPDATE SET
     title = excluded.title,
     owner = excluded.owner,
     due = excluded.due,
     created_at = excluded.created_at`
)

const replaceTeamStatement = db.prepare(
  `INSERT INTO team_members (id, name, role, phone, email, created_at)
   VALUES (?, ?, ?, ?, ?, ?)
   ON CONFLICT(id) DO UPDATE SET
     name = excluded.name,
     role = excluded.role,
     phone = excluded.phone,
     email = excluded.email,
     created_at = excluded.created_at`
)

const replaceResourceStatement = db.prepare(
  `INSERT INTO resources (id, title, type, link, owner, notes, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)
   ON CONFLICT(id) DO UPDATE SET
     title = excluded.title,
     type = excluded.type,
     link = excluded.link,
     owner = excluded.owner,
     notes = excluded.notes,
     created_at = excluded.created_at`
)

const replaceSupportDeskStatement = db.prepare(
  `INSERT INTO support_desks (id, department, phone, email, hours, notes, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)
   ON CONFLICT(id) DO UPDATE SET
     department = excluded.department,
     phone = excluded.phone,
     email = excluded.email,
     hours = excluded.hours,
     notes = excluded.notes,
     created_at = excluded.created_at`
)

const clearTableStatements = {
  cases: db.prepare('DELETE FROM cases'),
  clients: db.prepare('DELETE FROM clients'),
  tasks: db.prepare('DELETE FROM tasks'),
  team: db.prepare('DELETE FROM team_members'),
  resources: db.prepare('DELETE FROM resources'),
  supportDesks: db.prepare('DELETE FROM support_desks'),
}

const replacePortalDataTransaction = db.transaction((payload) => {
  const stats = normaliseStatsInput(payload.stats)
  for (const key of STAT_KEYS) {
    replaceStatsStatement.run(key, stats[key])
  }

  clearTableStatements.cases.run()
  for (const item of toArray(payload.cases).map(normaliseCaseInput).filter((item) => item.caseNumber && item.client)) {
    replaceCaseStatement.run(
      item.id,
      item.caseNumber,
      item.client,
      item.opponent,
      item.practiceArea,
      item.nextDate,
      item.status,
      item.courtroom,
      item.notes,
      item.createdAt
    )
  }

  clearTableStatements.clients.run()
  for (const item of toArray(payload.clients)
    .map(normaliseClientInput)
    .filter((item) => item.organisation)) {
    replaceClientStatement.run(
      item.id,
      item.organisation,
      item.primaryContact,
      item.email,
      item.phone,
      item.address,
      item.notes,
      item.createdAt
    )
  }

  clearTableStatements.tasks.run()
  for (const item of toArray(payload.tasks).map(normaliseTaskInput).filter((item) => item.title && item.owner && item.due)) {
    replaceTaskStatement.run(item.id, item.title, item.owner, item.due, item.createdAt)
  }

  clearTableStatements.team.run()
  for (const item of toArray(payload.team).map(normaliseTeamInput).filter((item) => item.name && item.role)) {
    replaceTeamStatement.run(item.id, item.name, item.role, item.phone, item.email, item.createdAt)
  }

  clearTableStatements.resources.run()
  for (const item of toArray(payload.resources).map(normaliseResourceInput).filter((item) => item.title)) {
    replaceResourceStatement.run(
      item.id,
      item.title,
      item.type,
      item.link,
      item.owner,
      item.notes,
      item.createdAt
    )
  }

  clearTableStatements.supportDesks.run()
  for (const item of toArray(payload.supportDesks).map(normaliseSupportDeskInput).filter((item) => item.department)) {
    replaceSupportDeskStatement.run(
      item.id,
      item.department,
      item.phone,
      item.email,
      item.hours,
      item.notes,
      item.createdAt
    )
  }
})

export const replacePortalData = (payload = {}) => {
  replacePortalDataTransaction(payload)
  return getPortalData()
}

const insertStatements = {
  cases: db.prepare(
    `INSERT INTO cases (id, case_number, client, opponent, practice_area, next_date, status, courtroom, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ),
  clients: db.prepare(
    `INSERT INTO clients (id, organisation, primary_contact, email, phone, address, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ),
  tasks: db.prepare('INSERT INTO tasks (id, title, owner, due) VALUES (?, ?, ?, ?)'),
  team: db.prepare('INSERT INTO team_members (id, name, role, phone, email) VALUES (?, ?, ?, ?, ?)'),
  resources: db.prepare(
    'INSERT INTO resources (id, title, type, link, owner, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ),
  supportDesks: db.prepare(
    'INSERT INTO support_desks (id, department, phone, email, hours, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ),
}

const deleteStatements = {
  cases: db.prepare('DELETE FROM cases WHERE id = ?'),
  clients: db.prepare('DELETE FROM clients WHERE id = ?'),
  tasks: db.prepare('DELETE FROM tasks WHERE id = ?'),
  team: db.prepare('DELETE FROM team_members WHERE id = ?'),
  resources: db.prepare('DELETE FROM resources WHERE id = ?'),
  supportDesks: db.prepare('DELETE FROM support_desks WHERE id = ?'),
}

const newId = () => randomUUID()

const numberOrZero = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const normaliseOptional = (value) => {
  if (value === null || value === undefined) return null
  const trimmed = String(value).trim()
  return trimmed.length ? trimmed : null
}

const ensureTimestamp = (value) => {
  if (!value) return new Date().toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

const ensureId = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return trimmed || newId()
}

const normaliseStatsInput = (value = {}) => {
  const stats = {}
  for (const key of STAT_KEYS) {
    stats[key] = numberOrZero(value[key])
  }
  return stats
}

const normaliseCaseInput = (value = {}) => ({
  id: ensureId(value.id),
  caseNumber: String(value.caseNumber || value.case_number || '').trim(),
  client: String(value.client || '').trim(),
  opponent: normaliseOptional(value.opponent || value.opponent_name),
  practiceArea: normaliseOptional(value.practiceArea || value.practice_area),
  nextDate: normaliseOptional(value.nextDate || value.next_date),
  status: normaliseOptional(value.status),
  courtroom: normaliseOptional(value.courtroom),
  notes: normaliseOptional(value.notes),
  createdAt: ensureTimestamp(value.createdAt || value.created_at),
})

const normaliseClientInput = (value = {}) => ({
  id: ensureId(value.id),
  organisation: String(value.organisation || value.name || '').trim(),
  primaryContact: normaliseOptional(value.primaryContact || value.primary_contact),
  email: normaliseOptional(value.email),
  phone: normaliseOptional(value.phone),
  address: normaliseOptional(value.address),
  notes: normaliseOptional(value.notes),
  createdAt: ensureTimestamp(value.createdAt || value.created_at),
})

const normaliseTaskInput = (value = {}) => ({
  id: ensureId(value.id),
  title: String(value.title || '').trim(),
  owner: String(value.owner || '').trim(),
  due: normaliseOptional(value.due),
  createdAt: ensureTimestamp(value.createdAt || value.created_at),
})

const normaliseTeamInput = (value = {}) => ({
  id: ensureId(value.id),
  name: String(value.name || '').trim(),
  role: String(value.role || '').trim(),
  phone: normaliseOptional(value.phone),
  email: normaliseOptional(value.email),
  createdAt: ensureTimestamp(value.createdAt || value.created_at),
})

const normaliseResourceInput = (value = {}) => ({
  id: ensureId(value.id),
  title: String(value.title || '').trim(),
  type: normaliseOptional(value.type),
  link: normaliseOptional(value.link),
  owner: normaliseOptional(value.owner),
  notes: normaliseOptional(value.notes),
  createdAt: ensureTimestamp(value.createdAt || value.created_at),
})

const normaliseSupportDeskInput = (value = {}) => ({
  id: ensureId(value.id),
  department: String(value.department || '').trim(),
  phone: normaliseOptional(value.phone),
  email: normaliseOptional(value.email),
  hours: normaliseOptional(value.hours),
  notes: normaliseOptional(value.notes),
  createdAt: ensureTimestamp(value.createdAt || value.created_at),
})

const toArray = (value) => (Array.isArray(value) ? value : [])

export const createCase = (payload) => {
  const id = newId()
  insertStatements.cases.run(
    id,
    payload.caseNumber,
    payload.client,
    payload.opponent || null,
    payload.practiceArea || null,
    payload.nextDate || null,
    payload.status || null,
    payload.courtroom || null,
    payload.notes || null
  )
  const row = db.prepare('SELECT * FROM cases WHERE id = ?').get(id)
  return mapCase(row)
}

export const removeCase = (id) => {
  deleteStatements.cases.run(id)
}

export const createClient = (payload) => {
  const id = newId()
  insertStatements.clients.run(
    id,
    payload.organisation,
    payload.primaryContact || null,
    payload.email || null,
    payload.phone || null,
    payload.address || null,
    payload.notes || null
  )
  const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(id)
  return mapClient(row)
}

export const removeClient = (id) => {
  deleteStatements.clients.run(id)
}

export const createTask = (payload) => {
  const id = newId()
  insertStatements.tasks.run(id, payload.title, payload.owner, payload.due)
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  return mapTask(row)
}

export const removeTask = (id) => {
  deleteStatements.tasks.run(id)
}

export const createTeamMember = (payload) => {
  const id = newId()
  insertStatements.team.run(id, payload.name, payload.role, payload.phone || null, payload.email || null)
  const row = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id)
  return mapTeamMember(row)
}

export const removeTeamMember = (id) => {
  deleteStatements.team.run(id)
}

export const createResource = (payload) => {
  const id = newId()
  insertStatements.resources.run(
    id,
    payload.title,
    payload.type || null,
    payload.link || null,
    payload.owner || null,
    payload.notes || null
  )
  const row = db.prepare('SELECT * FROM resources WHERE id = ?').get(id)
  return mapResource(row)
}

export const removeResource = (id) => {
  deleteStatements.resources.run(id)
}

export const createSupportDesk = (payload) => {
  const id = newId()
  insertStatements.supportDesks.run(
    id,
    payload.department,
    payload.phone || null,
    payload.email || null,
    payload.hours || null,
    payload.notes || null
  )
  const row = db.prepare('SELECT * FROM support_desks WHERE id = ?').get(id)
  return mapSupportDesk(row)
}

export const removeSupportDesk = (id) => {
  deleteStatements.supportDesks.run(id)
}

export const verifyPassword = (storedHash, input) => {
  if (!storedHash || !input) return false
  const [saltHex, hashHex] = storedHash.split(':')
  if (!saltHex || !hashHex) return false
  try {
    const inputBuffer = scryptSync(input, Buffer.from(saltHex, 'hex'), 64)
    const storedBuffer = Buffer.from(hashHex, 'hex')
    return timingSafeEqual(inputBuffer, storedBuffer)
  } catch (error) {
    console.error('Failed to verify password', error)
    return false
  }
}
