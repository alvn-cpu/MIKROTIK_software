const { db } = require('./db');

class SessionsRepo {
  static table() { return 'sessions'; }
  static async create(p) { const [row] = await db()(this.table()).insert(p).returning('*'); return row; }
  static async update(id, patch) { const [row] = await db()(this.table()).where({ id }).update(patch).returning('*'); return row; }
  static async findActiveByUser(user_id) { return db()(this.table()).where({ user_id }).andWhereNull('ended_at'); }
}

module.exports = SessionsRepo;