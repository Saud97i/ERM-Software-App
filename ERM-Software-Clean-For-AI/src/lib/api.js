export async function apiGet(path) {
	const res = await fetch(`/api${path}`, { credentials: 'include' })
	if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
	return res.json()
}

export async function apiPost(path, body) {
	const res = await fetch(`/api${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(body || {}),
	})
	if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
	return res.json()
}

export async function apiPut(path, body) {
	const res = await fetch(`/api${path}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(body || {}),
	})
	if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`)
	return res.json()
}

export async function apiDelete(path) {
	const res = await fetch(`/api${path}`, {
		method: 'DELETE',
		credentials: 'include',
	})
	if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`)
	return res.json()
}


