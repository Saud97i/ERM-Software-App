const STORAGE_KEY = "erm_tool_state_v5"

export const DEMO_USERS = [
	{"name":"Saud Admin","email":"admin@demo.co","role":"Admin","departments":["Marketing","Operations"],"password":"admin123","isActive":true},
	{"name":"Maya Champion (Marketing)","email":"champ.marketing@demo.co","role":"Risk Champion","departments":["Marketing"],"password":"champ123","isActive":true},
	{"name":"Omar Owner (Marketing)","email":"owner.marketing@demo.co","role":"Risk Owner","departments":["Marketing"],"password":"owner123","isActive":true},
	{"name":"Rami Champion (Operations)","email":"champ.ops@demo.co","role":"Risk Champion","departments":["Operations"],"password":"champ123","isActive":true},
	{"name":"Lina Owner (Operations)","email":"owner.ops@demo.co","role":"Risk Owner","departments":["Operations"],"password":"owner123","isActive":true},
	{"name":"Sara Executive","email":"exec@demo.co","role":"Executive","departments":[],"password":"exec123","isActive":true}
]

function randomId() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

export function ensureDemoUsersSeeded() {
	const raw = localStorage.getItem(STORAGE_KEY)
	const state = raw ? JSON.parse(raw) : {}
	const now = new Date().toISOString()
	let users = Array.isArray(state.users) ? state.users.slice() : []
	const byEmail = new Map(users.map(u => [u.email, u]))
	let changed = false
	for (const demo of DEMO_USERS) {
		const existing = byEmail.get(demo.email)
		if (!existing) {
			const nu = { id: randomId(), createdAt: now, updatedAt: now, ...demo }
			users.push(nu)
			byEmail.set(demo.email, nu)
			changed = true
		} else if (existing.password !== demo.password) {
			existing.password = demo.password
			existing.updatedAt = now
			changed = true
		}
	}
	if (changed) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, users }))
	}
	return users
}

export function resetDemoUsers() {
	const raw = localStorage.getItem(STORAGE_KEY)
	const state = raw ? JSON.parse(raw) : {}
	const now = new Date().toISOString()
	const users = DEMO_USERS.map(u => ({ id: randomId(), createdAt: now, updatedAt: now, ...u }))
	delete state.currentUserId
	localStorage.removeItem('erm_auth_user')
	localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, users }))
	return users
}

export function findUserByEmail(email) {
	const raw = localStorage.getItem(STORAGE_KEY)
	const state = raw ? JSON.parse(raw) : {}
	const users = Array.isArray(state.users) ? state.users : []
	return users.find(u => u.email === email)
}

export function loginLocal(email, password) {
	const user = findUserByEmail(email)
	if (!user || !user.isActive) return null
	if (user.password !== password) return null
	const raw = localStorage.getItem(STORAGE_KEY)
	const state = raw ? JSON.parse(raw) : {}
	localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, currentUserId: user.id }))
	localStorage.setItem('erm_auth_user', JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role }))
	return user
}

export function logoutLocal() {
	localStorage.removeItem('erm_auth_user')
}


