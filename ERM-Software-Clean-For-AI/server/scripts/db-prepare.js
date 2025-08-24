import 'dotenv/config'
import { knex } from '../lib/knex.js'
import { ensureMigrations } from '../lib/migrate.js'
import { hashPassword } from '../utils/password.js'

async function prepareDatabase() {
	try {
		console.log('🔄 Preparing database...')
		
		// Run migrations
		console.log('📦 Running migrations...')
		await ensureMigrations()
		console.log('✅ Migrations complete')
		
		// Run seeds
		console.log('🌱 Running seeds...')
		await runSeeds()
		console.log('✅ Seeds complete')
		
		// Normalize user roles
		console.log('👥 Normalizing user roles...')
		await normalizeUserRoles()
		console.log('✅ User roles normalized')
		
		// Verify final state
		await verifyDatabaseState()
		console.log('✅ Database ready')
		
		return true
	} catch (error) {
		console.error('❌ Database preparation failed:', error)
		process.exit(1)
	}
}

async function runSeeds() {
	// Check if we need to seed
	const userCount = await knex('users').count('* as count').first()
	if (userCount.count > 0) {
		console.log('📊 Users already exist, skipping seed')
		return
	}
	
	console.log('🌱 Seeding initial data...')
	
	// Create departments
	const deptNames = ['Operations', 'Marketing', 'Finance', 'IT', 'HSE']
	const depts = []
	
	for (const name of deptNames) {
		const [deptId] = await knex('departments').insert({
			name,
			description: `${name} Department`,
			processes: JSON.stringify([
				`${name} Process 1`,
				`${name} Process 2`,
				`${name} Process 3`
			]),
			inherentRiskExamples: JSON.stringify([
				`${name} Inherent Risk 1`,
				`${name} Inherent Risk 2`
			]),
			created_at: knex.fn.now(),
			updated_at: knex.fn.now()
		})
		depts.push({ id: deptId, name })
	}
	
	// Create admin user
	const adminPass = await hashPassword('Admin123!')
	const [adminId] = await knex('users').insert({
		email: 'admin@company.com',
		name: 'Saud Admin',
		role: 'Admin',
		department_id: null,
		password_hash: adminPass,
		is_active: true,
		created_at: knex.fn.now(),
		updated_at: knex.fn.now()
	})
	
	// Create sample users for each department
	const sampleUsers = [
		{ email: 'omar@co.com', name: 'Omar Al-Rashid', role: 'Risk Owner', dept: 'Marketing' },
		{ email: 'sarah@co.com', name: 'Sarah Johnson', role: 'Risk Champion', dept: 'Operations' },
		{ email: 'mike@co.com', name: 'Mike Chen', role: 'Risk Owner', dept: 'IT' },
		{ email: 'lisa@co.com', name: 'Lisa Rodriguez', role: 'Risk Champion', dept: 'Finance' },
		{ email: 'john@co.com', name: 'John Smith', role: 'Team Member', dept: 'HSE' },
		{ email: 'exec@co.com', name: 'Executive User', role: 'Executive', dept: null }
	]
	
	for (const userData of sampleUsers) {
		const deptId = userData.dept ? depts.find(d => d.name === userData.dept)?.id : null
		const password = await hashPassword('Password123!')
		
		await knex('users').insert({
			email: userData.email,
			name: userData.name,
			role: userData.role,
			department_id: deptId,
			password_hash: password,
			is_active: true,
			created_at: knex.fn.now(),
			updated_at: knex.fn.now()
		})
	}
	
	console.log(`✅ Created ${depts.length} departments and ${sampleUsers.length + 1} users`)
	
	// Create sample workflow items to demonstrate the workflow
	await createSampleWorkflows(depts, sampleUsers)
	console.log('✅ Created sample workflow items')
}

async function normalizeUserRoles() {
	// Check if roles are already normalized
	const roles = await knex('users').select('role').distinct()
	const currentRoles = roles.map(r => r.role)
	
	if (currentRoles.every(r => ['Admin', 'Risk Champion', 'Risk Owner', 'Executive', 'Team Member'].includes(r))) {
		console.log('✅ User roles already normalized')
		return
	}
	
	console.log('🔄 Normalizing user roles...')
	
	// Update legacy roles to canonical values
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
		const count = await knex('users').whereRaw('LOWER(role) = ?', [oldRole.toLowerCase()]).update({
			role: newRole,
			updated_at: knex.fn.now()
		})
		if (count > 0) {
			console.log(`🔄 Updated ${count} users from '${oldRole}' to '${newRole}'`)
		}
	}
	
	// Set default role for any remaining null/empty roles
	const nullCount = await knex('users').whereNull('role').orWhere('role', '').update({
		role: 'Team Member',
		updated_at: knex.fn.now()
	})
	if (nullCount > 0) {
		console.log(`🔄 Set ${nullCount} users with null/empty roles to 'Team Member'`)
	}
	
	console.log('✅ User roles normalized')
}

