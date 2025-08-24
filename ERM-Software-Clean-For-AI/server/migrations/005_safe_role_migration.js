/** @param {import('knex').Knex} knex */
export async function up(knex) {
	// Step 1: Add a temporary role_new column
	await knex.schema.alterTable('users', (t) => {
		t.string('role_new').nullable()
	})
	
	// Step 2: Backfill role_new with canonical values
	const roleMappings = {
		'champion': 'Risk Champion',
		'rc': 'Risk Champion',
		'risk_champion': 'Risk Champion',
		'owner': 'Risk Owner',
		'ro': 'Risk Owner',
		'risk_owner': 'Risk Owner',
		'admin': 'Admin',
		'administrator': 'Admin',
		'exec': 'Executive',
		'executive': 'Executive',
		'user': 'Team Member',
		'member': 'Team Member',
		'tm': 'Team Member'
	}
	
	// Update each legacy role
	for (const [oldRole, newRole] of Object.entries(roleMappings)) {
		await knex('users')
			.whereRaw('LOWER(role) = ?', [oldRole.toLowerCase()])
			.update({ role_new: newRole })
	}
	
	// Set default for any remaining roles
	await knex('users')
		.whereNull('role_new')
		.update({ role_new: 'Team Member' })
	
	// Step 3: Rebuild the users table with proper constraints
	// Create new table with correct structure
	await knex.schema.createTable('users_new', (t) => {
		t.increments('id').primary()
		t.string('email').notNullable().unique()
		t.string('name').notNullable()
		t.enu('role', ['Admin', 'Risk Champion', 'Risk Owner', 'Executive', 'Team Member']).notNullable()
		t.integer('department_id').nullable().references('id').inTable('departments').onDelete('SET NULL')
		t.string('password_hash').notNullable()
		t.boolean('is_active').notNullable().defaultTo(true)
		t.timestamp('created_at').defaultTo(knex.fn.now())
		t.timestamp('updated_at').defaultTo(knex.fn.now())
	})
	
	// Copy data from old table to new table
	await knex.raw(`
		INSERT INTO users_new (id, email, name, role, department_id, password_hash, is_active, created_at, updated_at)
		SELECT id, email, name, role_new, department_id, password_hash, is_active, created_at, updated_at
		FROM users
	`)
	
	// Drop old table and rename new one
	await knex.schema.dropTable('users')
	await knex.schema.renameTable('users_new', 'users')
	
	// Step 4: Add performance indexes
	await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_department_role ON users(department_id, role)')
	await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email))')
	await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)')
	await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)')
	
	console.log('✅ User roles migrated successfully')
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
	// This migration is not easily reversible due to table rebuild
	// In production, you would need to restore from backup
	console.log('⚠️  This migration cannot be safely reversed. Restore from backup if needed.')
}
