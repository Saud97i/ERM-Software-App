import express from 'express'
import { knex } from '../lib/knex.js'
import { requireAuth } from '../middlewares/auth.js'
import { requireRole } from '../middlewares/rbac.js'

const router = express.Router()

// Read helpers (RBAC enforced per role)
router.get('/departments', requireAuth, async (req, res) => {
	try {
		console.log('🔍 Fetching departments for user:', req.user.id, req.user.role)
		const rows = await knex('departments').select('*').orderBy('name')
		console.log('📊 Found departments:', rows.length, rows.map(d => d.name))
		res.json(rows)
	} catch (error) {
		console.error('❌ Error fetching departments:', error)
		res.status(500).json({ error: 'Failed to fetch departments' })
	}
})

router.get('/categories', requireAuth, async (req, res) => {
	const rows = await knex('categories').select('*').orderBy('name')
	res.json(rows)
})

router.get('/subcategories', requireAuth, async (req, res) => {
	const rows = await knex('subcategories').select('*')
	res.json(rows)
})

router.get('/risks', requireAuth, async (req, res) => {
	let q = knex('risks').select('*').orderBy('updated_at', 'desc')
	const role = req.user?.role
	if (role && role !== 'Admin' && role !== 'Executive') {
		const userDeptIds = (req.user.departments || []).map(String)
		const singleDept = req.user.department_id || req.user.departmentId
		if (singleDept && !userDeptIds.includes(String(singleDept))) userDeptIds.push(String(singleDept))
		if (userDeptIds.length) q = q.whereIn('department_id', userDeptIds)
	}
	const rows = await q
	res.json(rows)
})

router.get('/actions', requireAuth, async (req, res) => {
	let q = knex('mitigation_actions').select('*').orderBy('updated_at', 'desc')
	const role = req.user?.role
	if (role && role !== 'Admin' && role !== 'Executive') {
		const userDeptIds = (req.user.departments || []).map(String)
		const singleDept = req.user.department_id || req.user.departmentId
		if (singleDept && !userDeptIds.includes(String(singleDept))) userDeptIds.push(String(singleDept))
		if (userDeptIds.length) {
			q = q.where(function () {
				this.whereIn('assigned_department_id', userDeptIds).orWhereIn('department_id', userDeptIds)
			})
		}
	}
	const rows = await q
	res.json(rows)
})

router.get('/config', requireAuth, requireRole('Admin'), async (req, res) => {
	const configs = await knex('config').select('*')
	res.json(configs)
})

export default router


