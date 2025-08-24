import express from 'express'
import { knex } from '../lib/knex.js'
import { requireAuth } from '../middlewares/auth.js'
import { requireRole } from '../middlewares/rbac.js'
import { hashPassword } from '../utils/password.js'
import { isAdmin, canManageUsers } from '../lib/auth-helpers.js'

const router = express.Router()

// Helper function to log audit trail
async function logAuditTrail(actorUserId, action, entityType, entityId, before, after, notes = null) {
	try {
		await knex('audit_log').insert({
			actor_user_id: actorUserId,
			action,
			entity_type: entityType,
			entity_id: entityId,
			before: before ? JSON.stringify(before) : null,
			after: after ? JSON.stringify(after) : null,
			notes
		})
	} catch (error) {
		console.error('Failed to log audit trail:', error)
	}
}

// Helper function to validate email uniqueness (case-insensitive)
async function isEmailUnique(email, excludeUserId = null) {
	const query = knex('users').whereRaw('LOWER(email) = ?', [email.toLowerCase()])
	if (excludeUserId) {
		query.whereNot('id', excludeUserId)
	}
	const existing = await query.first()
	return !existing
}

// Helper function to validate role requirements
function validateRoleRequirements(role, departmentId) {
	if (['Risk Champion', 'Risk Owner', 'Team Member'].includes(role) && !departmentId) {
		return { valid: false, error: `${role} must have a department assigned` }
	}
	if (['Admin', 'Executive'].includes(role) && departmentId) {
		return { valid: false, error: `${role} cannot have a department assigned` }
	}
	return { valid: true }
}

// Helper function to update department assignments
async function updateDepartmentAssignments(departmentId, role, userId) {
	const dept = await knex('departments').where({ id: departmentId }).first()
	if (!dept) return
	
	let champions = dept.champions ? JSON.parse(dept.champions) : []
	let owner = dept.owner
	
	if (role === 'Risk Champion') {
		if (!champions.includes(userId)) {
			champions.push(userId)
		}
	} else if (role === 'Risk Owner') {
		owner = userId
	}
	
	await knex('departments').where({ id: departmentId }).update({
		champions: JSON.stringify(champions),
		owner: owner,
		updated_at: knex.fn.now()
	})
}

// Helper function to cleanup department assignments
async function cleanupDepartmentAssignments(departmentId, role, userId) {
	const dept = await knex('departments').where({ id: departmentId }).first()
	if (!dept) return
	
	let champions = dept.champions ? JSON.parse(dept.champions) : []
	let owner = dept.owner
	
	if (role === 'Risk Champion') {
		champions = champions.filter(id => id !== userId)
	} else if (role === 'Risk Owner') {
		owner = null
	}
	
	await knex('departments').where({ id: departmentId }).update({
		champions: JSON.stringify(champions),
		owner: owner,
		updated_at: knex.fn.now()
	})
}

// List users (Admin only) with enhanced filtering and search
router.get('/', requireAuth, requireRole('Admin'), async (req, res) => {
	try {
		console.log('🔍 Fetching users for admin:', req.user.id, req.user.role)
		const { search, role, department, active, sortBy = 'name', sortOrder = 'asc' } = req.query
		
		let query = knex('users')
			.select('users.*', 'departments.name as department_name')
			.leftJoin('departments', 'users.department_id', 'departments.id')

		// Apply filters
		if (search) {
			query = query.where(function() {
				this.whereRaw('LOWER(users.name) LIKE ?', [`%${search.toLowerCase()}%`])
					.orWhereRaw('LOWER(users.email) LIKE ?', [`%${search.toLowerCase()}%`])
			})
		}

		if (role && role !== 'all') {
			query = query.where('users.role', role)
		}

		if (department && department !== 'all') {
			query = query.where('users.department_id', department)
		}

		if (active !== undefined) {
			query = query.where('users.is_active', active === 'true')
		}

		// Apply sorting
		const allowedSortFields = ['name', 'email', 'role', 'department_name', 'created_at', 'updated_at']
		const allowedSortOrders = ['asc', 'desc']
		
		if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toLowerCase())) {
			query = query.orderBy(sortBy, sortOrder)
		} else {
			query = query.orderBy('name', 'asc')
		}

		const users = await query

		// Get department assignments for each user
		const withDepts = await Promise.all(users.map(async (user) => {
			const departmentAssignments = await knex('department_user')
				.where({ user_id: user.id })
				.pluck('department_id')
			return { ...user, departmentAssignments }
		}))

		res.json(withDepts)
	} catch (error) {
		console.error('Error fetching users:', error)
		res.status(500).json({ error: 'Failed to fetch users' })
	}
})

