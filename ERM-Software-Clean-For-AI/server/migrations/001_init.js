/** @param {import('knex').Knex} knex */
export async function up(knex) {
	await knex.schema.createTable('departments', (t) => {
		t.increments('id').primary()
		t.string('name').notNullable().unique()
		t.text('description')
		t.integer('created_by').nullable()
		t.integer('updated_by').nullable()
		t.timestamp('created_at').defaultTo(knex.fn.now())
		t.timestamp('updated_at').defaultTo(knex.fn.now())
	})

	await knex.schema.createTable('users', (t) => {
		t.increments('id').primary()
		t.string('email').notNullable().unique()
		t.string('name').notNullable()
		t.enu('role', ['Admin', 'Champion', 'Owner', 'Executive']).notNullable()
		t.integer('department_id').nullable().references('id').inTable('departments').onDelete('SET NULL')
		t.string('password_hash').notNullable()
		t.boolean('is_active').notNullable().defaultTo(true)
		t.timestamp('created_at').defaultTo(knex.fn.now())
		t.timestamp('updated_at').defaultTo(knex.fn.now())
	})

	await knex.schema.createTable('department_user', (t) => {
		t.increments('id').primary()
		t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
		t.integer('department_id').notNullable().references('id').inTable('departments').onDelete('CASCADE')
		t.unique(['user_id', 'department_id'])
	})

	await knex.schema.createTable('department_knowledge', (t) => {
		t.increments('id').primary()
		t.integer('department_id').notNullable().references('id').inTable('departments').onDelete('CASCADE')
		t.text('content').notNullable().defaultTo('')
		t.integer('created_by').nullable()
		t.integer('updated_by').nullable()
		t.timestamp('created_at').defaultTo(knex.fn.now())
		t.timestamp('updated_at').defaultTo(knex.fn.now())
	})

	await knex.schema.createTable('categories', (t) => {
		t.increments('id').primary()
		t.string('name').notNullable().unique()
	})

	await knex.schema.createTable('subcategories', (t) => {
		t.increments('id').primary()
		t.string('name').notNullable()
		t.integer('category_id').notNullable().references('id').inTable('categories').onDelete('CASCADE')
		t.unique(['name', 'category_id'])
	})

	await knex.schema.createTable('risks', (t) => {
		t.increments('id').primary()
		t.string('title').notNullable()
		t.text('description_cause')
		t.text('description_event')
		t.text('description_consequence')
		t.text('worst_case')
		t.integer('department_id').nullable().references('id').inTable('departments').onDelete('SET NULL')
		t.integer('category_id').nullable().references('id').inTable('categories').onDelete('SET NULL')
		t.integer('subcategory_id').nullable().references('id').inTable('subcategories').onDelete('SET NULL')
		t.integer('likelihood').notNullable().defaultTo(1)
		t.integer('impact').notNullable().defaultTo(1)
		t.integer('residual_likelihood').notNullable().defaultTo(1)
		t.integer('residual_impact').notNullable().defaultTo(1)
		t.json('flags').nullable()
		t.json('scores').nullable()
		t.string('status').notNullable().defaultTo('Approved')
		t.boolean('top_risk').notNullable().defaultTo(false)
		t.timestamp('created_at').defaultTo(knex.fn.now())
		t.timestamp('updated_at').defaultTo(knex.fn.now())
	})

	await knex.schema.createTable('mitigation_actions', (t) => {
		t.increments('id').primary()
		t.integer('risk_id').notNullable().references('id').inTable('risks').onDelete('CASCADE')
		t.integer('assigned_user_id').nullable().references('id').inTable('users').onDelete('SET NULL')
		t.integer('assigned_department_id').nullable().references('id').inTable('departments').onDelete('SET NULL')
		t.string('status').notNullable().defaultTo('Pending')
		t.date('due_date').nullable()
		t.integer('created_by').nullable()
		t.integer('updated_by').nullable()
		t.text('action').notNullable()
		t.timestamp('created_at').defaultTo(knex.fn.now())
		t.timestamp('updated_at').defaultTo(knex.fn.now())
	})

	await knex.schema.createTable('config', (t) => {
		t.increments('id').primary()
		t.string('key').notNullable().unique()
		t.json('value').notNullable()
		// examples: { hiddenTabs: [], workflow: { requireOwnerStep: true } }
	})

	await knex.schema.createTable('workflow_items', (t) => {
		t.increments('id').primary()
		t.enu('entity_type', ['risk','action','department','dept_knowledge','category','subcategory','config']).notNullable()
		t.integer('entity_id').nullable()
		t.enu('state', ['draft','submitted','owner_review','admin_review','approved','rejected']).notNullable().defaultTo('draft')
		t.integer('requested_by').notNullable().references('id').inTable('users').onDelete('CASCADE')
		t.integer('assigned_to').nullable().references('id').inTable('users').onDelete('SET NULL')
		t.integer('department_id').nullable().references('id').inTable('departments').onDelete('SET NULL')
		t.json('payload_diff').nullable()
		t.text('comment').nullable()
		t.timestamp('created_at').defaultTo(knex.fn.now())
		t.timestamp('updated_at').defaultTo(knex.fn.now())
	})

	// Workflow history records per transition for auditability
	await knex.schema.createTable('workflow_history', (t) => {
		t.increments('id').primary()
		t.integer('workflow_item_id').notNullable().references('id').inTable('workflow_items').onDelete('CASCADE')
		t.integer('actor_user_id').notNullable().references('id').inTable('users').onDelete('SET NULL')
		t.string('action').notNullable() // submit|approve|reject|reassign|comment
		t.text('comment').nullable()
		t.enu('from_state', ['draft','submitted','owner_review','admin_review','approved','rejected']).nullable()
		t.enu('to_state', ['draft','submitted','owner_review','admin_review','approved','rejected']).nullable()
		t.timestamp('created_at').defaultTo(knex.fn.now())
	})

	await knex.schema.createTable('audit_log', (t) => {
		t.increments('id').primary()
		t.string('entity_type').notNullable()
		t.integer('entity_id').nullable()
		t.integer('actor_user_id').notNullable().references('id').inTable('users').onDelete('SET NULL')
		t.string('action').notNullable()
		t.json('before').nullable()
		t.json('after').nullable()
		t.timestamp('created_at').defaultTo(knex.fn.now())
	})

	await knex.schema.createTable('comments', (t) => {
		t.increments('id').primary()
		t.string('entity_type').notNullable()
		t.integer('entity_id').nullable()
		t.integer('author_user_id').notNullable().references('id').inTable('users').onDelete('SET NULL')
		t.text('text').notNullable()
		t.timestamp('created_at').defaultTo(knex.fn.now())
	})
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
	await knex.schema.dropTableIfExists('comments')
	await knex.schema.dropTableIfExists('audit_log')
	await knex.schema.dropTableIfExists('workflow_items')
	await knex.schema.dropTableIfExists('workflow_history')
	await knex.schema.dropTableIfExists('config')
	await knex.schema.dropTableIfExists('mitigation_actions')
	await knex.schema.dropTableIfExists('risks')
	await knex.schema.dropTableIfExists('subcategories')
	await knex.schema.dropTableIfExists('categories')
	await knex.schema.dropTableIfExists('department_knowledge')
	await knex.schema.dropTableIfExists('department_user')
	await knex.schema.dropTableIfExists('users')
	await knex.schema.dropTableIfExists('departments')
}


