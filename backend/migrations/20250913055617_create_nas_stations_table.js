/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('nas_stations', function(table) {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('ip_address', 45).notNullable().unique();
    table.string('secret', 255).notNullable(); // RADIUS shared secret
    table.enum('type', ['mikrotik', 'cisco', 'other']).defaultTo('mikrotik');
    table.enum('status', ['active', 'inactive', 'maintenance']).defaultTo('active');
    table.string('description', 500);
    table.json('config'); // Additional configuration parameters
    table.timestamp('last_seen').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('status');
    table.index('type');
    table.index('last_seen');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('nas_stations');
};