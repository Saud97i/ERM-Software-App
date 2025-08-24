import express from 'express'
import { knex } from '../lib/knex.js'
import { requireAuth } from '../middlewares/auth.js'
import { requireRole } from '../middlewares/rbac.js'
import { isAdmin, isRiskChampion, isRiskOwner, isTeamMember, canAccessDepartment } from '../lib/auth-helpers.js'

const router = express.Router()

// Create workflow item (supports routing by role and cross-dept action assignment)
router.post('/', requireAuth, requireRole('Admin','Champion','Owner','Executive'), async (req, res) => {
	const { entity_type, entity_id = null, department_id = null, payload_diff = null, comment = null } = req.body || {}
	if (!entity_type) return res.status(400).json({ error: 'Missing entity_type' })

	// Department restriction (non-admin within their departments)
	if (!isAdmin(req.user) && department_id) {
		if (!canAccessDepartment(req.user, department_id)) {
			return res.status(403).json({ error: 'Department restricted' })
		}
	}

	// Validate assignments on actions
	if (entity_type === 'action' && payload_diff) {
		if (payload_diff.assigned_user_id) {
			const user = await knex('users').where({ id: payload_diff.assigned_user_id }).first()
			if (!user) return res.status(400).json({ error: 'Invalid assigned_user_id' })
		}
		if (payload_diff.assigned_department_id) {
			const dept = await knex('departments').where({ id: payload_diff.assigned_department_id }).first()
			if (!dept) return res.status(400).json({ error: 'Invalid assigned_department_id' })
		}
	}

	// Determine initial state and assignee
	let state = 'submitted'
	let assigned_to = null
	if (entity_type === 'action' && payload_diff?.assigned_department_id) {
		// Cross-department action: route to receiving dept Owner
		state = 'owner_review'
		const owner = await knex('users').where({ role: 'Risk Owner', is_active: true, department_id: payload_diff.assigned_department_id }).first()
		assigned_to = owner?.id || null
	} else if (isRiskChampion(req.user, req.user.department_id)) {
		state = 'owner_review'
		const owner = await knex('users').where({ role: 'Risk Owner', is_active: true, department_id: req.user.department_id }).first()
		assigned_to = owner?.id || null
	} else if (isRiskOwner(req.user, req.user.department_id)) {
		state = 'admin_review'
		const admin = await knex('users').where({ role: 'Admin', is_active: true }).first()
		assigned_to = admin?.id || null
	} else if (isAdmin(req.user)) {
		state = 'approved'
		assigned_to = null
	} else if (isTeamMember(req.user, req.user.department_id)) {
		// Team Member -> Risk Champion review
		state = 'submitted'
		const champion = await knex('users').where({ role: 'Risk Champion', is_active: true, department_id: req.user.department_id }).first()
		assigned_to = champion?.id || null
	} else {
		// Executive or others -> champion review
		state = 'submitted'
		const champion = await knex('users').where({ role: 'Risk Champion', is_active: true, department_id: req.user.department_id }).first()
		assigned_to = champion?.id || null
	}

	const [id] = await knex('workflow_items').insert({
		entity_type,
		entity_id,
		department_id,
		payload_diff,
		comment,
		requested_by: req.user.id,
		assigned_to,
		state,
	})

	await knex('workflow_history').insert({ workflow_item_id: id, actor_user_id: req.user.id, action: 'submit', comment, from_state: 'draft', to_state: state })
	if (state === 'approved') {
		await applyApprovedChange({ ...await knex('workflow_items').where({ id }).first() })
	}
	res.json({ id, state })
})

// Inbox for current user
router.get('/inbox', requireAuth, async (req, res) => {
	const items = await knex('workflow_items as w')
		.leftJoin('users as u', 'w.assigned_to', 'u.id')
		.leftJoin('departments as d', 'w.department_id', 'd.id')
		.select(
			'w.*',
			knex.raw('COALESCE(u.name, u.email) as current_approver'),
			'd.name as department_name',
		)
		.where({ 'w.assigned_to': req.user.id })
		.orderBy('w.updated_at', 'desc')

	const ids = items.map(i => i.id)
	let counts = {}
	if (ids.length) {
		const rows = await knex('workflow_history')
			.whereIn('workflow_item_id', ids)
			.andWhereNotNull('comment')
			.select('workflow_item_id')
			.count({ c: '*' })
			.groupBy('workflow_item_id')
		counts = Object.fromEntries(rows.map(r => [r.workflow_item_id, Number(r.c)]))
	}
	const enriched = items.map(i => ({ ...i, comments_count: counts[i.id] || 0 }))
	res.json(enriched)
})

