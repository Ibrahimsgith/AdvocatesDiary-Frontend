import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config.js'
import {
  seedDefaults,
  findUserByEmail,
  createUser,
  verifyPassword,
  createSession,
  getPortalData,
  updateStats,
  createCase,
  removeCase,
  createClient,
  removeClient,
  createTask,
  removeTask,
  createTeamMember,
  removeTeamMember,
  createResource,
  removeResource,
  createSupportDesk,
  removeSupportDesk,
} from './database.js'

seedDefaults()

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: false,
  })
)
app.use(express.json())

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.post(
  '/api/auth/login',
  asyncHandler((req, res) => {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = findUserByEmail(String(email).toLowerCase())
    if (!user || !verifyPassword(user.password_hash, password)) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const session = createSession(user.id)

    res.json({
      token: session.token,
      user: { id: user.id, email: user.email, name: user.name },
      expiresAt: session.expiresAt,
    })
  })
)

app.post(
  '/api/auth/register',
  asyncHandler((req, res) => {
    const { email, password, name } = req.body || {}
    const trimmedName = typeof name === 'string' ? name.trim() : ''
    const normalisedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    if (!trimmedName || !normalisedEmail) {
      return res.status(400).json({ message: 'Name and email are required.' })
    }
    if (!password || String(password).length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long.' })
    }

    try {
      const user = createUser({ email: normalisedEmail, password, name: trimmedName })
      const session = createSession(user.id)

      res.status(201).json({
        token: session.token,
        user: { id: user.id, email: user.email, name: user.name },
        expiresAt: session.expiresAt,
      })
    } catch (error) {
      if (error?.code === 'USER_EXISTS') {
        return res.status(409).json({ message: 'An account with this email already exists.' })
      }
      throw error
    }
  })
)

app.get(
  '/api/portal',
  asyncHandler((req, res) => {
    res.json(getPortalData())
  })
)

app.put(
  '/api/portal/stats',
  asyncHandler((req, res) => {
    const allowedKeys = ['activeMatters', 'hearingsThisWeek', 'filingsPending', 'teamUtilisation']
    const stats = updateStats(req.body || {})
    for (const key of Object.keys(stats)) {
      if (!allowedKeys.includes(key)) {
        delete stats[key]
      }
    }
    res.json({ stats })
  })
)

app.post(
  '/api/cases',
  asyncHandler((req, res) => {
    const { caseNumber, client } = req.body || {}
    if (!caseNumber || !client) {
      return res.status(400).json({ message: 'Case number and client are required.' })
    }
    const created = createCase(req.body)
    res.status(201).json(created)
  })
)

app.delete(
  '/api/cases/:id',
  asyncHandler((req, res) => {
    removeCase(req.params.id)
    res.status(204).end()
  })
)

app.post(
  '/api/clients',
  asyncHandler((req, res) => {
    const { organisation } = req.body || {}
    if (!organisation) {
      return res.status(400).json({ message: 'Organisation name is required.' })
    }
    const created = createClient(req.body)
    res.status(201).json(created)
  })
)

app.delete(
  '/api/clients/:id',
  asyncHandler((req, res) => {
    removeClient(req.params.id)
    res.status(204).end()
  })
)

app.post(
  '/api/tasks',
  asyncHandler((req, res) => {
    const { title, owner, due } = req.body || {}
    if (!title || !owner || !due) {
      return res.status(400).json({ message: 'Title, owner, and due date are required.' })
    }
    const created = createTask(req.body)
    res.status(201).json(created)
  })
)

app.delete(
  '/api/tasks/:id',
  asyncHandler((req, res) => {
    removeTask(req.params.id)
    res.status(204).end()
  })
)

app.post(
  '/api/team',
  asyncHandler((req, res) => {
    const { name, role } = req.body || {}
    if (!name || !role) {
      return res.status(400).json({ message: 'Name and role are required.' })
    }
    const created = createTeamMember(req.body)
    res.status(201).json(created)
  })
)

app.delete(
  '/api/team/:id',
  asyncHandler((req, res) => {
    removeTeamMember(req.params.id)
    res.status(204).end()
  })
)

app.post(
  '/api/resources',
  asyncHandler((req, res) => {
    const { title } = req.body || {}
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' })
    }
    const created = createResource(req.body)
    res.status(201).json(created)
  })
)

app.delete(
  '/api/resources/:id',
  asyncHandler((req, res) => {
    removeResource(req.params.id)
    res.status(204).end()
  })
)

app.post(
  '/api/support-desks',
  asyncHandler((req, res) => {
    const { department } = req.body || {}
    if (!department) {
      return res.status(400).json({ message: 'Department is required.' })
    }
    const created = createSupportDesk(req.body)
    res.status(201).json(created)
  })
)

app.delete(
  '/api/support-desks/:id',
  asyncHandler((req, res) => {
    removeSupportDesk(req.params.id)
    res.status(204).end()
  })
)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'An unexpected error occurred.' })
})

export const createServer = () => app
