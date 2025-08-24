export function requireRole(...roles) {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
		if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
		next()
	}
}

export function restrictDepartments(req, res, next) {
	// If user is Admin or Executive, skip dept restriction for reads
	if (req.user.role === 'Admin' || req.user.role === 'Executive') return next()
	// For Risk Champions/Risk Owners/Team Members, enforce department on requests that pass department_id
	const departmentId = req.body?.department_id || req.query?.department_id || req.params?.department_id
	if (!departmentId) return next() // not always required
	const userDeptIds = (req.user.departments || []).map((d) => String(d))
	if (!userDeptIds.includes(String(departmentId))) return res.status(403).json({ error: 'Department restricted' })
	return next()
}


