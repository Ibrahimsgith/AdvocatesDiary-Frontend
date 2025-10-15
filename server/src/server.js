import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import {
  config,
} from './config.js'
import {
  seedDefaults,
  findUserByEmail,
  verifyPassword,
  createSession,
  findSession,
  deleteSession,
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

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const [, token] = authHeader.split(' ')
  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' })
  }
  const session = findSession(token)
  if (!session) {
    return res.status(401).json({ message: 'Session expired or invalid.' })
  }
  req.session = session
  req.token = token
  next()
}

app.post(
  '/api/auth/logout',
  authenticate,
  asyncHandler((req, res) => {
    deleteSession(req.token)
    res.status(204).end()
  })
)

app.get(
  '/api/auth/session',
  authenticate,
  asyncHandler((req, res) => {
    res.json({
      user: { email: req.session.email, name: req.session.name },
      token: req.token,
    })
  })
)

app.get(
  '/api/portal',
  authenticate,
  asyncHandler((req, res) => {
    res.json(getPortalData())
  })
)

app.put(
  '/api/portal/stats',
  authenticate,
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
  authenticate,
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
  authenticate,
  asyncHandler((req, res) => {
    removeCase(req.params.id)
    res.status(204).end()
  })
)

app.post(
  '/api/clients',
  authenticate,
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
  authenticate,
  asyncHandler((req, res) => {
    removeClient(req.params.id)
    res.status(204).end()
  })
)

app.post(
  '/api/tasks',
  authenticate,
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
  authenticate,
  asyncHandler((req, res) => {
    removeTask(req.params.id)
    res.status(204).end()
  })
)

app.post(
  '/api/team',
  authenticate,
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
  authenticate,
  asyncHandler((req, res) => {
    removeTeamMember(req.params.id)
    res.status(204).end()
  })
)

app.post(
  '/api/resources',
  authenticate,
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
  authenticate,
  asyncHandler((req, res) => {
    removeResource(req.params.id)
    res.status(204).end()
  })
)

app.post(
  '/api/support-desks',
  authenticate,
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
  authenticate,
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
