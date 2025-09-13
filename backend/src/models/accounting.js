const { db } = require('./db');

class AccountingRepo {
  static table() { return 'accounting_records'; }
  static async create(p) { const [row] = await db()(this.table()).insert(p).returning('*'); return row; }
  static async listBySession(session_id, limit = 100) { return db()(this.table()).where({ session_id }).orderBy('recorded_at', 'desc').limit(limit); }
}

module.exports = AccountingRepo;