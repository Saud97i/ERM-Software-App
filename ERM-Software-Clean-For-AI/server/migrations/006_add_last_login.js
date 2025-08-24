/** @param {import('knex').Knex} knex */
export async function up(knex) {
	// Add lastLoginAt column to users table
	await knex.schema.alterTable('users', (t) => {
		t.timestamp('lastLoginAt').nullable()
	})
	
	console.log('✅ Added lastLoginAt column to users table')
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
	// Remove lastLoginAt column from users table
	await knex.schema.alterTable('users', (t) => {
		t.dropColumn('lastLoginAt')
	})
	
	console.log('✅ Removed lastLoginAt column from users table')
}
