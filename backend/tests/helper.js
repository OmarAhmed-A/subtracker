import request from 'supertest'
import app from '../server.js'
import db from '../db.js'

export { app, db }

export function createAgent() {
  return request.agent(app)
}

export async function registerUser(agent, username, password) {
  return agent.post('/api/auth/register').send({ username, password })
}
