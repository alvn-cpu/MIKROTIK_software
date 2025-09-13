exports.up = async function(knex) {
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('email').notNullable().unique();
    t.string('phone').unique();
    t.string('password_hash').notNullable();
    t.string('role').notNullable().defaultTo('user'); // 'user' | 'admin'
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamp('last_login_at');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('stations', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name').notNullable();
    t.string('router_ip').notNullable();
    t.string('hotspot_name').notNullable();
    t.string('hotspot_interface').notNullable();
    t.string('address_pool').notNullable();
    t.string('radius_host').notNullable();
    t.string('radius_secret').notNullable();
    t.integer('radius_auth_port').notNullable().defaultTo(1812);
    t.integer('radius_acct_port').notNullable().defaultTo(1813);
    t.integer('radius_coa_port').notNullable().defaultTo(3799);
    t.boolean('is_trusted').notNullable().defaultTo(false);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('plans', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name').notNullable();
    t.integer('price_cents').notNullable();
    t.string('currency').notNullable().defaultTo('KES');
    t.integer('duration_minutes').notNullable();
    t.integer('speed_down_kbps').nullable();
    t.integer('speed_up_kbps').nullable();
    t.bigInteger('data_cap_mb').nullable();
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('sessions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users');
    t.uuid('station_id').notNullable().references('id').inTable('stations');
    t.string('username').notNullable(); // RADIUS username
    t.string('framed_ip').nullable();
    t.string('radius_session_id').nullable();
    t.timestamp('started_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('ended_at').nullable();
    t.bigInteger('input_octets').notNullable().defaultTo(0);
    t.bigInteger('output_octets').notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('transactions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').references('id').inTable('users');
    t.uuid('plan_id').references('id').inTable('plans');
    t.uuid('station_id').references('id').inTable('stations');
    t.string('provider').notNullable(); // 'daraja' | 'kcb_buni'
    t.string('status').notNullable().defaultTo('pending'); // pending|success|failed|cancelled
    t.integer('amount_cents').notNullable();
    t.string('currency').notNullable().defaultTo('KES');
    t.string('phone').notNullable();
    t.string('checkout_request_id').nullable();
    t.string('merchant_request_id').nullable();
    t.string('provider_receipt').nullable();
    t.jsonb('raw').nullable();
    t.timestamps(true, true);
    t.index(['provider', 'status']);
  });

  await knex.schema.createTable('accounting_records', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('session_id').references('id').inTable('sessions');
    t.uuid('user_id').references('id').inTable('users');
    t.uuid('station_id').references('id').inTable('stations');
    t.integer('interval_seconds').notNullable().defaultTo(300);
    t.bigInteger('input_octets').notNullable().defaultTo(0);
    t.bigInteger('output_octets').notNullable().defaultTo(0);
    t.timestamp('recorded_at').notNullable().defaultTo(knex.fn.now());
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('accounting_records');
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('plans');
  await knex.schema.dropTableIfExists('stations');
  await knex.schema.dropTableIfExists('users');
};
