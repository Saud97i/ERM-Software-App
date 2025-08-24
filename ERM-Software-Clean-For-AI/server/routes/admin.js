import express from 'express'
import { knex } from '../lib/knex.js'
import { requireAuth } from '../middlewares/auth.js'
import { requireRole } from '../middlewares/rbac.js'
import { hashPassword } from '../utils/password.js'
import { isAdmin } from '../lib/auth-helpers.js'

const router = express.Router()

// Middleware to ensure only admins can access these routes
router.use(requireAuth)
router.use((req, res, next) => {
    if (!isAdmin(req.user)) {
        return res.status(403).json({ error: 'Admin access required' })
    }
    next()
})

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

// ==================== USERS MANAGEMENT ====================

// Get all users with department assignments
router.get('/users', async (req, res) => {
    try {
        const users = await knex('users')
            .select('users.*')
            .orderBy('users.name')

        // Get department assignments for each user
        for (const user of users) {
            const assignments = await knex('user_departments')
                .join('departments', 'user_departments.department_id', 'departments.id')
                .select(
                    'user_departments.department_id',
                    'user_departments.role_in_department as roleInDepartment',
                    'user_departments.is_active',
                    'departments.name as departmentName'
                )
                .where('user_departments.user_id', user.id)
                .where('user_departments.is_active', true)

            user.departmentAssignments = assignments
        }

        res.json(users)
    } catch (error) {
        console.error('Error fetching users:', error)
        res.status(500).json({ error: 'Failed to fetch users' })
    }
})

// Create new user
router.post('/users', async (req, res) => {
    try {
        const { email, name, role, departmentAssignments = [] } = req.body

        // Validate required fields
        if (!email || !name || !role) {
            return res.status(400).json({ error: 'Email, name, and role are required' })
        }

        // Validate email uniqueness
        const existingUser = await knex('users').whereRaw('LOWER(email) = ?', [email.toLowerCase()]).first()
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' })
        }

        // Validate role
        const validRoles = ['Admin', 'Risk Champion', 'Risk Owner', 'Executive', 'Team Member']
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' })
        }

        // Validate department assignments for non-global roles
        if (['Risk Champion', 'Risk Owner', 'Team Member'].includes(role)) {
            if (!departmentAssignments || departmentAssignments.length === 0) {
                return res.status(400).json({ error: `${role} must have at least one department assignment` })
            }
        } else if (['Admin', 'Executive'].includes(role) && departmentAssignments.length > 0) {
            return res.status(400).json({ error: `${role} cannot have department assignments` })
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
        const passwordHash = await hashPassword(tempPassword)

        // Create user
        const [userId] = await knex('users').insert({
            email: email.toLowerCase(),
            name,
            role,
            password_hash: passwordHash,
            is_active: true
        })

        // Create department assignments
        for (const assignment of departmentAssignments) {
            if (assignment.departmentId && assignment.roleInDepartment) {
                await knex('user_departments').insert({
                    user_id: userId,
                    department_id: assignment.departmentId,
                    role_in_department: assignment.roleInDepartment,
                    is_active: true
                })
            }
        }

        // Log audit trail
        await logAuditTrail(req.user.id, 'create', 'user', userId, null, { email, name, role, departmentAssignments })

        res.json({ 
            id: userId, 
            message: 'User created successfully',
            generatedPassword: tempPassword
        })
    } catch (error) {
        console.error('Error creating user:', error)
        res.status(500).json({ error: 'Failed to create user' })
    }
})

