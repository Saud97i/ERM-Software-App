import 'dotenv/config'
import { knex } from '../lib/knex.js'
import { hashPassword } from '../utils/password.js'

async function seed() {
	try {
		console.log('Starting database seed...')

	// Departments
		const deptNames = ['Operations', 'Marketing', 'Finance', 'IT', 'HSE']
	const existing = await knex('departments').select('id','name')
	const have = new Set(existing.map((d) => d.name))
		
	for (const name of deptNames) {
			if (!have.has(name)) {
				await knex('departments').insert({ 
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
					])
				})
			}
		}
		
	const depts = await knex('departments').select('id','name')
	const deptIdByName = Object.fromEntries(depts.map(d => [d.name, d.id]))

		// Users with new model
	const adminPass = await hashPassword('Admin123!')
	const championPass = await hashPassword('Champion123!')
	const ownerPass = await hashPassword('Owner123!')
	const execPass = await hashPassword('Executive123!')
		const teamPass = await hashPassword('Team123!')

		async function upsertUser(email, fullName, role, departmentName, password_hash, phone = null, title = null) {
		const existing = await knex('users').where({ email }).first()
			if (existing) {
				// Update existing user with new fields
				await knex('users').where({ id: existing.id }).update({
					fullName,
					role,
					department_id: departmentName ? deptIdByName[departmentName] : null,
					phone,
					title,
					password_hash,
					is_active: true,
					updated_at: knex.fn.now()
				})
				return existing.id
			}
			
		const department_id = departmentName ? deptIdByName[departmentName] : null
			const [id] = await knex('users').insert({ 
				email: email.toLowerCase(), 
				fullName, 
				role, 
				department_id, 
				phone,
				title,
				password_hash, 
				is_active: true,
				created_at: knex.fn.now(),
				updated_at: knex.fn.now()
			})
			
			if (department_id) {
				await knex('department_user').insert({ user_id: id, department_id })
			}
		return id
	}

		// Create users with realistic data
		const adminId = await upsertUser(
			'admin@company.com', 
			'Saud Admin', 
			'Admin', 
			null, 
			adminPass,
			'+966-50-123-4567',
			'System Administrator'
		)

		// Risk Owners
		await upsertUser(
			'omar@co.com', 
			'Omar Al-Rashid', 
			'Risk Owner', 
			'Marketing', 
			ownerPass,
			'+966-50-111-1111',
			'Marketing Risk Owner'
		)
		
		await upsertUser(
			'ali@co.com', 
			'Ali Hassan', 
			'Risk Owner', 
			'Operations', 
			ownerPass,
			'+966-50-222-2222',
			'Operations Risk Owner'
		)

		await upsertUser(
			'fatima@co.com', 
			'Fatima Al-Zahra', 
			'Risk Owner', 
			'Finance', 
			ownerPass,
			'+966-50-333-3333',
			'Finance Risk Owner'
		)

		await upsertUser(
			'ahmed@co.com', 
			'Ahmed Khalil', 
			'Risk Owner', 
			'IT', 
			ownerPass,
			'+966-50-444-4444',
			'IT Risk Owner'
		)

		// Risk Champions
		await upsertUser(
			'lina@co.com', 
			'Lina Al-Mansouri', 
			'Risk Champion', 
			'Marketing', 
			championPass,
			'+966-50-555-5555',
			'Marketing Risk Champion'
		)
		
		await upsertUser(
			'mona@co.com', 
			'Mona Al-Sabah', 
			'Risk Champion', 
			'Marketing', 
			championPass,
			'+966-50-666-6666',
			'Marketing Risk Champion'
		)
		
		await upsertUser(
			'sara@co.com', 
			'Sara Al-Rashid', 
			'Risk Champion', 
			'Operations', 
			championPass,
			'+966-50-777-7777',
			'Operations Risk Champion'
		)

		await upsertUser(
			'khalid@co.com', 
			'Khalid Al-Otaibi', 
			'Risk Champion', 
			'Finance', 
			championPass,
			'+966-50-888-8888',
			'Finance Risk Champion'
		)

		await upsertUser(
			'noor@co.com', 
			'Noor Al-Shehri', 
			'Risk Champion', 
			'IT', 
			championPass,
			'+966-50-999-9999',
			'IT Risk Champion'
		)

		// Team Members
		await upsertUser(
			'ahmed@co.com', 
			'Ahmed Al-Mutairi', 
			'Team Member', 
			'Marketing', 
			teamPass,
			'+966-50-101-1010',
			'Marketing Team Member'
		)

		await upsertUser(
			'layla@co.com', 
			'Layla Al-Qahtani', 
			'Team Member', 
			'Operations', 
			teamPass,
			'+966-50-202-2020',
			'Operations Team Member'
		)

		await upsertUser(
			'zainab@co.com', 
			'Zainab Al-Dossary', 
			'Team Member', 
			'Finance', 
			teamPass,
			'+966-50-303-3030',
			'Finance Team Member'
		)

		await upsertUser(
			'yousef@co.com', 
			'Yousef Al-Ghamdi', 
			'Team Member', 
			'IT', 
			teamPass,
			'+966-50-404-4040',
			'IT Team Member'
		)

		// Executives
		await upsertUser(
			'exec@co.com', 
			'Executive Board', 
			'Executive', 
			null, 
			execPass,
			'+966-50-505-5050',
			'Executive Board Member'
		)

		// Update department assignments with new structure
		for (const dept of depts) {
			const owner = await knex('users')
				.where({ role: 'Risk Owner', department_id: dept.id })
				.first()
			
			const champions = await knex('users')
				.where({ role: 'Risk Champion', department_id: dept.id })
				.select('id')

			await knex('departments').where({ id: dept.id }).update({
				owner: owner?.id || null,
				champions: JSON.stringify(champions.map(c => c.id)),
				updated_at: knex.fn.now()
			})
		}

		// Categories and subcategories
		const categories = [
			{ name: 'Strategic', subcategories: ['Market', 'Competition', 'Technology'] },
			{ name: 'Operational', subcategories: ['Process', 'People', 'Systems'] },
			{ name: 'Financial', subcategories: ['Market', 'Credit', 'Liquidity'] },
			{ name: 'Compliance', subcategories: ['Regulatory', 'Legal', 'Policy'] },
			{ name: 'Reputational', subcategories: ['Brand', 'Media', 'Stakeholder'] }
		]

		for (const cat of categories) {
			const [catId] = await knex('categories').insert({ name: cat.name })
			for (const sub of cat.subcategories) {
				await knex('subcategories').insert({ name: sub, category_id: catId })
			}
		}

		// Sample risks with various workflow states
		const risks = [
			{
				title: 'Data Breach Risk',
				description_cause: 'Potential unauthorized access to sensitive customer data',
				description_event: 'Cyber attack or insider threat compromising data security',
				description_consequence: 'Loss of customer trust, regulatory fines, legal action',
				worst_case: 'Complete data breach affecting all customers, $10M+ in damages',
				department_id: deptIdByName['IT'],
				likelihood: 3,
				impact: 5,
				residual_likelihood: 2,
				residual_impact: 3,
				status: 'PendingChampion',
				top_risk: true
			},
			{
				title: 'Supply Chain Disruption',
				description_cause: 'Dependency on single suppliers and global logistics',
				description_event: 'Supplier failure or logistics disruption',
				description_consequence: 'Production delays, revenue loss, customer dissatisfaction',
				worst_case: 'Complete production shutdown for 2+ weeks, $5M+ revenue loss',
				department_id: deptIdByName['Operations'],
				likelihood: 4,
				impact: 4,
				residual_likelihood: 3,
				residual_impact: 3,
				status: 'PendingOwner',
				top_risk: true
			},
			{
				title: 'Regulatory Compliance Failure',
				description_cause: 'Complex and changing regulatory requirements',
				description_event: 'Failure to meet regulatory deadlines or requirements',
				description_consequence: 'Fines, legal action, operational restrictions',
				worst_case: 'Regulatory shutdown, $2M+ in fines, criminal charges',
				department_id: deptIdByName['Finance'],
				likelihood: 2,
				impact: 5,
				residual_likelihood: 1,
				residual_impact: 4,
				status: 'Draft',
				top_risk: false
			},
			{
				title: 'Key Personnel Loss',
				description_cause: 'Dependency on critical employees without succession planning',
				description_event: 'Sudden departure or incapacity of key personnel',
				description_consequence: 'Knowledge loss, operational disruption, project delays',
				worst_case: 'Critical project failure, $3M+ in project costs, 6-month delays',
				department_id: deptIdByName['Operations'],
				likelihood: 3,
				impact: 4,
				residual_likelihood: 2,
				residual_impact: 3,
				status: 'PendingAdmin',
				top_risk: false
			},
			{
				title: 'Market Competition Intensification',
				description_cause: 'New competitors entering market with disruptive technology',
				description_event: 'Loss of market share to competitors',
				description_consequence: 'Revenue decline, margin pressure, customer churn',
				worst_case: '20% market share loss, $15M+ revenue impact, layoffs',
				department_id: deptIdByName['Marketing'],
				likelihood: 4,
				impact: 4,
				residual_likelihood: 3,
				residual_impact: 3,
				status: 'Approved',
				top_risk: true
			}
		]

		for (const risk of risks) {
			const [riskId] = await knex('risks').insert({
				...risk,
				created_at: knex.fn.now(),
				updated_at: knex.fn.now()
			})

			// Add mitigation actions for each risk
			const actions = [
				{
					action: 'Implement multi-factor authentication and access controls',
					status: 'In Progress',
					due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
					assigned_department_id: deptIdByName['IT']
				},
				{
					action: 'Develop supplier diversification strategy',
					status: 'Pending',
					due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
					assigned_department_id: deptIdByName['Operations']
				}
			]

			for (const action of actions) {
				await knex('mitigation_actions').insert({
					...action,
					risk_id: riskId,
					created_at: knex.fn.now(),
					updated_at: knex.fn.now()
				})
			}
		}

		// Department knowledge base items
		const deptKnowledge = [
			{
				department_id: deptIdByName['IT'],
				content: 'IT Department focuses on cybersecurity, infrastructure, and digital transformation. Key processes include system maintenance, security monitoring, and project delivery.',
				created_by: adminId
			},
			{
				department_id: deptIdByName['Operations'],
				content: 'Operations Department manages production, logistics, and quality control. Key processes include supply chain management, production planning, and quality assurance.',
				created_by: adminId
			},
			{
				department_id: deptIdByName['Finance'],
				content: 'Finance Department handles accounting, budgeting, and financial reporting. Key processes include monthly close, budget planning, and regulatory compliance.',
				created_by: adminId
			}
		]

		for (const knowledge of deptKnowledge) {
			await knex('department_knowledge').insert({
				...knowledge,
				created_at: knex.fn.now(),
				updated_at: knex.fn.now()
			})
		}

		// Workflow items to demonstrate the system
		const workflowItems = [
			{
				entity_type: 'risk',
				entity_id: 1, // Data Breach Risk
				state: 'submitted',
				requested_by: 1, // Team Member
				assigned_to: 2, // Risk Champion
				department_id: deptIdByName['IT']
			},
			{
				entity_type: 'risk',
				entity_id: 2, // Supply Chain Disruption
				state: 'owner_review',
				requested_by: 1,
				assigned_to: 3, // Risk Owner
				department_id: deptIdByName['Operations']
			}
		]

		for (const item of workflowItems) {
			await knex('workflow_items').insert({
				...item,
				created_at: knex.fn.now(),
				updated_at: knex.fn.now()
			})
		}

		console.log('Database seed completed successfully!')
		console.log('Demo credentials:')
		console.log('- Admin: admin@company.com / Admin123!')
		console.log('- Risk Champion: lina@co.com / Champion123!')
		console.log('- Risk Owner: omar@co.com / Owner123!')
		console.log('- Team Member: ahmed@co.com / Team123!')
		console.log('- Executive: exec@co.com / Executive123!')

	} catch (error) {
		console.error('Seed error:', error)
		throw error
	}
}

seed().then(() => process.exit(0)).catch((error) => {
	console.error('Seed failed:', error)
	process.exit(1)
})


