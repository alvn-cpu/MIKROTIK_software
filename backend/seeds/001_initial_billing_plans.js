/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('billing_plans').del();
  
  // Insert seed entries
  await knex('billing_plans').insert([
    {
      name: 'Basic',
      description: 'Perfect for light browsing and social media',
      price: 50.00,
      duration_hours: 24,
      data_limit_mb: 1024, // 1GB
      active: true
    },
    {
      name: 'Standard', 
      description: 'Great for streaming and downloads',
      price: 150.00,
      duration_hours: 72, // 3 days
      data_limit_mb: 5120, // 5GB
      active: true
    },
    {
      name: 'Premium',
      description: 'Unlimited browsing for heavy users', 
      price: 300.00,
      duration_hours: 168, // 7 days
      data_limit_mb: null, // Unlimited
      active: true
    },
    {
      name: 'Weekly',
      description: '7 days of unlimited internet access',
      price: 500.00,
      duration_hours: 168,
      data_limit_mb: null,
      active: true
    },
    {
      name: 'Monthly',
      description: '30 days of unlimited internet access',
      price: 1500.00,
      duration_hours: 720, // 30 days
      data_limit_mb: null,
      active: true
    }
  ]);
};