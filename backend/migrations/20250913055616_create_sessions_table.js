/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('sessions', function(table) {
    table.increments('id').primary();
    table.integer('user_id').notNullable();
    table.integer('plan_id').notNullable();
    table.string('session_id', 255).unique(); // MikroTik session identifier
    table.timestamp('start_time').defaultTo(knex.fn.now());
    table.timestamp('end_time').nullable();
    table.bigInteger('data_used_mb').defaultTo(0);
    table.integer('session_time_seconds').defaultTo(0);
    table.enum('status', ['active', 'ended', 'expired', 'terminated']).defaultTo('active');
    table.string('ip_address', 45); // IPv4 or IPv6
    table.string('mac_address', 18);
    table.string('nas_ip', 45);
    table.string('nas_port', 100);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Foreign key constraints
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('plan_id').references('id').inTable('billing_plans').onDelete('CASCADE');
    
    // Indexes for performance
    table.index('user_id');
    table.index('status');
    table.index('start_time');
    table.index(['user_id', 'status']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('sessions');
};