// Update user
router.put('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id)
        const { email, name, role, departmentAssignments = [] } = req.body

        // Get existing user
        const existingUser = await knex('users').where('id', userId).first()
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Validate email uniqueness (excluding current user)
        if (email && email.toLowerCase() !== existingUser.email.toLowerCase()) {
            const emailExists = await knex('users')
                .whereRaw('LOWER(email) = ?', [email.toLowerCase()])
                .whereNot('id', userId)
                .first()
            if (emailExists) {
                return res.status(400).json({ error: 'Email already exists' })
            }
        }

        // Validate role
        const validRoles = ['Admin', 'Risk Champion', 'Risk Owner', 'Executive', 'Team Member']
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' })
        }

        // Update user
        const updateData = {}
        if (email) updateData.email = email.toLowerCase()
        if (name) updateData.name = name
        if (role) updateData.role = role
        updateData.updated_at = knex.fn.now()

        await knex('users').where('id', userId).update(updateData)

        // Update department assignments
        if (role && ['Risk Champion', 'Risk Owner', 'Team Member'].includes(role)) {
            // Remove existing assignments
            await knex('user_departments').where('user_id', userId).del()
            
            // Add new assignments
            for (const assignment of departmentAssignments) {
                if (assignment.departmentId && assignment.roleInDepartment) {
                    await knex('user_departments').insert({
                        user_id: userId,
                        department_id: assignment.departmentId,
                        role_in_department: assignment.roleInDepartment,
                        is_active: true
                    })
                }
            }
        } else if (role && ['Admin', 'Executive'].includes(role)) {
            // Remove all department assignments for global roles
            await knex('user_departments').where('user_id', userId).del()
        }

        // Log audit trail
        await logAuditTrail(req.user.id, 'update', 'user', userId, existingUser, updateData)

        res.json({ message: 'User updated successfully' })
    } catch (error) {
        console.error('Error updating user:', error)
        res.status(500).json({ error: 'Failed to update user' })
    }
})

