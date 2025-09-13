const { db } = require('./db');

class TransactionsRepo {
  static table() { return 'transactions'; }
  static async create(p) { const [row] = await db()(this.table()).insert(p).returning('*'); return row; }
  static async findById(id) { return db()(this.table()).where({ id }).first(); }
  static async findByCheckoutId(checkout_request_id) { return db()(this.table()).where({ checkout_request_id }).first(); }
  static async update(id, patch) { const [row] = await db()(this.table()).where({ id }).update(patch).returning('*'); return row; }
}

module.exports = TransactionsRepo;