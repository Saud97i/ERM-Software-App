/**
 * Authorization helper functions for user roles and permissions
 */

/**
 * Check if user is an Admin
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export function isAdmin(user) {
	return user?.role === 'Admin'
}

/**
 * Check if user is an Executive
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export function isExecutive(user) {
	return user?.role === 'Executive'
}

/**
 * Check if user is a Risk Champion for a specific department
 * @param {Object} user - User object with role and department_id properties
 * @param {number} deptId - Department ID to check
 * @returns {boolean}
 */
export function isRiskChampion(user, deptId) {
	return user?.role === 'Risk Champion' && user?.department_id === deptId
}

/**
 * Check if user is a Risk Owner for a specific department
 * @param {Object} user - User object with role and department_id properties
 * @param {number} deptId - Department ID to check
 * @returns {boolean}
 */
export function isRiskOwner(user, deptId) {
	return user?.role === 'Risk Owner' && user?.department_id === deptId
}

/**
 * Check if user is a Team Member for a specific department
 * @param {Object} user - User object with role and department_id properties
 * @param {number} deptId - Department ID to check
 * @returns {boolean}
 */
export function isTeamMember(user, deptId) {
	return user?.role === 'Team Member' && user?.department_id === deptId
}

/**
 * Check if user has any role that requires a department
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export function requiresDepartment(user) {
	return ['Risk Champion', 'Risk Owner', 'Team Member'].includes(user?.role)
}

/**
 * Check if user can access a specific department
 * @param {Object} user - User object with role and department_id properties
 * @param {number} deptId - Department ID to check
 * @returns {boolean}
 */
export function canAccessDepartment(user, deptId) {
	if (isAdmin(user) || isExecutive(user)) {
		return true // Admin and Executive can access all departments
	}
	
	return user?.department_id === deptId
}

/**
 * Check if user can create/edit risks
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export function canManageRisks(user) {
	return ['Admin', 'Risk Champion', 'Risk Owner', 'Team Member'].includes(user?.role)
}

/**
 * Check if user can approve risks
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export function canApproveRisks(user) {
	return ['Admin', 'Risk Owner'].includes(user?.role)
}

/**
 * Check if user can manage users
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export function canManageUsers(user) {
	return isAdmin(user)
}

/**
 * Get user's effective permissions for a specific department
 * @param {Object} user - User object
 * @param {number} deptId - Department ID
 * @returns {Object} Permissions object
 */
export function getUserPermissions(user, deptId) {
	return {
		canView: canAccessDepartment(user, deptId),
		canCreate: canManageRisks(user) && canAccessDepartment(user, deptId),
		canEdit: canManageRisks(user) && canAccessDepartment(user, deptId),
		canApprove: canApproveRisks(user) && canAccessDepartment(user, deptId),
		canManageUsers: canManageUsers(user),
		canViewAll: isAdmin(user) || isExecutive(user)
	}
}