// Get current user profile
router.get('/profile', requireAuth, async (req, res) => {
	try {
		const user = await knex('users')
			.select('users.*', 'departments.name as department_name')
			.leftJoin('departments', 'users.department_id', 'departments.id')
			.where('users.id', req.user.id)
			.first()

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Get department assignments
		const departmentAssignments = await knex('department_user')
			.where({ user_id: req.user.id })
			.pluck('department_id')

		res.json({ ...user, departmentAssignments })
	} catch (error) {
		console.error('Error fetching user profile:', error)
		res.status(500).json({ error: 'Failed to fetch user profile' })
	}
})

// Get current user permissions
router.get('/permissions', requireAuth, async (req, res) => {
	try {
		const { isAdmin, isExecutive, isRiskChampion, isRiskOwner, isTeamMember, canAccessDepartment, canManageRisks, canApproveRisks, canManageUsers, getUserPermissions } = await import('../lib/auth-helpers.js')
		
		const user = await knex('users').where({ id: req.user.id }).first()
		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		const permissions = {
			isAdmin: isAdmin(user),
			isExecutive: isExecutive(user),
			isRiskChampion: isRiskChampion(user, user.department_id),
			isRiskOwner: isRiskOwner(user, user.department_id),
			isTeamMember: isTeamMember(user, user.department_id),
			canManageRisks: canManageRisks(user),
			canApproveRisks: canApproveRisks(user),
			canManageUsers: canManageUsers(user),
			canAccessAllDepartments: isAdmin(user) || isExecutive(user),
			departmentPermissions: user.department_id ? getUserPermissions(user, user.department_id) : null
		}

		res.json(permissions)
	} catch (error) {
		console.error('Error fetching user permissions:', error)
		res.status(500).json({ error: 'Failed to fetch user permissions' })
	}
})

// Get current user workflow status
router.get('/workflow-status', requireAuth, async (req, res) => {
	try {
		const user = await knex('users').where({ id: req.user.id }).first()
		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Get assigned workflow items
		const assignedItems = await knex('workflow_items')
			.where({ assigned_to: req.user.id })
			.count('* as count')
			.first()

		// Get originated workflow items
		const originatedItems = await knex('workflow_items')
			.where({ requested_by: req.user.id })
			.whereNotIn('state', ['approved', 'rejected'])
			.count('* as count')
			.first()

		// Get department workflow items if user has department access
		let departmentItems = { count: 0 }
		if (user.department_id) {
			departmentItems = await knex('workflow_items')
				.where({ department_id: user.department_id })
				.whereNotIn('state', ['approved', 'rejected'])
				.count('* as count')
				.first()
		}

		res.json({
			assigned: Number(assignedItems.count || 0),
			originated: Number(originatedItems.count || 0),
			department: Number(departmentItems.count || 0)
		})
	} catch (error) {
		console.error('Error fetching user workflow status:', error)
		res.status(500).json({ error: 'Failed to fetch user workflow status' })
	}
})

// Get current user team information
router.get('/team', requireAuth, async (req, res) => {
	try {
		const user = await knex('users').where({ id: req.user.id }).first()
		if (!user || !user.department_id) {
			return res.json({ team: null, message: 'User not assigned to a department' })
		}

		// Get department information
		const department = await knex('departments')
			.select('id', 'name', 'description', 'owner', 'champions')
			.where({ id: user.department_id })
			.first()

		if (!department) {
			return res.json({ team: null, message: 'Department not found' })
		}

		// Get team members
		const teamMembers = await knex('users')
			.select('id', 'name', 'email', 'role', 'title', 'is_active')
			.where({ department_id: user.department_id, is_active: true })
			.orderBy('role', 'asc')
			.orderBy('name', 'asc')

		// Get owner and champions
		const owner = department.owner ? teamMembers.find(u => u.id === department.owner) : null
		const champions = department.champions ? 
			teamMembers.filter(u => JSON.parse(department.champions).includes(u.id)) : []

		res.json({
			department: {
				id: department.id,
				name: department.name,
				description: department.description
			},
			team: {
				owner,
				champions,
				members: teamMembers.filter(u => u.role === 'Team Member')
			}
		})
	} catch (error) {
		console.error('Error fetching user team information:', error)
		res.status(500).json({ error: 'Failed to fetch user team information' })
	}
})

