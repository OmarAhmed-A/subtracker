import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function rowToSubscription(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    cost: row.cost,
    currency: row.currency,
    cycle: row.cycle,
    next_renewal: row.next_renewal,
    category: row.category,
    notes: row.notes,
    active: Boolean(row.active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY next_renewal ASC'
  ).all(req.user.id)
  res.json(rows.map(rowToSubscription))
})

router.post('/', requireAuth, (req, res) => {
  const { name, cost, currency, cycle, next_renewal, category, notes, active } = req.body
  const result = db.prepare(
    `INSERT INTO subscriptions (user_id, name, cost, currency, cycle, next_renewal, category, notes, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(req.user.id, name, cost, currency, cycle, next_renewal, category || 'Uncategorized', notes || null, active !== false ? 1 : 0)
  const row = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(rowToSubscription(row))
})

router.get('/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!row) return res.status(404).json({ detail: 'Not found' })
  res.json(rowToSubscription(row))
})

router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!existing) return res.status(404).json({ detail: 'Not found' })

  const fields = []
  const values = []
  const { name, cost, currency, cycle, next_renewal, category, notes, active } = req.body
  if (name !== undefined) { fields.push('name = ?'); values.push(name) }
  if (cost !== undefined) { fields.push('cost = ?'); values.push(cost) }
  if (currency !== undefined) { fields.push('currency = ?'); values.push(currency) }
  if (cycle !== undefined) { fields.push('cycle = ?'); values.push(cycle) }
  if (next_renewal !== undefined) { fields.push('next_renewal = ?'); values.push(next_renewal) }
  if (category !== undefined) { fields.push('category = ?'); values.push(category) }
  if (notes !== undefined) { fields.push('notes = ?'); values.push(notes) }
  if (active !== undefined) { fields.push('active = ?'); values.push(active ? 1 : 0) }
  if (fields.length === 0) return res.status(400).json({ detail: 'No fields to update' })

  fields.push('updated_at = CURRENT_TIMESTAMP')
  values.push(req.params.id)

  db.prepare(`UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  const row = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id)
  res.json(rowToSubscription(row))
})

router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!existing) return res.status(404).json({ detail: 'Not found' })
  db.prepare('DELETE FROM subscriptions WHERE id = ?').run(req.params.id)
  res.json({ message: 'Deleted' })
})

export default router
