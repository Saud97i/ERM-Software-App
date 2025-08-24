import express from 'express'
import { knex } from '../lib/knex.js'
import { requireAuth } from '../middlewares/auth.js'

const router = express.Router()

router.get('/:entity_type/:entity_id', requireAuth, async (req, res) => {
	const { entity_type, entity_id } = req.params
	const comments = await knex('comments').where({ entity_type, entity_id }).orderBy('created_at', 'asc')
	res.json(comments)
})

router.post('/', requireAuth, async (req, res) => {
	const { entity_type, entity_id, text } = req.body || {}
	if (!entity_type || !entity_id || !text) return res.status(400).json({ error: 'Missing fields' })
	const [id] = await knex('comments').insert({ entity_type, entity_id, text, author_user_id: req.user.id })
	res.json({ id })
})

export default router