// Get current user workflow history
router.get('/workflow-history', requireAuth, async (req, res) => {
	try {
		const { page = 1, limit = 50 } = req.query
		const offset = (page - 1) * limit

		// Get workflow items where user was involved
		const workflowItems = await knex('workflow_items')
			.leftJoin('departments as d', 'workflow_items.department_id', 'd.id')
			.select(
				'workflow_items.*',
				'd.name as department_name'
			)
			.where(function() {
				this.where({ requested_by: req.user.id })
					.orWhere({ assigned_to: req.user.id })
			})
			.orderBy('created_at', 'desc')
			.limit(limit)
			.offset(offset)

		// Get total count
		const [{ count }] = await knex('workflow_items')
			.where(function() {
				this.where({ requested_by: req.user.id })
					.orWhere({ assigned_to: req.user.id })
			})
			.count('* as count')

		// Get workflow history for each item
		const enrichedItems = await Promise.all(workflowItems.map(async (item) => {
			const history = await knex('workflow_history')
				.leftJoin('users as u', 'workflow_history.actor_user_id', 'u.id')
				.select(
					'workflow_history.*',
					'u.name as actor_name',
					'u.email as actor_email'
				)
				.where({ workflow_item_id: item.id })
				.orderBy('created_at', 'asc')

			return {
				...item,
				history
			}
		}))

		res.json({
			items: enrichedItems,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total: Number(count),
				pages: Math.ceil(Number(count) / limit)
			}
		})
	} catch (error) {
		console.error('Error fetching user workflow history:', error)
		res.status(500).json({ error: 'Failed to fetch user workflow history' })
	}
})

// Get current user department information
router.get('/department', requireAuth, async (req, res) => {
	try {
		const user = await knex('users').where({ id: req.user.id }).first()
		if (!user || !user.department_id) {
			return res.json({ department: null, message: 'User not assigned to a department' })
		}

		// Get department information
		const department = await knex('departments')
			.select('id', 'name', 'description', 'processes', 'inherentRiskExamples')
			.where({ id: user.department_id })
			.first()

		if (!department) {
			return res.json({ department: null, message: 'Department not found' })
		}

		// Parse JSON fields
		const processes = department.processes ? JSON.parse(department.processes) : []
		const inherentRiskExamples = department.inherentRiskExamples ? JSON.parse(department.inherentRiskExamples) : []

		res.json({
			department: {
				...department,
				processes,
				inherentRiskExamples
			}
		})
	} catch (error) {
		console.error('Error fetching user department information:', error)
		res.status(500).json({ error: 'Failed to fetch user department information' })
	}
})

// Get current user workflow status
router.get('/workflow-status', requireAuth, async (req, res) => {
	try {
		const user = await knex('users').where({ id: req.user.id }).first()
		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Get assigned workflow items
		const assignedItems = await knex('workflow_items')
			.where({ assigned_to: req.user.id })
			.count('* as count')
			.first()

		// Get originated workflow items
		const originatedItems = await knex('workflow_items')
			.where({ requested_by: req.user.id })
			.whereNotIn('state', ['approved', 'rejected'])
			.count('* as count')
			.first()

		// Get department workflow items if user has department access
		let departmentItems = { count: 0 }
		if (user.department_id) {
			departmentItems = await knex('workflow_items')
				.where({ department_id: user.department_id })
				.whereNotIn('state', ['approved', 'rejected'])
				.count('* as count')
				.first()
		}

		res.json({
			assigned: Number(assignedItems.count || 0),
			originated: Number(originatedItems.count || 0),
			department: Number(departmentItems.count || 0)
		})
	} catch (error) {
		console.error('Error fetching user workflow status:', error)
		res.status(500).json({ error: 'Failed to fetch user workflow status' })
	}
})

// Get single user by ID
router.get('/:id', requireAuth, requireRole('Admin'), async (req, res) => {
	try {
		const { id } = req.params
		const user = await knex('users')
			.select('users.*', 'departments.name as department_name')
			.leftJoin('departments', 'users.department_id', 'departments.id')
			.where('users.id', id)
			.first()

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Get department assignments
		const departmentAssignments = await knex('department_user')
			.where({ user_id: id })
			.pluck('department_id')

		res.json({ ...user, departmentAssignments })
	} catch (error) {
		console.error('Error fetching user:', error)
		res.status(500).json({ error: 'Failed to fetch user' })
	}
})