// Transition: approve/reject -> next assignee

router.post('/:id/transition', requireAuth, async (req, res) => {
	const id = Number(req.params.id)
	const { action, comment } = req.body || {}
	const item = await knex('workflow_items').where({ id }).first()
	if (!item) return res.status(404).json({ error: 'Not found' })
			if (action !== 'comment' && item.assigned_to !== req.user.id && !isAdmin(req.user)) return res.status(403).json({ error: 'Not assigned' })
	let nextState = item.state
	let nextAssignee = null
	const fromState = item.state
	if (action === 'approve') {
		if (item.state === 'submitted') {
			nextState = 'owner_review'
			// assign to owner of dept
			const owner = await knex('users').where({ role: 'Risk Owner', is_active: true, department_id: item.department_id }).first()
			nextAssignee = owner?.id || null
		} else if (item.state === 'owner_review') {
			nextState = 'admin_review'
			const admin = await knex('users').where({ role: 'Admin', is_active: true }).first()
			nextAssignee = admin?.id || null
		} else if (item.state === 'admin_review') {
			nextState = 'approved'
			nextAssignee = null
			// apply change
			await applyApprovedChange(item)
		}
	} else if (action === 'reject') {
		if (!comment) return res.status(400).json({ error: 'Rejection requires note' })
		nextState = 'rejected'
		nextAssignee = null
	} else if (action === 'comment') {
		await knex('workflow_history').insert({ workflow_item_id: id, actor_user_id: req.user.id, action: 'comment', comment, from_state: fromState, to_state: fromState })
		return res.json({ ok: true, state: fromState })
	} else {
		return res.status(400).json({ error: 'Invalid action' })
	}
	await knex('workflow_items').where({ id }).update({ state: nextState, assigned_to: nextAssignee, comment, updated_at: knex.fn.now() })
	await knex('workflow_history').insert({ workflow_item_id: id, actor_user_id: req.user.id, action, comment, from_state: fromState, to_state: nextState })
	res.json({ ok: true, state: nextState })
})

// Originated by me: items I created still pending
router.get('/originated', requireAuth, async (req, res) => {
	const rows = await knex('workflow_items as w')
		.leftJoin('users as u', 'w.assigned_to', 'u.id')
		.leftJoin('departments as d', 'w.department_id', 'd.id')
		.select(
			'w.*',
			knex.raw('COALESCE(u.name, u.email) as current_approver'),
			'd.name as department_name',
		)
		.where({ 'w.requested_by': req.user.id })
		.whereNotIn('w.state', ['approved','rejected'])
		.orderBy('w.updated_at', 'desc')

	const ids = rows.map(i => i.id)
	let counts = {}
	if (ids.length) {
		const hist = await knex('workflow_history')
			.whereIn('workflow_item_id', ids)
			.andWhereNotNull('comment')
			.select('workflow_item_id')
			.count({ c: '*' })
			.groupBy('workflow_item_id')
		counts = Object.fromEntries(hist.map(r => [r.workflow_item_id, Number(r.c)]))
	}
	const enriched = rows.map(i => ({ ...i, comments_count: counts[i.id] || 0 }))
	res.json(enriched)
})

// Counts for badges
router.get('/counts', requireAuth, async (req, res) => {
	const [{ c: assignedCount }] = await knex('workflow_items').where({ assigned_to: req.user.id }).count({ c: '*' })
	const [{ c: originatedCount }] = await knex('workflow_items')
		.where({ requested_by: req.user.id })
		.whereNotIn('state', ['approved','rejected'])
		.count({ c: '*' })
	res.json({ assigned: Number(assignedCount || 0), originated: Number(originatedCount || 0) })
})

