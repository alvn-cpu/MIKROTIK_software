const { db } = require('./db');

class PlansRepo {
  static table() { return 'plans'; }

  static async create(p) {
    const [row] = await db()(this.table()).insert(p).returning('*');
    return row;
  }
  static async listActive() {
    return db()(this.table()).where({ is_active: true }).orderBy('price_cents');
  }
  static async findById(id) {
    return db()(this.table()).where({ id }).first();
  }
  static async update(id, patch) {
    const [row] = await db()(this.table()).where({ id }).update(patch).returning('*');
    return row;
  }
}

module.exports = PlansRepo;