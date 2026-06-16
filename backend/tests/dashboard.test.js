import './setup.js'
import { describe, it, before } from 'node:test'
import assert from 'node:assert'
import { createAgent, registerUser } from './helper.js'

describe('dashboard', () => {
  before(() => {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ result: 'success', rates: { EGP: 50 } }),
    })
  })

  it('converts totals to EGP', async () => {
    const agent = createAgent()
    await registerUser(agent, 'user5', 'secret')
    await agent.post('/api/subscriptions').send({
      name: 'Spotify',
      cost: 10,
      currency: 'USD',
      cycle: 'monthly',
      next_renewal: '2026-06-20',
    })
    const usd = await agent.get('/api/dashboard?currency=USD')
    assert.strictEqual(usd.body.monthly_total, 10)
    const egp = await agent.get('/api/dashboard?currency=EGP')
    assert.strictEqual(egp.body.monthly_total, 500)
  })
})
