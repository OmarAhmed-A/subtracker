import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createAgent, registerUser } from './helper.js'

describe('auth', () => {
  it('registers and returns user', async () => {
    const agent = createAgent()
    const res = await registerUser(agent, 'alice', 'secret')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.body.username, 'alice')
  })

  it('logs in with valid credentials', async () => {
    const agent = createAgent()
    await registerUser(agent, 'bob', 'secret')
    const res = await agent.post('/api/auth/login').send({ username: 'bob', password: 'secret' })
    assert.strictEqual(res.status, 200)
  })

  it('rejects invalid credentials', async () => {
    const agent = createAgent()
    await registerUser(agent, 'carol', 'secret')
    const res = await agent.post('/api/auth/login').send({ username: 'carol', password: 'wrong' })
    assert.strictEqual(res.status, 401)
  })

  it('returns current user when authenticated', async () => {
    const agent = createAgent()
    await registerUser(agent, 'dave', 'secret')
    const res = await agent.get('/api/auth/me')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.body.username, 'dave')
  })
})
