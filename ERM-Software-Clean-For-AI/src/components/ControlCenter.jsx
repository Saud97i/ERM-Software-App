import React, { useState, useEffect } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api.js'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { 
	Users, 
	Building2, 
	Tags, 
	Grid3X3, 
	Workflow, 
	Plus, 
	Edit3, 
	Trash2, 
	Save, 
	X, 
	Shield, 
	UserCheck, 
	UserPlus, 
	Settings, 
	Eye, 
	CheckCircle2, 
	XCircle, 
	MessageSquare, 
	Clock, 
	AlertCircle,
	FileText,
	Calendar,
	ArrowRight,
	RotateCcw,
	Key,
	UserX
} from 'lucide-react'

export default function ControlCenter({ currentUser, onClose }) {
	const [activeTab, setActiveTab] = useState('users')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	// Check if user has admin access
	if (currentUser?.role !== 'Admin') {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center">
				<Card className="w-96">
					<CardContent className="pt-6">
						<div className="text-center">
							<Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
							<h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
							<p className="text-slate-600 mb-4">You need Admin privileges to access the Control Center.</p>
							<Button onClick={onClose} variant="outline">
								Back to Dashboard
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Header */}
			<div className="bg-white border-b border-slate-200 shadow-sm">
				<div className="max-w-7xl mx-auto px-6 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-slate-900">Administration Control Center</h1>
							<p className="text-slate-600 mt-2">Centralized management for users, departments, categories, risk matrix, and workflows</p>
						</div>
						<Button 
							onClick={() => {
								onClose()
								window.dispatchEvent(new CustomEvent('closeControlCenter'))
							}} 
							variant="outline" 
							className="flex items-center gap-2"
						>
							<X className="h-4 w-4" />
							Back to Dashboard
						</Button>
					</div>
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="bg-white border-b border-slate-200">
				<div className="max-w-7xl mx-auto px-6">
					<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
						<TabsList className="grid w-full grid-cols-5 bg-slate-100 p-1 rounded-lg">
							<TabsTrigger value="users" className="flex items-center gap-2">
								<Users className="h-4 w-4" />
								Users & Roles
							</TabsTrigger>
							<TabsTrigger value="departments" className="flex items-center gap-2">
								<Building2 className="h-4 w-4" />
								Departments
							</TabsTrigger>
							<TabsTrigger value="categories" className="flex items-center gap-2">
								<Tags className="h-4 w-4" />
								Categories
							</TabsTrigger>
							<TabsTrigger value="matrix" className="flex items-center gap-2">
								<Grid3X3 className="h-4 w-4" />
								Risk Matrix
							</TabsTrigger>
							<TabsTrigger value="workflow" className="flex items-center gap-2">
								<Workflow className="h-4 w-4" />
								Workflow & Monitor
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{/* Content Area */}
			<div className="max-w-7xl mx-auto px-6 py-8">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsContent value="users">
						<UsersManagement />
					</TabsContent>
					<TabsContent value="departments">
						<DepartmentsManagement />
					</TabsContent>
					<TabsContent value="categories">
						<CategoriesManagement />
					</TabsContent>
					<TabsContent value="matrix">
						<RiskMatrixManagement />
					</TabsContent>
					<TabsContent value="workflow">
						<WorkflowManagement />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}

