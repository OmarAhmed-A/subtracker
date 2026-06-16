import bcrypt from 'bcryptjs'
import db from '../db.js'

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10)
}

export function verifyPassword(password, hashed) {
  return bcrypt.compareSync(password, hashed)
}

export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ detail: 'Not authenticated' })
  }
  const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(req.session.userId)
  if (!user) {
    req.session.destroy()
    return res.status(401).json({ detail: 'User not found' })
  }
  req.user = user
  next()
}