async function applyApprovedChange(item) {
	// Apply based on entity_type; item.payload_diff contains partial updates or creation payload
	const diff = item.payload_diff || {}
	if (item.entity_type === 'risk') {
		if (item.entity_id) {
			const before = await knex('risks').where({ id: item.entity_id }).first()
			await knex('risks').where({ id: item.entity_id }).update({ ...diff, updated_at: knex.fn.now() })
			const after = await knex('risks').where({ id: item.entity_id }).first()
			await knex('audit_log').insert({ entity_type: 'risk', entity_id: item.entity_id, actor_user_id: item.requested_by, action: 'update', before, after })
		} else {
			const [newId] = await knex('risks').insert({ ...diff })
			await knex('audit_log').insert({ entity_type: 'risk', entity_id: newId, actor_user_id: item.requested_by, action: 'create', before: null, after: diff })
		}
	}
	if (item.entity_type === 'action') {
		if (item.entity_id) {
			const before = await knex('mitigation_actions').where({ id: item.entity_id }).first()
			await knex('mitigation_actions').where({ id: item.entity_id }).update({ ...diff, updated_at: knex.fn.now() })
			const after = await knex('mitigation_actions').where({ id: item.entity_id }).first()
			await knex('audit_log').insert({ entity_type: 'action', entity_id: item.entity_id, actor_user_id: item.requested_by, action: 'update', before, after })
		} else {
			const [newId] = await knex('mitigation_actions').insert({ ...diff })
			await knex('audit_log').insert({ entity_type: 'action', entity_id: newId, actor_user_id: item.requested_by, action: 'create', before: null, after: diff })
		}
	}
	if (item.entity_type === 'department') {
		if (item.entity_id) {
			const before = await knex('departments').where({ id: item.entity_id }).first()
			await knex('departments').where({ id: item.entity_id }).update({ ...diff, updated_at: knex.fn.now() })
			const after = await knex('departments').where({ id: item.entity_id }).first()
			await knex('audit_log').insert({ entity_type: 'department', entity_id: item.entity_id, actor_user_id: item.requested_by, action: 'update', before, after })
		} else {
			const [newId] = await knex('departments').insert({ ...diff })
			await knex('audit_log').insert({ entity_type: 'department', entity_id: newId, actor_user_id: item.requested_by, action: 'create', before: null, after: diff })
		}
	}
	if (item.entity_type === 'dept_knowledge') {
		if (item.entity_id) {
			const before = await knex('department_knowledge').where({ id: item.entity_id }).first()
			await knex('department_knowledge').where({ id: item.entity_id }).update({ ...diff, updated_at: knex.fn.now() })
			const after = await knex('department_knowledge').where({ id: item.entity_id }).first()
			await knex('audit_log').insert({ entity_type: 'dept_knowledge', entity_id: item.entity_id, actor_user_id: item.requested_by, action: 'update', before, after })
		} else {
			const [newId] = await knex('department_knowledge').insert({ ...diff })
			await knex('audit_log').insert({ entity_type: 'dept_knowledge', entity_id: newId, actor_user_id: item.requested_by, action: 'create', before: null, after: diff })
		}
	}
	if (item.entity_type === 'category') {
		if (item.entity_id) {
			const before = await knex('categories').where({ id: item.entity_id }).first()
			await knex('categories').where({ id: item.entity_id }).update({ ...diff })
			const after = await knex('categories').where({ id: item.entity_id }).first()
			await knex('audit_log').insert({ entity_type: 'category', entity_id: item.entity_id, actor_user_id: item.requested_by, action: 'update', before, after })
		} else {
			const [newId] = await knex('categories').insert({ ...diff })
			await knex('audit_log').insert({ entity_type: 'category', entity_id: newId, actor_user_id: item.requested_by, action: 'create', before: null, after: diff })
		}
	}
	if (item.entity_type === 'subcategory') {
		if (item.entity_id) {
			const before = await knex('subcategories').where({ id: item.entity_id }).first()
			await knex('subcategories').where({ id: item.entity_id }).update({ ...diff })
			const after = await knex('subcategories').where({ id: item.entity_id }).first()
			await knex('audit_log').insert({ entity_type: 'subcategory', entity_id: item.entity_id, actor_user_id: item.requested_by, action: 'update', before, after })
		} else {
			const [newId] = await knex('subcategories').insert({ ...diff })
			await knex('audit_log').insert({ entity_type: 'subcategory', entity_id: newId, actor_user_id: item.requested_by, action: 'create', before: null, after: diff })
		}
	}
	if (item.entity_type === 'config') {
		const before = await knex('config').where({ key: diff.key }).first()
		if (before) {
			await knex('config').where({ key: diff.key }).update({ value: diff.value })
			const after = await knex('config').where({ key: diff.key }).first()
			await knex('audit_log').insert({ entity_type: 'config', entity_id: after.id, actor_user_id: item.requested_by, action: 'update', before, after })
		} else {
			const [newId] = await knex('config').insert({ key: diff.key, value: diff.value })
			await knex('audit_log').insert({ entity_type: 'config', entity_id: newId, actor_user_id: item.requested_by, action: 'create', before: null, after: diff })
		}
	}
}

export default router