// Users & Roles Management Component
function UsersManagement() {
	const [users, setUsers] = useState([])
	const [departments, setDepartments] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [form, setForm] = useState({
		email: '',
		name: '',
		role: 'Team Member',
		departmentAssignments: [] // [{departmentId, roleInDepartment}]
	})
	const [editingUser, setEditingUser] = useState(null)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		loadData()
	}, [])

	async function loadData() {
		setLoading(true)
		try {
			const [usersData, deptsData] = await Promise.all([
				apiGet('/admin/users'),
				apiGet('/admin/departments')
			])
			setUsers(usersData)
			setDepartments(deptsData)
		} catch (e) {
			setError('Failed to load users data')
		} finally {
			setLoading(false)
		}
	}

	async function saveUser(e) {
		e.preventDefault()
		setSaving(true)
		try {
			if (editingUser) {
				await apiPut(`/admin/users/${editingUser.id}`, form)
			} else {
				await apiPost('/admin/users', form)
			}
			await loadData()
			resetForm()
		} catch (e) {
			setError('Failed to save user')
		} finally {
			setSaving(false)
		}
	}

	function resetForm() {
		setForm({
			email: '',
			name: '',
			role: 'Team Member',
			departmentAssignments: []
		})
		setEditingUser(null)
	}

	function editUser(user) {
		setForm({
			email: user.email,
			name: user.name,
			role: user.role,
			departmentAssignments: user.departmentAssignments || []
		})
		setEditingUser(user)
	}

	async function toggleUserStatus(userId, isActive) {
		try {
			await apiPost(`/admin/users/${userId}/toggle-status`, { isActive: !isActive })
			await loadData()
		} catch (e) {
			setError('Failed to update user status')
		}
	}

	async function resetPassword(userId) {
		const newPassword = prompt('Enter new password (minimum 8 characters):')
		if (!newPassword || newPassword.length < 8) {
			alert('Password must be at least 8 characters long')
			return
		}
		try {
			await apiPost(`/admin/users/${userId}/reset-password`, { password: newPassword })
			alert('Password reset successfully')
		} catch (e) {
			alert('Failed to reset password')
		}
	}

	function addDepartmentAssignment() {
		setForm({
			...form,
			departmentAssignments: [
				...form.departmentAssignments,
				{ departmentId: '', roleInDepartment: 'Team Member' }
			]
		})
	}

	function updateDepartmentAssignment(index, field, value) {
		const updated = [...form.departmentAssignments]
		updated[index][field] = value
		setForm({ ...form, departmentAssignments: updated })
	}

	function removeDepartmentAssignment(index) {
		const updated = form.departmentAssignments.filter((_, i) => i !== index)
		setForm({ ...form, departmentAssignments: updated })
	}

	function getRoleColor(role) {
		switch (role) {
			case 'Admin': return 'bg-red-100 text-red-800 border-red-200'
			case 'Risk Owner': return 'bg-blue-100 text-blue-800 border-blue-200'
			case 'Risk Champion': return 'bg-green-100 text-green-800 border-green-200'
			case 'Team Member': return 'bg-slate-100 text-slate-800 border-slate-200'
			case 'Executive': return 'bg-purple-100 text-purple-800 border-purple-200'
			default: return 'bg-slate-100 text-slate-800 border-slate-200'
		}
	}

	function getRoleIcon(role) {
		switch (role) {
			case 'Admin': return <Shield className="h-4 w-4" />
			case 'Risk Owner': return <UserCheck className="h-4 w-4" />
			case 'Risk Champion': return <CheckCircle2 className="h-4 w-4" />
			case 'Team Member': return <Users className="h-4 w-4" />
			case 'Executive': return <Building2 className="h-4 w-4" />
			default: return <Users className="h-4 w-4" />
		}
	}

	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p className="text-slate-600">Loading users...</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<div className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-red-600" />
						<span className="text-red-800">{error}</span>
					</div>
				</div>
			)}

			{/* User Form */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserPlus className="h-5 w-5 text-blue-600" />
						{editingUser ? 'Edit User' : 'Create New User'}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={saveUser} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={form.email}
									onChange={(e) => setForm({ ...form, email: e.target.value })}
									placeholder="user@company.com"
									required
								/>
							</div>
							<div>
								<Label htmlFor="name">Full Name</Label>
								<Input
									id="name"
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
									placeholder="John Doe"
									required
								/>
							</div>
							<div>
								<Label htmlFor="role">Primary Role</Label>
								<Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Admin">Admin</SelectItem>
										<SelectItem value="Risk Owner">Risk Owner</SelectItem>
										<SelectItem value="Risk Champion">Risk Champion</SelectItem>
										<SelectItem value="Team Member">Team Member</SelectItem>
										<SelectItem value="Executive">Executive</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Department Assignments */}
						{['Risk Owner', 'Risk Champion', 'Team Member'].includes(form.role) && (
							<div>
								<div className="flex items-center justify-between mb-3">
									<Label>Department Assignments</Label>
									<Button type="button" size="sm" onClick={addDepartmentAssignment}>
										<Plus className="h-4 w-4 mr-1" />
										Add Department
									</Button>
								</div>
								{form.departmentAssignments.map((assignment, index) => (
									<div key={index} className="flex items-center gap-2 mb-2">
										<Select
											value={assignment.departmentId}
											onValueChange={(value) => updateDepartmentAssignment(index, 'departmentId', value)}
										>
											<SelectTrigger className="flex-1">
												<SelectValue placeholder="Select Department" />
											</SelectTrigger>
											<SelectContent>
												{departments.map(dept => (
													<SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Select
											value={assignment.roleInDepartment}
											onValueChange={(value) => updateDepartmentAssignment(index, 'roleInDepartment', value)}
										>
											<SelectTrigger className="w-40">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Risk Champion">Risk Champion</SelectItem>
												<SelectItem value="Risk Owner">Risk Owner</SelectItem>
												<SelectItem value="Team Member">Team Member</SelectItem>
											</SelectContent>
										</Select>
										<Button
											type="button"
											size="sm"
											variant="outline"
											onClick={() => removeDepartmentAssignment(index)}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								))}
							</div>
						)}

						<div className="flex items-center gap-2">
							<Button type="submit" disabled={saving}>
								{saving ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
							</Button>
							{editingUser && (
								<Button type="button" variant="outline" onClick={resetForm}>
									Cancel
								</Button>
							)}
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Users List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5 text-slate-600" />
						User Directory ({users.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{users.map(user => (
							<div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2">
										{getRoleIcon(user.role)}
										<Badge className={getRoleColor(user.role)}>
											{user.role}
										</Badge>
									</div>
									<div>
										<div className="font-semibold text-slate-900">{user.name}</div>
										<div className="text-sm text-slate-600">{user.email}</div>
										<div className="text-xs text-slate-500">
											Status: {user.is_active ? 'Active' : 'Inactive'}
											{user.last_login && ` • Last login: ${new Date(user.last_login).toLocaleDateString()}`}
										</div>
										{user.departmentAssignments && user.departmentAssignments.length > 0 && (
											<div className="flex flex-wrap gap-1 mt-1">
												{user.departmentAssignments.map((assignment, idx) => (
													<Badge key={idx} variant="outline" className="text-xs">
														{assignment.departmentName}: {assignment.roleInDepartment}
													</Badge>
												))}
											</div>
										)}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() => editUser(user)}
									>
										<Edit3 className="h-4 w-4 mr-1" />
										Edit
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => resetPassword(user.id)}
										className="border-amber-200 text-amber-700 hover:bg-amber-50"
									>
										<Key className="h-4 w-4 mr-1" />
										Reset Password
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => toggleUserStatus(user.id, user.is_active)}
										className={user.is_active ? "border-red-200 text-red-700 hover:bg-red-50" : "border-green-200 text-green-700 hover:bg-green-50"}
									>
										{user.is_active ? (
											<>
												<UserX className="h-4 w-4 mr-1" />
												Deactivate
											</>
										) : (
											<>
												<UserCheck className="h-4 w-4 mr-1" />
												Activate
											</>
										)}
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

// Departments Management Component
function DepartmentsManagement() {
	const [departments, setDepartments] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [form, setForm] = useState({
		name: '',
		description: '',
		processes: [],
		inherentRiskExamples: [],
		metadata: {}
	})
	const [editingDept, setEditingDept] = useState(null)
	const [saving, setSaving] = useState(false)
	const [newProcess, setNewProcess] = useState('')
	const [newRiskExample, setNewRiskExample] = useState('')

	useEffect(() => {
		loadDepartments()
	}, [])

	async function loadDepartments() {
		setLoading(true)
		try {
			const data = await apiGet('/admin/departments')
			setDepartments(data)
		} catch (e) {
			setError('Failed to load departments')
		} finally {
			setLoading(false)
		}
	}

	async function saveDepartment(e) {
		e.preventDefault()
		setSaving(true)
		try {
			if (editingDept) {
				await apiPut(`/admin/departments/${editingDept.id}`, form)
			} else {
				await apiPost('/admin/departments', form)
			}
			await loadDepartments()
			resetForm()
		} catch (e) {
			setError('Failed to save department')
		} finally {
			setSaving(false)
		}
	}

	function resetForm() {
		setForm({
			name: '',
			description: '',
			processes: [],
			inherentRiskExamples: [],
			metadata: {}
		})
		setEditingDept(null)
		setNewProcess('')
		setNewRiskExample('')
	}

	function editDepartment(dept) {
		setForm({
			name: dept.name,
			description: dept.description || '',
			processes: dept.processes ? JSON.parse(dept.processes) : [],
			inherentRiskExamples: dept.inherent_risk_examples ? JSON.parse(dept.inherent_risk_examples) : [],
			metadata: dept.metadata ? JSON.parse(dept.metadata) : {}
		})
		setEditingDept(dept)
	}

	async function deleteDepartment(deptId) {
		if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) return
		try {
			await apiDelete(`/admin/departments/${deptId}`)
			await loadDepartments()
		} catch (e) {
			setError('Failed to delete department. It may have existing references.')
		}
	}

	function addProcess() {
		if (newProcess.trim()) {
			setForm({
				...form,
				processes: [...form.processes, newProcess.trim()]
			})
			setNewProcess('')
		}
	}

	function removeProcess(index) {
		const updated = form.processes.filter((_, i) => i !== index)
		setForm({ ...form, processes: updated })
	}

	function addRiskExample() {
		if (newRiskExample.trim()) {
			setForm({
				...form,
				inherentRiskExamples: [...form.inherentRiskExamples, newRiskExample.trim()]
			})
			setNewRiskExample('')
		}
	}

	function removeRiskExample(index) {
		const updated = form.inherentRiskExamples.filter((_, i) => i !== index)
		setForm({ ...form, inherentRiskExamples: updated })
	}

	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p className="text-slate-600">Loading departments...</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<div className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-red-600" />
						<span className="text-red-800">{error}</span>
					</div>
				</div>
			)}

			{/* Department Form */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Plus className="h-5 w-5 text-blue-600" />
						{editingDept ? 'Edit Department' : 'Create New Department'}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={saveDepartment} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="name">Department Name</Label>
								<Input
									id="name"
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
									placeholder="e.g., Operations, Marketing, IT"
									required
								/>
							</div>
							<div>
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									value={form.description}
									onChange={(e) => setForm({ ...form, description: e.target.value })}
									placeholder="Brief description of the department"
								/>
							</div>
						</div>

						{/* Core Processes */}
						<div>
							<Label>Core Processes</Label>
							<div className="space-y-2">
								<div className="flex gap-2">
									<Input
										value={newProcess}
										onChange={(e) => setNewProcess(e.target.value)}
										placeholder="Add a core process..."
										onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProcess())}
									/>
									<Button type="button" onClick={addProcess} size="sm">
										<Plus className="h-4 w-4" />
									</Button>
								</div>
								<div className="flex flex-wrap gap-2">
									{form.processes.map((process, index) => (
										<Badge key={index} variant="outline" className="flex items-center gap-1">
											{process}
											<button
												type="button"
												onClick={() => removeProcess(index)}
												className="ml-1 hover:text-red-600"
											>
												<X className="h-3 w-3" />
											</button>
										</Badge>
									))}
								</div>
							</div>
						</div>

						{/* Inherent Risk Examples */}
						<div>
							<Label>Inherent Risk Examples</Label>
							<div className="space-y-2">
								<div className="flex gap-2">
									<Input
										value={newRiskExample}
										onChange={(e) => setNewRiskExample(e.target.value)}
										placeholder="Add an inherent risk example..."
										onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRiskExample())}
									/>
									<Button type="button" onClick={addRiskExample} size="sm">
										<Plus className="h-4 w-4" />
									</Button>
								</div>
								<div className="flex flex-wrap gap-2">
									{form.inherentRiskExamples.map((risk, index) => (
										<Badge key={index} variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-800 border-amber-200">
											{risk}
											<button
												type="button"
												onClick={() => removeRiskExample(index)}
												className="ml-1 hover:text-red-600"
											>
												<X className="h-3 w-3" />
											</button>
										</Badge>
									))}
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Button type="submit" disabled={saving}>
								{saving ? 'Saving...' : (editingDept ? 'Update Department' : 'Create Department')}
							</Button>
							{editingDept && (
								<Button type="button" variant="outline" onClick={resetForm}>
									Cancel
								</Button>
							)}
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Departments List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-5 w-5 text-slate-600" />
						Departments ({departments.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{departments.map(dept => (
							<div key={dept.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<h3 className="font-semibold text-slate-900">{dept.name}</h3>
											<Badge variant="outline" className="text-xs">
												ID: {dept.id}
											</Badge>
										</div>
										{dept.description && (
											<p className="text-sm text-slate-600 mb-3">{dept.description}</p>
										)}
										
										{/* Core Processes */}
										{dept.processes && JSON.parse(dept.processes).length > 0 && (
											<div className="mb-2">
												<Label className="text-xs text-slate-500">Core Processes:</Label>
												<div className="flex flex-wrap gap-1 mt-1">
													{JSON.parse(dept.processes).map((process, idx) => (
														<Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
															{process}
														</Badge>
													))}
												</div>
											</div>
										)}

										{/* Inherent Risk Examples */}
										{dept.inherent_risk_examples && JSON.parse(dept.inherent_risk_examples).length > 0 && (
											<div>
												<Label className="text-xs text-slate-500">Inherent Risk Examples:</Label>
												<div className="flex flex-wrap gap-1 mt-1">
													{JSON.parse(dept.inherent_risk_examples).map((risk, idx) => (
														<Badge key={idx} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
															{risk}
														</Badge>
													))}
												</div>
											</div>
										)}
									</div>
									<div className="flex items-center gap-2 ml-4">
										<Button
											size="sm"
											variant="outline"
											onClick={() => editDepartment(dept)}
										>
											<Edit3 className="h-4 w-4 mr-1" />
											Edit
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => deleteDepartment(dept.id)}
											className="border-red-200 text-red-700 hover:bg-red-50"
										>
											<Trash2 className="h-4 w-4 mr-1" />
											Delete
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

function CategoriesManagement() {
	const [categories, setCategories] = useState([])
	const [subcategories, setSubcategories] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [activeTab, setActiveTab] = useState('categories')

	useEffect(() => {
		loadCategories()
	}, [])

	async function loadCategories() {
		setLoading(true)
		try {
			const data = await apiGet('/admin/categories')
			setCategories(data.categories)
			setSubcategories(data.subcategories)
		} catch (e) {
			setError('Failed to load categories')
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p className="text-slate-600">Loading categories...</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<div className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-red-600" />
						<span className="text-red-800">{error}</span>
					</div>
				</div>
			)}

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="categories">Categories</TabsTrigger>
					<TabsTrigger value="subcategories">Subcategories</TabsTrigger>
				</TabsList>

				<TabsContent value="categories">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Tags className="h-5 w-5 text-slate-600" />
								Risk Categories ({categories.length})
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{categories.map(category => (
									<div key={category.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
										<div>
											<div className="font-medium text-slate-900">{category.name}</div>
											<div className="text-sm text-slate-500">
												Used in {category.usageCount} risks
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="outline">ID: {category.id}</Badge>
											<Button size="sm" variant="outline">
												<Edit3 className="h-4 w-4 mr-1" />
												Edit
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="subcategories">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Tags className="h-5 w-5 text-slate-600" />
								Risk Subcategories ({subcategories.length})
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{subcategories.map(subcategory => (
									<div key={subcategory.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
										<div>
											<div className="font-medium text-slate-900">{subcategory.name}</div>
											<div className="text-sm text-slate-500">
												Category: {categories.find(c => c.id === subcategory.category_id)?.name || 'Unknown'} • 
												Used in {subcategory.usageCount} risks
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="outline">ID: {subcategory.id}</Badge>
											<Button size="sm" variant="outline">
												<Edit3 className="h-4 w-4 mr-1" />
												Edit
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}

function RiskMatrixManagement() {
	const [config, setConfig] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		likelihood_labels: [],
		impact_labels: [],
		risk_appetite: { low: 8, medium: 12, medium_high: 16, high: 20 }
	})

	useEffect(() => {
		loadRiskMatrix()
	}, [])

	async function loadRiskMatrix() {
		setLoading(true)
		try {
			const data = await apiGet('/admin/risk-matrix')
			setConfig(data)
			setForm({
				likelihood_labels: data.likelihood_labels,
				impact_labels: data.impact_labels,
				risk_appetite: data.risk_appetite
			})
		} catch (e) {
			setError('Failed to load risk matrix configuration')
		} finally {
			setLoading(false)
		}
	}

	async function saveRiskMatrix(e) {
		e.preventDefault()
		setSaving(true)
		try {
			await apiPost('/admin/risk-matrix', form)
			await loadRiskMatrix()
			setError('')
		} catch (e) {
			setError('Failed to save risk matrix configuration')
		} finally {
			setSaving(false)
		}
	}

	function updateLikelihoodLabel(index, value) {
		const updated = [...form.likelihood_labels]
		updated[index] = value
		setForm({ ...form, likelihood_labels: updated })
	}

	function updateImpactLabel(index, value) {
		const updated = [...form.impact_labels]
		updated[index] = value
		setForm({ ...form, impact_labels: updated })
	}

	function updateAppetite(level, value) {
		setForm({
			...form,
			risk_appetite: {
				...form.risk_appetite,
				[level]: parseInt(value)
			}
		})
	}

	// Generate risk matrix preview
	function generateMatrixPreview() {
		const matrix = []
		for (let impact = 5; impact >= 1; impact--) {
			const row = []
			for (let likelihood = 1; likelihood <= 5; likelihood++) {
				const score = likelihood * impact
				let level = 'low'
				if (score >= form.risk_appetite.high) level = 'high'
				else if (score >= form.risk_appetite.medium_high) level = 'medium-high'
				else if (score >= form.risk_appetite.medium) level = 'medium'
				
				row.push({ likelihood, impact, score, level })
			}
			matrix.push(row)
		}
		return matrix
	}

	function getCellColor(level) {
		switch (level) {
			case 'low': return 'bg-green-100 border-green-300 text-green-800'
			case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
			case 'medium-high': return 'bg-orange-100 border-orange-300 text-orange-800'
			case 'high': return 'bg-red-100 border-red-300 text-red-800'
			default: return 'bg-slate-100 border-slate-300 text-slate-800'
		}
	}

	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p className="text-slate-600">Loading risk matrix configuration...</p>
			</div>
		)
	}

	const matrixPreview = generateMatrixPreview()

	return (
		<div className="space-y-6">
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<div className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-red-600" />
						<span className="text-red-800">{error}</span>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Configuration Form */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5 text-blue-600" />
							Matrix Configuration
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={saveRiskMatrix} className="space-y-6">
							{/* Likelihood Labels */}
							<div>
								<Label className="text-base font-medium">Likelihood Labels</Label>
								<div className="space-y-2 mt-2">
									{form.likelihood_labels.map((label, index) => (
										<div key={index} className="flex items-center gap-2">
											<span className="w-8 text-sm text-slate-500">{index + 1}:</span>
											<Input
												value={label}
												onChange={(e) => updateLikelihoodLabel(index, e.target.value)}
												placeholder={`Likelihood level ${index + 1}`}
											/>
										</div>
									))}
								</div>
							</div>

							{/* Impact Labels */}
							<div>
								<Label className="text-base font-medium">Impact Labels</Label>
								<div className="space-y-2 mt-2">
									{form.impact_labels.map((label, index) => (
										<div key={index} className="flex items-center gap-2">
											<span className="w-8 text-sm text-slate-500">{index + 1}:</span>
											<Input
												value={label}
												onChange={(e) => updateImpactLabel(index, e.target.value)}
												placeholder={`Impact level ${index + 1}`}
											/>
										</div>
									))}
								</div>
							</div>

							{/* Risk Appetite Thresholds */}
							<div>
								<Label className="text-base font-medium">Risk Appetite Thresholds</Label>
								<div className="grid grid-cols-2 gap-4 mt-2">
									<div>
										<Label htmlFor="medium">Medium (≥)</Label>
										<Input
											id="medium"
											type="number"
											min="1"
											max="25"
											value={form.risk_appetite.medium}
											onChange={(e) => updateAppetite('medium', e.target.value)}
										/>
									</div>
									<div>
										<Label htmlFor="medium_high">Medium-High (≥)</Label>
										<Input
											id="medium_high"
											type="number"
											min="1"
											max="25"
											value={form.risk_appetite.medium_high}
											onChange={(e) => updateAppetite('medium_high', e.target.value)}
										/>
									</div>
									<div>
										<Label htmlFor="high">High (≥)</Label>
										<Input
											id="high"
											type="number"
											min="1"
											max="25"
											value={form.risk_appetite.high}
											onChange={(e) => updateAppetite('high', e.target.value)}
										/>
									</div>
								</div>
								<p className="text-sm text-slate-500 mt-2">
									Scores below Medium threshold are considered Low risk.
								</p>
							</div>

							<Button type="submit" disabled={saving} className="w-full">
								{saving ? 'Saving...' : 'Save Configuration'}
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* Matrix Preview */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Grid3X3 className="h-5 w-5 text-slate-600" />
							Matrix Preview
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{/* Matrix Grid */}
							<div className="relative">
								{/* Impact axis label */}
								<div className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-slate-600">
									Impact
								</div>
								
								{/* Matrix */}
								<div className="ml-4">
									{/* Impact labels */}
									<div className="flex">
										<div className="w-20"></div>
										{form.impact_labels.map((label, index) => (
											<div key={index} className="w-16 text-xs text-center text-slate-600 mb-1">
												{index + 1}
											</div>
										))}
									</div>
									
									{/* Matrix rows */}
									{matrixPreview.map((row, rowIndex) => (
										<div key={rowIndex} className="flex items-center">
											<div className="w-20 text-xs text-right pr-2 text-slate-600">
												{form.likelihood_labels[5 - rowIndex - 1] || `L${5 - rowIndex}`}
											</div>
											{row.map((cell, colIndex) => (
												<div
													key={colIndex}
													className={`w-16 h-12 border-2 flex items-center justify-center text-xs font-medium ${getCellColor(cell.level)}`}
												>
													{cell.score}
												</div>
											))}
										</div>
									))}
									
									{/* Likelihood axis label */}
									<div className="text-center text-sm font-medium text-slate-600 mt-2">
										Likelihood
									</div>
								</div>
							</div>

							{/* Legend */}
							<div className="grid grid-cols-2 gap-2 text-xs">
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
									<span>Low (&lt; {form.risk_appetite.medium})</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
									<span>Medium ({form.risk_appetite.medium}-{form.risk_appetite.medium_high - 1})</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
									<span>Medium-High ({form.risk_appetite.medium_high}-{form.risk_appetite.high - 1})</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
									<span>High (≥ {form.risk_appetite.high})</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

function WorkflowManagement() {
	const [workflowQueue, setWorkflowQueue] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [selectedItem, setSelectedItem] = useState(null)
	const [actionComment, setActionComment] = useState('')
	const [processing, setProcessing] = useState(false)

	useEffect(() => {
		loadWorkflowQueue()
		const interval = setInterval(loadWorkflowQueue, 10000) // Refresh every 10 seconds
		return () => clearInterval(interval)
	}, [])

	async function loadWorkflowQueue() {
		try {
			const data = await apiGet('/admin/workflow/queue')
			setWorkflowQueue(data)
			if (loading) setLoading(false)
		} catch (e) {
			setError('Failed to load workflow queue')
			setLoading(false)
		}
	}

	async function handleWorkflowAction(itemId, action) {
		setProcessing(true)
		try {
			await apiPost(`/admin/workflow/${itemId}/${action}`, {
				comment: actionComment
			})
			await loadWorkflowQueue()
			setSelectedItem(null)
			setActionComment('')
		} catch (e) {
			setError(`Failed to ${action} workflow item`)
		} finally {
			setProcessing(false)
		}
	}

	function getStageColor(stage) {
		switch (stage) {
			case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200'
			case 'champion_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
			case 'owner_review': return 'bg-orange-100 text-orange-800 border-orange-200'
			case 'admin_review': return 'bg-purple-100 text-purple-800 border-purple-200'
			case 'approved': return 'bg-green-100 text-green-800 border-green-200'
			case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
			default: return 'bg-slate-100 text-slate-800 border-slate-200'
		}
	}

	function getEntityTypeIcon(entityType) {
		switch (entityType) {
			case 'risk': return <AlertCircle className="h-4 w-4" />
			case 'action': return <CheckCircle2 className="h-4 w-4" />
			case 'incident': return <XCircle className="h-4 w-4" />
			case 'department_change': return <Building2 className="h-4 w-4" />
			case 'user_request': return <Users className="h-4 w-4" />
			default: return <FileText className="h-4 w-4" />
		}
	}

	function formatEntityType(entityType) {
		return entityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
	}

	function formatStage(stage) {
		return stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
	}

	function getAgeInDays(createdAt) {
		const now = new Date()
		const created = new Date(createdAt)
		const diffTime = Math.abs(now - created)
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
		return diffDays
	}

	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p className="text-slate-600">Loading workflow queue...</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<div className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-red-600" />
						<span className="text-red-800">{error}</span>
					</div>
				</div>
			)}

			{/* Workflow Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5 text-blue-600" />
						Workflow Settings
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
							<h4 className="font-medium text-blue-900 mb-2">Default Workflow</h4>
							<div className="text-sm text-blue-800">
								<div className="flex items-center gap-2 mb-1">
									<ArrowRight className="h-4 w-4" />
									<span>Team Member → Risk Champion → Risk Owner → Admin</span>
								</div>
								<p className="text-blue-700">
									Standard approval flow for risks, incidents, and department changes.
								</p>
							</div>
						</div>
						
						<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
							<h4 className="font-medium text-amber-900 mb-2">Cross-Department Actions</h4>
							<div className="text-sm text-amber-800">
								<div className="flex items-center gap-2 mb-1">
									<ArrowRight className="h-4 w-4" />
									<span>Originator → Receiving Department Owner → Admin</span>
								</div>
								<p className="text-amber-700">
									Actions assigned to other departments bypass Champion review.
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Global Workflow Monitor */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Workflow className="h-5 w-5 text-slate-600" />
						Global Workflow Queue ({workflowQueue.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{workflowQueue.length === 0 ? (
						<div className="text-center py-8">
							<CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
							<p className="text-slate-600">No pending workflow items</p>
						</div>
					) : (
						<div className="space-y-3">
							{workflowQueue.map(item => (
								<div key={item.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												{getEntityTypeIcon(item.entity_type)}
												<span className="font-medium text-slate-900">
													{formatEntityType(item.entity_type)} #{item.id}
												</span>
												<Badge className={getStageColor(item.current_stage)}>
													{formatStage(item.current_stage)}
												</Badge>
												<Badge variant="outline" className="text-xs">
													{getAgeInDays(item.created_at)} days old
												</Badge>
											</div>
											
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
												<div>
													<Label className="text-xs text-slate-500">Department:</Label>
													<div className="text-slate-700">{item.department_name || 'Global'}</div>
												</div>
												<div>
													<Label className="text-xs text-slate-500">Requested by:</Label>
													<div className="text-slate-700">{item.requester_name}</div>
												</div>
												<div>
													<Label className="text-xs text-slate-500">Assigned to:</Label>
													<div className="text-slate-700">{item.assignee_name || 'Unassigned'}</div>
												</div>
											</div>

											{item.comment && (
												<div className="mt-2 p-2 bg-white rounded border border-slate-200">
													<Label className="text-xs text-slate-500">Comment:</Label>
													<p className="text-sm text-slate-700">{item.comment}</p>
												</div>
											)}

											{item.payload_diff && (
												<div className="mt-2">
													<Label className="text-xs text-slate-500">Changes:</Label>
													<div className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 font-mono">
														{JSON.stringify(item.payload_diff, null, 2).substring(0, 200)}...
													</div>
												</div>
											)}
										</div>
										
										<div className="flex items-center gap-2 ml-4">
											<Button
												size="sm"
												variant="outline"
												onClick={() => setSelectedItem(item)}
											>
												<Eye className="h-4 w-4 mr-1" />
												Actions
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Action Dialog */}
			{selectedItem && (
				<Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								{getEntityTypeIcon(selectedItem.entity_type)}
								{formatEntityType(selectedItem.entity_type)} #{selectedItem.id} Actions
							</DialogTitle>
						</DialogHeader>
						
						<div className="space-y-4">
							<div className="p-4 bg-slate-50 rounded-lg">
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<Label className="text-xs text-slate-500">Current Stage:</Label>
										<Badge className={getStageColor(selectedItem.current_stage)}>
											{formatStage(selectedItem.current_stage)}
										</Badge>
									</div>
									<div>
										<Label className="text-xs text-slate-500">Age:</Label>
										<span className="text-slate-700">{getAgeInDays(selectedItem.created_at)} days</span>
									</div>
								</div>
							</div>

							<div>
								<Label htmlFor="actionComment">Comment (optional)</Label>
								<Textarea
									id="actionComment"
									value={actionComment}
									onChange={(e) => setActionComment(e.target.value)}
									placeholder="Add a comment about this action..."
									rows={3}
								/>
							</div>

							<div className="flex items-center gap-2">
								<Button
									onClick={() => handleWorkflowAction(selectedItem.id, 'approve')}
									disabled={processing}
									className="bg-green-600 hover:bg-green-700"
								>
									<CheckCircle2 className="h-4 w-4 mr-1" />
									Approve
								</Button>
								<Button
									onClick={() => handleWorkflowAction(selectedItem.id, 'reject')}
									disabled={processing}
									variant="outline"
									className="border-red-200 text-red-700 hover:bg-red-50"
								>
									<XCircle className="h-4 w-4 mr-1" />
									Reject
								</Button>
								<Button
									onClick={() => handleWorkflowAction(selectedItem.id, 'comment')}
									disabled={processing}
									variant="outline"
								>
									<MessageSquare className="h-4 w-4 mr-1" />
									Comment Only
								</Button>
								<Button
									onClick={() => setSelectedItem(null)}
									variant="outline"
								>
									Cancel
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	)
}
