import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function getStoredRate() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'usd_to_egp'").get()
  if (!row) return { rate: 50.0, updatedAt: null }
  try {
    const parsed = JSON.parse(row.value)
    if (typeof parsed === 'number') {
      return { rate: parsed, updatedAt: null }
    }
    return { rate: parsed.rate, updatedAt: parsed.updatedAt || null }
  } catch {
    const rate = parseFloat(row.value)
    return { rate: Number.isFinite(rate) ? rate : 50.0, updatedAt: null }
  }
}

router.get('/', requireAuth, (req, res) => {
  const stored = getStoredRate()
  res.json({
    usd_to_egp: stored.rate,
    usd_to_egp_updated_at: stored.updatedAt,
  })
})

router.put('/usd-to-egp', requireAuth, (req, res) => {
  const { rate } = req.body
  const parsed = parseFloat(rate)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return res.status(400).json({ detail: 'Rate must be a positive number' })
  }
  const payload = JSON.stringify({ rate: parsed, updatedAt: Date.now() })
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('usd_to_egp', ?)").run(payload)
  res.json({ usd_to_egp: parsed })
})

export default router
