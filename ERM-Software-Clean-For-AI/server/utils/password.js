import bcrypt from 'bcryptjs'

const ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12)

export async function hashPassword(plain) {
	return bcrypt.hash(plain, ROUNDS)
}

export async function verifyPassword(plain, hash) {
	return bcrypt.compare(plain, hash)
}


