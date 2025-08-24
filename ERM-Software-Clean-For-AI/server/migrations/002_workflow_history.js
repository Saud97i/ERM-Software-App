/** @param {import('knex').Knex} knex */
export async function up(knex) {
    const exists = await knex.schema.hasTable('workflow_history')
    if (!exists) {
        await knex.schema.createTable('workflow_history', (t) => {
            t.increments('id').primary()
            t.integer('workflow_item_id').notNullable().references('id').inTable('workflow_items').onDelete('CASCADE')
            t.integer('actor_user_id').notNullable().references('id').inTable('users').onDelete('SET NULL')
            t.string('action').notNullable()
            t.text('comment').nullable()
            t.enu('from_state', ['draft','submitted','owner_review','admin_review','approved','rejected']).nullable()
            t.enu('to_state', ['draft','submitted','owner_review','admin_review','approved','rejected']).nullable()
            t.timestamp('created_at').defaultTo(knex.fn.now())
        })
    }
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
    await knex.schema.dropTableIfExists('workflow_history')
}