// Create new user
router.post('/', requireAuth, requireRole('Admin'), async (req, res) => {
	try {
		const { 
			email, 
			fullName, 
			role, 
			departmentId, 
			phone, 
			title, 
			password = null,
			isActive = true 
		} = req.body

		// Validation
		if (!email || !fullName || !role) {
			return res.status(400).json({ error: 'Email, full name, and role are required' })
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: 'Invalid email format' })
		}

		// Check email uniqueness
		if (!(await isEmailUnique(email))) {
			return res.status(400).json({ error: 'Email already exists' })
		}

		// Validate role is in allowed enum
		const allowedRoles = ['Admin', 'Risk Champion', 'Risk Owner', 'Executive', 'Team Member']
		if (!allowedRoles.includes(role)) {
			return res.status(400).json({ error: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` })
		}

		// Validate role requirements
		const roleValidation = validateRoleRequirements(role, departmentId)
		if (!roleValidation.valid) {
			return res.status(400).json({ error: roleValidation.error })
		}

		// Generate password if not provided
		const finalPassword = password || Math.random().toString(36).slice(2) + '!Ab1'
		const passwordHash = await hashPassword(finalPassword)

		// Create user
		const [userId] = await knex('users').insert({
			email: email.toLowerCase(),
			name: fullName,
			role,
			department_id: departmentId,
			phone,
			title,
			password_hash: passwordHash,
			is_active: isActive,
			created_at: knex.fn.now(),
			updated_at: knex.fn.now()
		})

		// Update department assignments if needed
		if (departmentId && ['Risk Champion', 'Risk Owner'].includes(role)) {
			await updateDepartmentAssignments(departmentId, role, userId)
		}

		// Log audit trail
		await logAuditTrail(
			req.user.id,
			'CREATE',
			'user',
			userId,
			null,
			{ email, fullName, role, departmentId, phone, title, isActive },
			`User created by admin`
		)

		// Return success with generated password if none was provided
		res.status(201).json({ 
			id: userId, 
			message: 'User created successfully',
			generatedPassword: password ? null : finalPassword
		})
	} catch (error) {
		console.error('Error creating user:', error)
		res.status(500).json({ error: 'Failed to create user' })
	}
})

// Update user
router.put('/:id', requireAuth, requireRole('Admin'), async (req, res) => {
	try {
		const { id } = req.params
		const { 
			fullName, 
			role, 
			departmentId, 
			phone, 
			title, 
			isActive 
		} = req.body

		// Get current user state for audit trail
		const currentUser = await knex('users').where({ id }).first()
		if (!currentUser) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Validate role is in allowed enum if role is being changed
		if (role && role !== currentUser.role) {
			const allowedRoles = ['Admin', 'Risk Champion', 'Risk Owner', 'Executive', 'Team Member']
			if (!allowedRoles.includes(role)) {
				return res.status(400).json({ error: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` })
			}
			
			const roleValidation = validateRoleRequirements(role, departmentId)
			if (!roleValidation.valid) {
				return res.status(400).json({ error: roleValidation.error })
			}
		}

		// Build update object
		const updateData = {}
		if (fullName !== undefined) updateData.name = fullName
		if (role !== undefined) updateData.role = role
		if (departmentId !== undefined) updateData.department_id = departmentId
		if (phone !== undefined) updateData.phone = phone
		if (title !== undefined) updateData.title = title
		if (isActive !== undefined) updateData.is_active = isActive
		
		if (Object.keys(updateData).length > 0) {
			updateData.updated_at = knex.fn.now()
			
			await knex('users').where({ id }).update(updateData)

					// Clean up old department assignments if department or role changed
		if (departmentId !== currentUser.department_id && currentUser.department_id) {
			await cleanupDepartmentAssignments(currentUser.department_id, currentUser.role, id)
		}
		if (role !== currentUser.role && currentUser.department_id) {
			await cleanupDepartmentAssignments(currentUser.department_id, currentUser.role, id)
		}
		
		// Update department assignments if needed
		if (departmentId && ['Risk Champion', 'Risk Owner'].includes(role)) {
			await updateDepartmentAssignments(departmentId, role, id)
		}

		// Log audit trail
		await logAuditTrail(
			req.user.id,
			'UPDATE',
			'user',
			id,
			currentUser,
			{ ...currentUser, ...updateData },
			`User updated by admin`
		)
		}

		res.json({ message: 'User updated successfully' })
	} catch (error) {
		console.error('Error updating user:', error)
		res.status(500).json({ error: 'Failed to update user' })
	}
})

