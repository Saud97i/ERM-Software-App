import express from 'express'
import { knex } from '../lib/knex.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { requireAuth, setAuthCookie, clearAuthCookie } from '../middlewares/auth.js'

const router = express.Router()

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body || {}
		if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })
		
		const user = await knex('users').where({ email: email.toLowerCase() }).first()
		if (!user || !user.is_active) return res.status(401).json({ error: 'Invalid credentials' })
		
		const ok = await verifyPassword(password, user.password_hash)
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
		
		// Update last login timestamp
		await knex('users').where({ id: user.id }).update({ 
			lastLoginAt: knex.fn.now(),
			updated_at: knex.fn.now()
		})
		
		// Get department assignments
		const departments = await knex('department_user').where({ user_id: user.id }).pluck('department_id')
		
		setAuthCookie(res, { 
			id: user.id, 
			email: user.email, 
			role: user.role, 
			department_id: user.department_id,
			departments,
			name: user.name
		})
		
		return res.json({ 
			id: user.id, 
			email: user.email, 
			name: user.name, 
			role: mapRole(user.role), 
			department_id: user.department_id,
			departments 
		})
	} catch (error) {
		console.error('Login error:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

router.post('/logout', (req, res) => {
	clearAuthCookie(res)
	res.json({ ok: true })
})

router.get('/me', requireAuth, async (req, res) => {
	try {
		const user = await knex('users').where({ id: req.user.id }).first()
		if (!user) return res.status(404).json({ error: 'Not found' })
		
		const departments = await knex('department_user').where({ user_id: user.id }).pluck('department_id')
		res.json({ 
			id: user.id, 
			email: user.email, 
			name: user.name, 
			role: mapRole(user.role), 
			department_id: user.department_id,
			departments,
			phone: user.phone,
			title: user.title,
			isActive: user.is_active
		})
	} catch (error) {
		console.error('Error fetching user:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

function mapRole(dbRole) {
	// Map DB enum to UI wording
	if (dbRole === 'Risk Champion') return 'Risk Champion'
	if (dbRole === 'Risk Owner') return 'Risk Owner'
	if (dbRole === 'Team Member') return 'Team Member'
	return dbRole
}

export default router


