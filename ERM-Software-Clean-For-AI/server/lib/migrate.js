import path from 'path'
import { knex } from './knex.js'

export async function ensureMigrations() {
	await knex.migrate.latest({
		directory: path.resolve('server/migrations'),
	})
}