// Reset password
router.post('/:id/reset-password', requireAuth, requireRole('Admin'), async (req, res) => {
	try {
		const { id } = req.params
		const { password } = req.body

		if (!password || password.length < 8) {
			return res.status(400).json({ error: 'Password must be at least 8 characters long' })
		}

		const currentUser = await knex('users').where({ id }).first()
		if (!currentUser) {
			return res.status(404).json({ error: 'User not found' })
		}

		const passwordHash = await hashPassword(password)
		await knex('users').where({ id }).update({ 
			password_hash: passwordHash, 
			updated_at: knex.fn.now() 
		})

		// Log audit trail
		await logAuditTrail(
			req.user.id,
			'PASSWORD_RESET',
			'user',
			id,
			null,
			null,
			`Password reset by admin`
		)

		res.json({ message: 'Password reset successfully' })
	} catch (error) {
		console.error('Error resetting password:', error)
		res.status(500).json({ error: 'Failed to reset password' })
	}
})

// Deactivate/Reactivate user
router.post('/:id/toggle-status', requireAuth, requireRole('Admin'), async (req, res) => {
	try {
		const { id } = req.params
		const { action } = req.body // 'deactivate' or 'reactivate'

		if (!['deactivate', 'reactivate'].includes(action)) {
			return res.status(400).json({ error: 'Invalid action. Use "deactivate" or "reactivate"' })
		}

		const currentUser = await knex('users').where({ id }).first()
		if (!currentUser) {
			return res.status(404).json({ error: 'User not found' })
		}

		const newStatus = action === 'deactivate' ? false : true
		await knex('users').where({ id }).update({ 
			is_active: newStatus, 
			updated_at: knex.fn.now() 
		})

		// Clean up department assignments if user is deactivated
		if (action === 'deactivate' && currentUser.department_id) {
			await cleanupDepartmentAssignments(currentUser.department_id, currentUser.role, id)
		}

		// Log audit trail
		await logAuditTrail(
			req.user.id,
			action.toUpperCase(),
			'user',
			id,
			{ is_active: currentUser.is_active },
			{ is_active: newStatus },
			`User ${action}d by admin`
		)

		res.json({ 
			message: `User ${action}d successfully`,
			isActive: newStatus
		})
	} catch (error) {
		console.error('Error toggling user status:', error)
		res.status(500).json({ error: 'Failed to toggle user status' })
	}
})

// DEPRECATED: Legacy team assignments endpoints - replaced by Control Center user_departments
// These endpoints are kept for backward compatibility but should not be used

// Get team assignments per department (DEPRECATED)
router.get('/assignments', requireAuth, requireRole('Admin'), async (req, res) => {
	res.status(410).json({ 
		error: 'This endpoint is deprecated. Use /admin/users for user management.',
		deprecated: true,
		replacement: '/admin/users'
	})
})

// Update team assignments (DEPRECATED)
router.post('/assignments', requireAuth, requireRole('Admin'), async (req, res) => {
	res.status(410).json({ 
		error: 'This endpoint is deprecated. Use /admin/users for user management.',
		deprecated: true,
		replacement: '/admin/users'
	})
})

// Get audit trail for users
router.get('/:id/audit', requireAuth, requireRole('Admin'), async (req, res) => {
	try {
		const { id } = req.params
		const { page = 1, limit = 50 } = req.query

		const offset = (page - 1) * limit

		const auditEntries = await knex('audit_log')
			.select('audit_log.*', 'users.name as actor_name', 'users.email as actor_email')
			.leftJoin('users', 'audit_log.actor_user_id', 'users.id')
			.where('audit_log.entity_type', 'user')
			.where('audit_log.entity_id', id)
			.orderBy('audit_log.created_at', 'desc')
			.limit(limit)
			.offset(offset)

		const total = await knex('audit_log')
			.where('entity_type', 'user')
			.where('audit_log.entity_id', id)
			.count('* as count')
			.first()

		res.json({
			auditEntries,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total: total.count,
				pages: Math.ceil(total.count / limit)
			}
		})
	} catch (error) {
		console.error('Error fetching audit trail:', error)
		res.status(500).json({ error: 'Failed to fetch audit trail' })
	}
})

export default router


