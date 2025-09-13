const { db } = require('./db');

class StationsRepo {
  static table() { return 'stations'; }
  static async create(p) { const [row] = await db()(this.table()).insert(p).returning('*'); return row; }
  static async findById(id) { return db()(this.table()).where({ id }).first(); }
  static async listTrusted() { return db()(this.table()).where({ is_trusted: true }).orderBy('created_at', 'desc'); }
  static async update(id, patch) { const [row] = await db()(this.table()).where({ id }).update(patch).returning('*'); return row; }
}

module.exports = StationsRepo;