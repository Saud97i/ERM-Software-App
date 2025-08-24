/** @param {import('knex').Knex} knex */
export async function up(knex) {
    console.log('Starting Control Center migration...')
    
    // 1. Update roles enum to include Team Member
    const hasTeamMemberRole = await knex.schema.raw(`
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%users_role_check%' 
        AND check_clause LIKE '%Team Member%'
    `).then(result => result.length > 0)
    
    if (!hasTeamMemberRole) {
        await knex.schema.raw(`
            ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
            ALTER TABLE users ADD CONSTRAINT users_role_check 
            CHECK (role IN ('Admin', 'Risk Champion', 'Risk Owner', 'Executive', 'Team Member'));
        `)
        console.log('✓ Updated roles enum to include Team Member')
    }
    
    // 2. Create user_departments table for many-to-many relationships with roles per department
    const hasUserDepartments = await knex.schema.hasTable('user_departments')
    if (!hasUserDepartments) {
        await knex.schema.createTable('user_departments', (t) => {
            t.increments('id').primary()
            t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
            t.integer('department_id').notNullable().references('id').inTable('departments').onDelete('CASCADE')
            t.enu('role_in_department', ['Risk Champion', 'Risk Owner', 'Team Member']).notNullable()
            t.boolean('is_active').notNullable().defaultTo(true)
            t.timestamp('created_at').defaultTo(knex.fn.now())
            t.timestamp('updated_at').defaultTo(knex.fn.now())
            t.unique(['user_id', 'department_id', 'role_in_department'])
        })
        console.log('✓ Created user_departments table')
    }
    
    // 3. Add metadata fields to departments
    const deptColumns = await knex('departments').columnInfo()
    if (!deptColumns.processes) {
        await knex.schema.alterTable('departments', (t) => {
            t.json('processes').nullable() // Core processes as JSON array
            t.json('inherent_risk_examples').nullable() // Inherent risk examples as JSON array
            t.json('metadata').nullable() // Additional metadata
        })
        console.log('✓ Added metadata fields to departments')
    }
    
    // 4. Create workflow_instances table (replacing workflow_items if needed)
    const hasWorkflowInstances = await knex.schema.hasTable('workflow_instances')
    if (!hasWorkflowInstances) {
        await knex.schema.createTable('workflow_instances', (t) => {
            t.increments('id').primary()
            t.enu('entity_type', ['risk', 'action', 'incident', 'department_change', 'user_request']).notNullable()
            t.integer('entity_id').nullable() // null for new entities
            t.integer('department_id').nullable().references('id').inTable('departments').onDelete('SET NULL')
            t.integer('requested_by').notNullable().references('id').inTable('users').onDelete('CASCADE')
            t.integer('assigned_to').nullable().references('id').inTable('users').onDelete('SET NULL')
            t.enu('current_stage', ['draft', 'submitted', 'champion_review', 'owner_review', 'admin_review', 'approved', 'rejected']).notNullable().defaultTo('submitted')
            t.json('payload_diff').nullable() // The changes being requested
            t.text('comment').nullable()
            t.integer('priority').defaultTo(1) // 1=normal, 2=high, 3=urgent
            t.timestamp('created_at').defaultTo(knex.fn.now())
            t.timestamp('updated_at').defaultTo(knex.fn.now())
            t.timestamp('due_date').nullable()
        })
        console.log('✓ Created workflow_instances table')
    }
    
    // 5. Create workflow_history table if it doesn't exist (it should from migration 002)
    const hasWorkflowHistory = await knex.schema.hasTable('workflow_history')
    if (!hasWorkflowHistory) {
        await knex.schema.createTable('workflow_history', (t) => {
            t.increments('id').primary()
            t.integer('workflow_instance_id').notNullable().references('id').inTable('workflow_instances').onDelete('CASCADE')
            t.integer('actor_user_id').notNullable().references('id').inTable('users').onDelete('SET NULL')
            t.string('action').notNullable() // 'submit', 'approve', 'reject', 'comment', 'reassign'
            t.text('comment').nullable()
            t.enu('from_stage', ['draft', 'submitted', 'champion_review', 'owner_review', 'admin_review', 'approved', 'rejected']).nullable()
            t.enu('to_stage', ['draft', 'submitted', 'champion_review', 'owner_review', 'admin_review', 'approved', 'rejected']).nullable()
            t.timestamp('created_at').defaultTo(knex.fn.now())
        })
        console.log('✓ Created workflow_history table')
    }
    
    // 6. Add last_login to users table
    if (!deptColumns.last_login) {
        await knex.schema.alterTable('users', (t) => {
            t.timestamp('last_login').nullable()
        })
        console.log('✓ Added last_login to users table')
    }
    
    // 7. Create risk_matrix_config table for configurable matrix
    const hasRiskMatrix = await knex.schema.hasTable('risk_matrix_config')
    if (!hasRiskMatrix) {
        await knex.schema.createTable('risk_matrix_config', (t) => {
            t.increments('id').primary()
            t.json('likelihood_labels').notNullable().defaultTo('["Very Low", "Low", "Medium", "High", "Very High"]')
            t.json('impact_labels').notNullable().defaultTo('["Insignificant", "Minor", "Moderate", "Major", "Catastrophic"]')
            t.json('risk_appetite').notNullable().defaultTo('{"low": 8, "medium": 12, "medium_high": 16, "high": 20}') // Thresholds
            t.boolean('is_active').notNullable().defaultTo(true)
            t.integer('created_by').nullable().references('id').inTable('users').onDelete('SET NULL')
            t.timestamp('created_at').defaultTo(knex.fn.now())
            t.timestamp('updated_at').defaultTo(knex.fn.now())
        })
        
        // Insert default configuration
        await knex('risk_matrix_config').insert({
            likelihood_labels: JSON.stringify(["Very Low", "Low", "Medium", "High", "Very High"]),
            impact_labels: JSON.stringify(["Insignificant", "Minor", "Moderate", "Major", "Catastrophic"]),
            risk_appetite: JSON.stringify({low: 8, medium: 12, medium_high: 16, high: 20}),
            is_active: true
        })
        console.log('✓ Created risk_matrix_config table with defaults')
    }
    
    // 8. Migrate existing department_user data to user_departments if needed
    const existingDeptUsers = await knex('department_user').select('*')
    if (existingDeptUsers.length > 0) {
        console.log(`Migrating ${existingDeptUsers.length} department_user records...`)
        
        for (const du of existingDeptUsers) {
            // Get user role to determine role_in_department
            const user = await knex('users').where('id', du.user_id).first()
            if (user && ['Risk Champion', 'Risk Owner', 'Team Member'].includes(user.role)) {
                // Check if already exists
                const existing = await knex('user_departments')
                    .where({
                        user_id: du.user_id,
                        department_id: du.department_id,
                        role_in_department: user.role
                    }).first()
                
                if (!existing) {
                    await knex('user_departments').insert({
                        user_id: du.user_id,
                        department_id: du.department_id,
                        role_in_department: user.role,
                        is_active: true
                    })
                }
            }
        }
        console.log('✓ Migrated department_user data to user_departments')
    }
    
    // 9. Migrate existing workflow_items to workflow_instances if workflow_items exists
    const hasWorkflowItems = await knex.schema.hasTable('workflow_items')
    if (hasWorkflowItems) {
        const existingItems = await knex('workflow_items').select('*')
        if (existingItems.length > 0) {
            console.log(`Migrating ${existingItems.length} workflow_items...`)
            
            for (const item of existingItems) {
                // Map old states to new stages
                const stageMap = {
                    'submitted': 'submitted',
                    'owner_review': 'owner_review', 
                    'admin_review': 'admin_review',
                    'approved': 'approved',
                    'rejected': 'rejected'
                }
                
                await knex('workflow_instances').insert({
                    entity_type: item.entity_type,
                    entity_id: item.entity_id,
                    department_id: item.department_id,
                    requested_by: item.requested_by,
                    assigned_to: item.assigned_to,
                    current_stage: stageMap[item.state] || 'submitted',
                    payload_diff: item.payload_diff,
                    comment: item.comment,
                    created_at: item.created_at,
                    updated_at: item.updated_at
                })
            }
            console.log('✓ Migrated workflow_items to workflow_instances')
        }
    }
    
    console.log('Control Center migration completed successfully!')
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
    // Note: This is a destructive rollback - use with caution
    await knex.schema.dropTableIfExists('workflow_history')
    await knex.schema.dropTableIfExists('workflow_instances')
    await knex.schema.dropTableIfExists('risk_matrix_config')
    await knex.schema.dropTableIfExists('user_departments')
    
    // Revert departments table changes
    await knex.schema.alterTable('departments', (t) => {
        t.dropColumn('processes')
        t.dropColumn('inherent_risk_examples')
        t.dropColumn('metadata')
    })
    
    // Revert users table changes
    await knex.schema.alterTable('users', (t) => {
        t.dropColumn('last_login')
    })
    
    // Revert role enum
    await knex.schema.raw(`
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
        ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('Admin', 'Risk Champion', 'Risk Owner', 'Executive'));
    `)
}
