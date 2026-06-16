import './setup.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createAgent, registerUser } from './helper.js'

describe('subscriptions', () => {
  async function createSubscription(agent) {
    return agent.post('/api/subscriptions').send({
      name: 'Netflix',
      cost: 15.49,
      currency: 'USD',
      cycle: 'monthly',
      next_renewal: '2026-06-20',
      category: 'Entertainment',
    })
  }

  it('creates a subscription', async () => {
    const agent = createAgent()
    await registerUser(agent, 'user1', 'secret')
    const res = await createSubscription(agent)
    assert.strictEqual(res.status, 201)
    assert.strictEqual(res.body.name, 'Netflix')
  })

  it('lists subscriptions', async () => {
    const agent = createAgent()
    await registerUser(agent, 'user2', 'secret')
    await createSubscription(agent)
    const res = await agent.get('/api/subscriptions')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.body.length, 1)
  })

  it('updates a subscription', async () => {
    const agent = createAgent()
    await registerUser(agent, 'user3', 'secret')
    const created = await createSubscription(agent)
    const res = await agent.put(`/api/subscriptions/${created.body.id}`).send({ cost: 17 })
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.body.cost, 17)
  })

  it('deletes a subscription', async () => {
    const agent = createAgent()
    await registerUser(agent, 'user4', 'secret')
    const created = await createSubscription(agent)
    const res = await agent.delete(`/api/subscriptions/${created.body.id}`)
    assert.strictEqual(res.status, 200)
  })
})
