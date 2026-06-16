import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { getUsdToEgp, convert } from '../services/currency.js'

const router = Router()

const CYCLE_MULTIPLIERS = {
  weekly: 52 / 12,
  monthly: 1,
  yearly: 1 / 12,
}

router.get('/', requireAuth, async (req, res) => {
  const currency = req.query.currency === 'EGP' ? 'EGP' : 'USD'
  const rate = await getUsdToEgp()

  const rows = db.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ? AND active = 1 ORDER BY next_renewal ASC'
  ).all(req.user.id)

  let monthlyTotal = 0
  for (const sub of rows) {
    const converted = convert(sub.cost, sub.currency, currency, rate)
    monthlyTotal += converted * CYCLE_MULTIPLIERS[sub.cycle]
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = rows.find((sub) => sub.next_renewal >= today) || null

  const safeMonthly = Number.isFinite(monthlyTotal) ? monthlyTotal : 0

  res.json({
    monthly_total: Math.round(safeMonthly * 100) / 100,
    yearly_total: Math.round(safeMonthly * 12 * 100) / 100,
    active_count: rows.length,
    upcoming: upcoming ? {
      id: upcoming.id,
      name: upcoming.name,
      cost: upcoming.cost,
      currency: upcoming.currency,
      cycle: upcoming.cycle,
      next_renewal: upcoming.next_renewal,
      category: upcoming.category,
    } : null,
    currency,
  })
})

export default router
