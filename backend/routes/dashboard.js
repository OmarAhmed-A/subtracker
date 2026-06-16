import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const CYCLE_MULTIPLIERS = {
  weekly: 52 / 12,
  monthly: 1,
  yearly: 1 / 12,
}

function convert(amount, fromCurrency, toCurrency, rate) {
  if (fromCurrency === toCurrency) return amount
  if (fromCurrency === 'USD' && toCurrency === 'EGP') return amount * rate
  if (fromCurrency === 'EGP' && toCurrency === 'USD') return amount / rate
  throw new Error('Unsupported currency conversion')
}

router.get('/', requireAuth, (req, res) => {
  const currency = req.query.currency === 'EGP' ? 'EGP' : 'USD'
  const rateRow = db.prepare("SELECT value FROM settings WHERE key = 'usd_to_egp'").get()
  const rate = parseFloat(rateRow?.value || '50.0')

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

  res.json({
    monthly_total: Math.round(monthlyTotal * 100) / 100,
    yearly_total: Math.round(monthlyTotal * 12 * 100) / 100,
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
