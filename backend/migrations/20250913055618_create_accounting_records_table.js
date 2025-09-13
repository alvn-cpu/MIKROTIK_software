/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('accounting_records', function(table) {
    table.increments('id').primary();
    table.integer('session_id').nullable(); // Can be null for records not tied to our sessions
    table.integer('user_id').nullable();
    table.string('username', 255).notNullable();
    table.string('nas_ip', 45).notNullable();
    table.string('nas_port', 100);
    table.string('nas_port_type', 50);
    table.string('client_ip', 45);
    table.string('calling_station_id', 50); // MAC address
    table.string('called_station_id', 50);
    table.bigInteger('bytes_in').defaultTo(0);
    table.bigInteger('bytes_out').defaultTo(0);
    table.bigInteger('packets_in').defaultTo(0);
    table.bigInteger('packets_out').defaultTo(0);
    table.integer('session_time').defaultTo(0); // in seconds
    table.enum('acct_status_type', ['start', 'stop', 'update', 'accounting-on', 'accounting-off']);
    table.string('acct_session_id', 255);
    table.string('terminate_cause', 100);
    table.timestamp('event_timestamp').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Foreign key constraints (optional references)
    table.foreign('session_id').references('id').inTable('sessions').onDelete('SET NULL');
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    
    // Indexes for performance
    table.index('username');
    table.index('nas_ip');
    table.index('acct_session_id');
    table.index('acct_status_type');
    table.index('event_timestamp');
    table.index(['username', 'event_timestamp']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('accounting_records');
};