import jwt from 'jsonwebtoken'

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'erm_jwt'
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export function requireAuth(req, res, next) {
	const token = req.cookies[COOKIE_NAME]
	if (!token) return res.status(401).json({ error: 'Unauthorized' })
	try {
		const payload = jwt.verify(token, JWT_SECRET)
		req.user = payload
		next()
	} catch (err) {
		return res.status(401).json({ error: 'Invalid token' })
	}
}

export function setAuthCookie(res, payload) {
	const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
	res.cookie(COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 7 * 24 * 60 * 60 * 1000,
		path: '/',
	})
}

export function clearAuthCookie(res) {
	res.clearCookie(COOKIE_NAME, {
		path: '/',
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
	})
}