// Toggle user status (activate/deactivate)
router.post('/users/:id/toggle-status', async (req, res) => {
    try {
        const userId = parseInt(req.params.id)
        const { isActive } = req.body

        const user = await knex('users').where('id', userId).first()
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        await knex('users').where('id', userId).update({
            is_active: isActive,
            updated_at: knex.fn.now()
        })

        await logAuditTrail(req.user.id, isActive ? 'activate' : 'deactivate', 'user', userId, { is_active: user.is_active }, { is_active: isActive })

        res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully` })
    } catch (error) {
        console.error('Error toggling user status:', error)
        res.status(500).json({ error: 'Failed to update user status' })
    }
})

// Reset user password
router.post('/users/:id/reset-password', async (req, res) => {
    try {
        const userId = parseInt(req.params.id)
        const { password } = req.body

        if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' })
        }

        const user = await knex('users').where('id', userId).first()
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const passwordHash = await hashPassword(password)
        await knex('users').where('id', userId).update({
            password_hash: passwordHash,
            updated_at: knex.fn.now()
        })

        await logAuditTrail(req.user.id, 'reset_password', 'user', userId, null, null, 'Password reset by admin')

        res.json({ message: 'Password reset successfully' })
    } catch (error) {
        console.error('Error resetting password:', error)
        res.status(500).json({ error: 'Failed to reset password' })
    }
})

// ==================== DEPARTMENTS MANAGEMENT ====================

// Get all departments
router.get('/departments', async (req, res) => {
    try {
        const departments = await knex('departments')
            .select('*')
            .orderBy('name')

        res.json(departments)
    } catch (error) {
        console.error('Error fetching departments:', error)
        res.status(500).json({ error: 'Failed to fetch departments' })
    }
})

// Create department
router.post('/departments', async (req, res) => {
    try {
        const { name, description, processes = [], inherentRiskExamples = [], metadata = {} } = req.body

        if (!name) {
            return res.status(400).json({ error: 'Department name is required' })
        }

        // Check for duplicate name
        const existing = await knex('departments').where('name', name).first()
        if (existing) {
            return res.status(400).json({ error: 'Department name already exists' })
        }

        const [deptId] = await knex('departments').insert({
            name,
            description,
            processes: JSON.stringify(processes),
            inherent_risk_examples: JSON.stringify(inherentRiskExamples),
            metadata: JSON.stringify(metadata),
            created_by: req.user.id
        })

        await logAuditTrail(req.user.id, 'create', 'department', deptId, null, { name, description, processes, inherentRiskExamples, metadata })

        res.json({ id: deptId, message: 'Department created successfully' })
    } catch (error) {
        console.error('Error creating department:', error)
        res.status(500).json({ error: 'Failed to create department' })
    }
})

// Update department
router.put('/departments/:id', async (req, res) => {
    try {
        const deptId = parseInt(req.params.id)
        const { name, description, processes, inherentRiskExamples, metadata } = req.body

        const existing = await knex('departments').where('id', deptId).first()
        if (!existing) {
            return res.status(404).json({ error: 'Department not found' })
        }

        // Check for duplicate name (excluding current department)
        if (name && name !== existing.name) {
            const duplicate = await knex('departments').where('name', name).whereNot('id', deptId).first()
            if (duplicate) {
                return res.status(400).json({ error: 'Department name already exists' })
            }
        }

        const updateData = {
            updated_by: req.user.id,
            updated_at: knex.fn.now()
        }
        if (name) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (processes) updateData.processes = JSON.stringify(processes)
        if (inherentRiskExamples) updateData.inherent_risk_examples = JSON.stringify(inherentRiskExamples)
        if (metadata) updateData.metadata = JSON.stringify(metadata)

        await knex('departments').where('id', deptId).update(updateData)

        await logAuditTrail(req.user.id, 'update', 'department', deptId, existing, updateData)

        res.json({ message: 'Department updated successfully' })
    } catch (error) {
        console.error('Error updating department:', error)
        res.status(500).json({ error: 'Failed to update department' })
    }
})

// Delete department (with safety checks)
router.delete('/departments/:id', async (req, res) => {
    try {
        const deptId = parseInt(req.params.id)

        const department = await knex('departments').where('id', deptId).first()
        if (!department) {
            return res.status(404).json({ error: 'Department not found' })
        }

        // Check for references
        const userCount = await knex('user_departments').where('department_id', deptId).count('* as count').first()
        const riskCount = await knex('risks').where('department_id', deptId).count('* as count').first()

        if (userCount.count > 0 || riskCount.count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete department with existing references',
                details: {
                    users: userCount.count,
                    risks: riskCount.count
                }
            })
        }

        await knex('departments').where('id', deptId).del()

        await logAuditTrail(req.user.id, 'delete', 'department', deptId, department, null)

        res.json({ message: 'Department deleted successfully' })
    } catch (error) {
        console.error('Error deleting department:', error)
        res.status(500).json({ error: 'Failed to delete department' })
    }
})

// ==================== CATEGORIES MANAGEMENT ====================

// Get all categories and subcategories
router.get('/categories', async (req, res) => {
    try {
        const categories = await knex('categories').select('*').orderBy('name')
        const subcategories = await knex('subcategories').select('*').orderBy('name')

        // Add usage counts
        for (const category of categories) {
            const usage = await knex('risks').where('category_id', category.id).count('* as count').first()
            category.usageCount = usage.count
        }

        for (const subcategory of subcategories) {
            const usage = await knex('risks').where('subcategory_id', subcategory.id).count('* as count').first()
            subcategory.usageCount = usage.count
        }

        res.json({ categories, subcategories })
    } catch (error) {
        console.error('Error fetching categories:', error)
        res.status(500).json({ error: 'Failed to fetch categories' })
    }
})

// ==================== RISK MATRIX MANAGEMENT ====================

// Get risk matrix configuration
router.get('/risk-matrix', async (req, res) => {
    try {
        const config = await knex('risk_matrix_config').where('is_active', true).first()
        
        if (!config) {
            // Return default configuration
            return res.json({
                likelihood_labels: ["Very Low", "Low", "Medium", "High", "Very High"],
                impact_labels: ["Insignificant", "Minor", "Moderate", "Major", "Catastrophic"],
                risk_appetite: {low: 8, medium: 12, medium_high: 16, high: 20}
            })
        }

        res.json({
            id: config.id,
            likelihood_labels: JSON.parse(config.likelihood_labels),
            impact_labels: JSON.parse(config.impact_labels),
            risk_appetite: JSON.parse(config.risk_appetite)
        })
    } catch (error) {
        console.error('Error fetching risk matrix:', error)
        res.status(500).json({ error: 'Failed to fetch risk matrix configuration' })
    }
})

// ==================== WORKFLOW MANAGEMENT ====================

// Get workflow queue (all pending items)
router.get('/workflow/queue', async (req, res) => {
    try {
        const items = await knex('workflow_instances')
            .join('users as requester', 'workflow_instances.requested_by', 'requester.id')
            .leftJoin('users as assignee', 'workflow_instances.assigned_to', 'assignee.id')
            .leftJoin('departments', 'workflow_instances.department_id', 'departments.id')
            .select(
                'workflow_instances.*',
                'requester.name as requester_name',
                'requester.email as requester_email',
                'assignee.name as assignee_name',
                'assignee.email as assignee_email',
                'departments.name as department_name'
            )
            .whereNot('workflow_instances.current_stage', 'approved')
            .whereNot('workflow_instances.current_stage', 'rejected')
            .orderBy('workflow_instances.created_at', 'desc')

        res.json(items)
    } catch (error) {
        console.error('Error fetching workflow queue:', error)
        res.status(500).json({ error: 'Failed to fetch workflow queue' })
    }
})

export default router
