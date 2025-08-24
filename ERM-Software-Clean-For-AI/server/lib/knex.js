import fs from 'fs'
import path from 'path'
import knexPkg from 'knex'

const DB_CLIENT = process.env.DB_CLIENT || 'sqlite3'
const DB_FILE = process.env.DB_FILE || path.resolve('server/data/erm.sqlite')

if (DB_CLIENT === 'sqlite3') {
	const dir = path.dirname(DB_FILE)
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export const knex = knexPkg({
	client: DB_CLIENT,
	connection:
		DB_CLIENT === 'sqlite3'
			? { filename: DB_FILE }
			: process.env.DATABASE_URL,
	useNullAsDefault: DB_CLIENT === 'sqlite3',
})

export default knex


