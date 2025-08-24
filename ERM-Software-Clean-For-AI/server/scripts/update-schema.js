import { knex } from '../lib/knex.js'

async function updateSchema() {
	try {
		console.log('Starting database schema update...')
		
		// Check if audit_trail table exists
		const hasAuditTrail = await knex.schema.hasTable('audit_trail')
		if (!hasAuditTrail) {
			console.log('Creating audit_trail table...')
			await knex.schema.createTable('audit_trail', (t) => {
				t.increments('id').primary()
				t.integer('actor_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
				t.string('action').notNullable()
				t.string('entity_type').notNullable()
				t.integer('entity_id').nullable()
				t.json('before').nullable()
				t.json('after').nullable()
				t.text('notes').nullable()
				t.timestamp('created_at').defaultTo(knex.fn.now())
			})
			console.log('✓ audit_trail table created')
		} else {
			console.log('✓ audit_trail table already exists')
		}

		// Check if users table has fullName column
		const hasFullName = await knex.schema.hasColumn('users', 'fullName')
		if (!hasFullName) {
			console.log('Adding fullName column to users table...')
			await knex.schema.alterTable('users', (t) => {
				t.string('fullName').nullable()
			})
			
			// Copy data from name to fullName
			await knex.raw('UPDATE users SET fullName = name WHERE fullName IS NULL')
			console.log('✓ fullName column added and populated')
		} else {
			console.log('✓ fullName column already exists')
		}

		// Check if users table has phone column
		const hasPhone = await knex.schema.hasColumn('users', 'phone')
		if (!hasPhone) {
			console.log('Adding phone column to users table...')
			await knex.schema.alterTable('users', (t) => {
				t.string('phone').nullable()
			})
			console.log('✓ phone column added')
		} else {
			console.log('✓ phone column already exists')
		}

		// Check if users table has title column
		const hasTitle = await knex.schema.hasColumn('users', 'title')
		if (!hasTitle) {
			console.log('Adding title column to users table...')
			await knex.schema.alterTable('users', (t) => {
				t.string('title').nullable()
			})
			console.log('✓ title column added')
		} else {
			console.log('✓ title column already exists')
		}

		// Check if users table has lastLoginAt column
		const hasLastLoginAt = await knex.schema.hasColumn('users', 'lastLoginAt')
		if (!hasLastLoginAt) {
			console.log('Adding lastLoginAt column to users table...')
			await knex.schema.alterTable('users', (t) => {
				t.timestamp('lastLoginAt').nullable()
			})
			console.log('✓ lastLoginAt column added')
		} else {
			console.log('✓ lastLoginAt column already exists')
		}

		// Check if users table has is_active column
		const hasIsActive = await knex.schema.hasColumn('users', 'is_active')
		if (!hasIsActive) {
			console.log('Adding is_active column to users table...')
			await knex.schema.alterTable('users', (t) => {
				t.boolean('is_active').defaultTo(true)
			})
			// Set all existing users as active
			await knex.raw('UPDATE users SET is_active = 1 WHERE is_active IS NULL')
			console.log('✓ is_active column added')
		} else {
			console.log('✓ is_active column already exists')
		}

		// Check if departments table has champions column
		const hasChampions = await knex.schema.hasColumn('departments', 'champions')
		if (!hasChampions) {
			console.log('Adding champions column to departments table...')
			await knex.schema.alterTable('departments', (t) => {
				t.json('champions').nullable()
			})
			console.log('✓ champions column added')
		} else {
			console.log('✓ champions column already exists')
		}

		// Check if departments table has owner column
		const hasOwner = await knex.schema.hasColumn('departments', 'owner')
		if (!hasOwner) {
			console.log('Adding owner column to departments table...')
			await knex.schema.alterTable('departments', (t) => {
				t.integer('owner').nullable().references('id').inTable('users').onDelete('SET NULL')
			})
			console.log('✓ owner column added')
		} else {
			console.log('✓ owner column already exists')
		}

		// Check if departments table has processes column
		const hasProcesses = await knex.schema.hasColumn('departments', 'processes')
		if (!hasProcesses) {
			console.log('Adding processes column to departments table...')
			await knex.schema.alterTable('departments', (t) => {
				t.text('processes').nullable()
			})
			console.log('✓ processes column added')
		} else {
			console.log('✓ processes column already exists')
		}

		// Check if departments table has inherentRiskExamples column
		const hasInherentRisks = await knex.schema.hasColumn('departments', 'inherentRiskExamples')
		if (!hasInherentRisks) {
			console.log('Adding inherentRiskExamples column to departments table...')
			await knex.schema.alterTable('departments', (t) => {
				t.text('inherentRiskExamples').nullable()
			})
			console.log('✓ inherentRiskExamples column added')
		} else {
			console.log('✓ inherentRiskExamples column already exists')
		}

		// Create indexes for performance
		console.log('Creating indexes...')
		await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
		await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)')
		await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id)')
		await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)')
		await knex.raw('CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id)')
		await knex.raw('CREATE INDEX IF NOT EXISTS idx_audit_trail_actor ON audit_trail(actor_user_id)')
		console.log('✓ Indexes created')

		console.log('\n🎉 Database schema update completed successfully!')
		
	} catch (error) {
		console.error('❌ Error updating schema:', error)
		process.exit(1)
	} finally {
		await knex.destroy()
	}
}

updateSchema()
