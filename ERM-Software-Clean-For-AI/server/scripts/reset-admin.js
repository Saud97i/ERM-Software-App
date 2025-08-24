import 'dotenv/config'
import { knex } from '../lib/knex.js'
import { hashPassword } from '../utils/password.js'

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@company.com'
  const newPassword = process.env.NEW_ADMIN_PASSWORD || 'Admin123!'
  const password_hash = await hashPassword(newPassword)
  const updated = await knex('users').where({ email }).update({ password_hash, is_active: 1 })
  if (updated === 0) {
    console.log(`No user found for ${email}.`)
  } else {
    console.log(`Password reset for ${email}.`)
  }
  process.exit(0)
}

main().catch((err) => { console.error(err); process.exit(1) })


