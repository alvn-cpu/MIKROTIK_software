const { db } = require('./db');

class UsersRepo {
  static table() { return 'users'; }

  static async create({ email, phone, password_hash, role = 'user' }) {
    const [row] = await db()(this.table()).insert({ email, phone, password_hash, role }).returning('*');
    return row;
  }

  static async findByEmail(email) {
    return db()(this.table()).where({ email }).first();
  }

  static async findById(id) {
    return db()(this.table()).where({ id }).first();
  }

  static async update(id, patch) {
    const [row] = await db()(this.table()).where({ id }).update(patch).returning('*');
    return row;
  }
}

module.exports = UsersRepo;