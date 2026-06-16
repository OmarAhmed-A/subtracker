import { Router } from 'express'
import db from '../db.js'
import { hashPassword, verifyPassword, requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/register', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ detail: 'Username and password required' })
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) {
    return res.status(400).json({ detail: 'Username already exists' })
  }
  const result = db.prepare(
    'INSERT INTO users (username, hashed_password) VALUES (?, ?)'
  ).run(username, hashPassword(password))
  req.session.userId = result.lastInsertRowid
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(result.lastInsertRowid)
  res.json(user)
})

router.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user || !verifyPassword(password, user.hashed_password)) {
    return res.status(401).json({ detail: 'Invalid credentials' })
  }
  req.session.userId = user.id
  res.json({ message: 'Logged in' })
})

router.post('/logout', (req, res) => {
  req.session.destroy(() => {})
  res.json({ message: 'Logged out' })
})

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user)
})

export default router
