import session from 'express-session'
import db from './db.js'

const Store = session.Store

class SqliteSessionStore extends Store {
  constructor() {
    super()
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        sess TEXT NOT NULL,
        expired INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions(expired);
    `)
  }

  get(sid, cb) {
    try {
      const row = db.prepare('SELECT sess FROM sessions WHERE sid = ? AND expired > ?').get(sid, Date.now())
      if (!row) return cb(null, null)
      const sess = JSON.parse(row.sess)
      cb(null, sess)
    } catch (err) {
      cb(err)
    }
  }

  set(sid, sess, cb) {
    try {
      const maxAge = sess.cookie?.maxAge || 86400000
      const expired = Date.now() + maxAge
      db.prepare('INSERT OR REPLACE INTO sessions (sid, sess, expired) VALUES (?, ?, ?)').run(
        sid,
        JSON.stringify(sess),
        expired
      )
      cb(null)
    } catch (err) {
      cb(err)
    }
  }

  destroy(sid, cb) {
    try {
      db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid)
      cb(null)
    } catch (err) {
      cb(err)
    }
  }

  touch(sid, sess, cb) {
    this.set(sid, sess, cb)
  }
}

export default SqliteSessionStore