async function createSampleWorkflows(departments, users) {
	// Check if workflow instances already exist
	const hasWorkflowInstances = await knex.schema.hasTable('workflow_instances')
	if (!hasWorkflowInstances) {
		console.log('📊 Workflow instances table not yet created, skipping sample creation')
		return
	}
	
	const workflowCount = await knex('workflow_instances').count('* as count').first()
	if (workflowCount.count > 0) {
		console.log('📊 Workflow instances already exist, skipping sample creation')
		return
	}
	
	console.log('🌱 Creating sample workflow items...')
	
	// Get user IDs by role and department
	const adminUser = users.find(u => u.role === 'Admin') || await knex('users').where({ role: 'Admin' }).first()
	const marketingOwner = users.find(u => u.role === 'Risk Owner' && u.dept === 'Marketing') || 
		await knex('users').where({ role: 'Risk Owner', department_id: departments.find(d => d.name === 'Marketing')?.id }).first()
	const operationsChampion = users.find(u => u.role === 'Risk Champion' && u.dept === 'Operations') || 
		await knex('users').where({ role: 'Risk Champion', department_id: departments.find(d => d.name === 'Operations')?.id }).first()
	const hseTeamMember = users.find(u => u.role === 'Team Member' && u.dept === 'HSE') || 
		await knex('users').where({ role: 'Team Member', department_id: departments.find(d => d.name === 'HSE')?.id }).first()
	
	// Create sample workflow instances
	const sampleWorkflows = [
		{
			entity_type: 'risk',
			entity_id: null,
			department_id: departments.find(d => d.name === 'HSE')?.id,
			payload_diff: {
				title: 'Sample HSE Risk',
				description: 'This is a sample risk to demonstrate the workflow',
				likelihood: 3,
				impact: 4
			},
			requested_by: hseTeamMember?.id || 1,
			assigned_to: operationsChampion?.id || 1,
			current_stage: 'submitted',
			comment: 'Sample risk submission from HSE Team Member'
		},
		{
			entity_type: 'action',
			entity_id: null,
			department_id: departments.find(d => d.name === 'Marketing')?.id,
			payload_diff: {
				action: 'Sample mitigation action',
				due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
			},
			requested_by: operationsChampion?.id || 1,
			assigned_to: marketingOwner?.id || 1,
			current_stage: 'owner_review',
			comment: 'Sample action requiring Risk Owner approval'
		}
	]
	
	for (const workflow of sampleWorkflows) {
		const [workflowId] = await knex('workflow_instances').insert({
			...workflow,
			created_at: knex.fn.now(),
			updated_at: knex.fn.now()
		})
		
		// Create workflow history record
		await knex('workflow_history').insert({
			workflow_instance_id: workflowId,
			actor_user_id: workflow.requested_by,
			action: 'submit',
			comment: workflow.comment,
			from_stage: 'draft',
			to_stage: workflow.current_stage,
			created_at: knex.fn.now()
		})
	}
	
	console.log(`✅ Created ${sampleWorkflows.length} sample workflow items`)
}

async function verifyDatabaseState() {
	// Verify final role state
	const roles = await knex('users').select('role').distinct()
	const finalRoles = roles.map(r => r.role).sort()
	
	console.log(`📊 Final user roles: [${finalRoles.join(', ')}]`)
	
	// Verify user count
	const userCount = await knex('users').count('* as count').first()
	console.log(`👥 Total users: ${userCount.count}`)
	
	// Verify department count
	const deptCount = await knex('departments').count('* as count').first()
	console.log(`🏢 Total departments: ${deptCount.count}`)
	
	// Verify workflow instances count
	const hasWorkflowInstances = await knex.schema.hasTable('workflow_instances')
	if (hasWorkflowInstances) {
		const workflowCount = await knex('workflow_instances').count('* as count').first()
		console.log(`📋 Total workflow instances: ${workflowCount.count}`)
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	prepareDatabase()
		.then(() => {
			console.log('🎉 Database preparation completed successfully')
			process.exit(0)
		})
		.catch((error) => {
			console.error('💥 Database preparation failed:', error)
			process.exit(1)
		})
}

export default prepareDatabase
