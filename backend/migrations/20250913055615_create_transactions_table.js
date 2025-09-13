/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('transactions', function(table) {
    table.increments('id').primary();
    table.integer('user_id').notNullable();
    table.integer('plan_id').notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.enum('status', ['pending', 'completed', 'failed', 'refunded']).defaultTo('pending');
    table.string('transaction_id', 255).unique(); // For external payment gateway reference
    table.string('payment_method', 100); // MPESA, card, bank, etc.
    table.text('payment_details'); // JSON for payment gateway specific data
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Foreign key constraints
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('plan_id').references('id').inTable('billing_plans').onDelete('CASCADE');
    
    // Indexes
    table.index('user_id');
    table.index('status');
    table.index('created_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('transactions');
};