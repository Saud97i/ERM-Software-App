// Centralized RBAC helpers and scoping utilities

// Roles
export function isAdmin(user) { return user?.role === 'Admin'; }
export function isExecutive(user) { return user?.role === 'Executive'; }
export function isOwner(user) { return user?.role === 'Risk Owner' || user?.role === 'Owner'; }
export function isChampion(user) { return user?.role === 'Risk Champion' || user?.role === 'Champion'; }
export function isTeamMember(user) { return user?.role === 'Team Member'; }

// Tabs: dashboard, register, actions, deptkb, incidents, workflow, topreport, admin
export function canSeeTab(user, tab) {
  if (isAdmin(user)) return true;
  if (isExecutive(user)) {
    return ['dashboard', 'register', 'deptkb', 'heatmap', 'inbox', 'topreport'].includes(tab);
  }
  if (isOwner(user) || isChampion(user)) {
    return ['dashboard', 'register', 'actions', 'deptkb', 'inbox', 'incidents', 'workflow'].includes(tab);
  }
  if (isTeamMember(user)) {
    return ['dashboard', 'register', 'deptkb', 'inbox'].includes(tab);
  }
  return false;
}

// Generic scoping helper
export function scopeByDept(items, user, getDeptId) {
  if (isAdmin(user) || isExecutive(user)) return items;
  const userDept = user?.departmentId || (user?.departments?.[0]);
  return items.filter(it => String(getDeptId(it)) === String(userDept));
}

// Specific scopers (risks/actions/knowledge expected shapes)
export function scopeRisks(risks, user) {
  return scopeByDept(risks, user, r => r.departmentId || r.department);
}

export function scopeActions(actions, user) {
  if (isAdmin(user) || isExecutive(user)) return actions;
  const userDept = user?.departmentId || (user?.departments?.[0]);
  const myEmail = user?.email;
  return actions.filter(a => String(a.departmentId || a.assignedDepartmentId) === String(userDept) || a.owner === myEmail || a.assignedTo === myEmail);
}

export function scopeKnowledge(items, user) {
  return scopeByDept(items, user, k => k.departmentId || k.department);
}

// Department edit capability
export function canEditDepartment(user, deptId) {
  if (isAdmin(user)) return true;
  const userDept = user?.departmentId || (user?.departments?.[0]);
  if (!userDept) return false;
  if (isOwner(user)) return String(userDept) === String(deptId);
  return false;
}

// Workflow stage utilities
export const STAGES = ['Draft','PendingChampion','PendingOwner','PendingAdmin','Approved','Rejected'];

export function nextStageOnSubmit(user) {
  if (isTeamMember(user)) return 'PendingChampion';
  if (isChampion(user)) return 'PendingOwner';
  if (isOwner(user)) return 'PendingAdmin';
  if (isAdmin(user)) return 'Approved';
  return 'Draft';
}

export function canApprove(user, stage) {
  if (stage === 'PendingAdmin') return isAdmin(user);
  if (stage === 'PendingOwner') return isOwner(user);
  if (stage === 'PendingChampion') return isChampion(user);
  return false;
}

export function isReadOnly(user) { return isExecutive(user); }


