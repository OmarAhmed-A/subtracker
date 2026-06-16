import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import authRoutes from './routes/auth.js'
import subscriptionRoutes from './routes/subscriptions.js'
import dashboardRoutes from './routes/dashboard.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(cookieParser())
app.use(session({
  secret: process.env.SECRET_KEY || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: new session.MemoryStore(),
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}))

app.use('/api/auth', authRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/dashboard', dashboardRoutes)

const staticDir = join(__dirname, '..', 'frontend', 'dist')
if (existsSync(staticDir)) {
  app.use(express.static(staticDir))
  app.get(/.*/, (req, res) => {
    res.sendFile(join(staticDir, 'index.html'))
  })
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'SubTracker API is running' })
  })
}

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ detail: 'Internal server error' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SubTracker running on port ${PORT}`)
})
