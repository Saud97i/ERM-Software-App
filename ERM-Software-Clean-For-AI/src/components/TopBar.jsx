import React, { useEffect, useState } from 'react'
import { Bell, LogOut, Users as UsersIcon, Settings } from 'lucide-react'
import { apiGet } from '@/lib/api.js'


export default function TopBar({ currentUser, onLogout, viewAsRole, onChangeViewAs, isAdminOriginal }) {
	const [counts, setCounts] = useState({ assigned: 0, originated: 0 })

	useEffect(() => {
		let mounted = true
		async function tick() {
			try {
				const c = await apiGet('/workflow/counts')
				if (mounted) setCounts(c)
			} catch {}
		}
		tick()
		const id = setInterval(tick, 5000)
		return () => { mounted = false; clearInterval(id) }
	}, [])

	const pendingTotal = counts.assigned || 0

	return (
		<>
			<div className="w-full flex items-center justify-between px-6 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 shadow-sm">
				<div className="flex items-center gap-3">
					<div className="text-lg font-bold text-slate-900">ERM Tool</div>
					<div className="text-sm text-slate-600">Enterprise Risk Management</div>
				</div>
				<div className="flex items-center gap-4">
					{/* Enhanced Inbox Button with Bell Icon */}
					<button 
						onClick={() => {
							window.dispatchEvent(new CustomEvent('openInbox'))
						}} 
						className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200 group"
					>
						<Bell className="w-5 h-5 text-slate-600 group-hover:text-slate-800" />
						<span className="hidden sm:inline text-slate-700 font-medium">Inbox</span>
						{pendingTotal > 0 ? (
							<span className="absolute -top-2 -right-2 text-xs px-2 py-1 rounded-full bg-red-500 text-white font-semibold shadow-lg animate-pulse">
								{pendingTotal}
							</span>
						) : null}
					</button>
					
					{/* Admin Users Button */}
					{currentUser?.role === 'Admin' ? (
						<button 
							onClick={() => {
								window.dispatchEvent(new CustomEvent('openUserManagement'))
							}} 
							className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
							title="User & Team Management"
						>
							<UsersIcon className="w-5 h-5 text-slate-600" />
							<span className="hidden sm:inline text-slate-700 font-medium">User Management</span>
						</button>
					) : null}
					
					{/* Control Center Button for Admin */}
					{currentUser?.role === 'Admin' ? (
						<button 
							onClick={() => {
								window.dispatchEvent(new CustomEvent('openControlCenter'))
							}}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
							title="Administration Control Center"
						>
							<Settings className="w-5 h-5 text-slate-600" />
							<span className="hidden sm:inline text-slate-700 font-medium">Control Center</span>
						</button>
					) : null}
					
					{/* Role Selector - Demo Mode Only */}
					{isAdminOriginal ? (
						<select 
							value={viewAsRole || currentUser?.role} 
							onChange={(e)=> onChangeViewAs?.(e.target.value)} 
							className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
							aria-label="Demo Mode: Switch Session"
							title="Demo Mode: Switch Session (No CRUD)"
						>
							<option value="Admin">Admin</option>
							<option value="Risk Champion">Risk Champion</option>
							<option value="Risk Owner">Risk Owner</option>
							<option value="Team Member">Team Member</option>
							<option value="Executive">Executive</option>
						</select>
					) : null}
					
					{/* User Info */}
					<div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
						<div className="text-sm text-slate-700 font-medium">
							{currentUser?.fullName || currentUser?.name || currentUser?.email}
						</div>
						<div className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">
							{viewAsRole || currentUser?.role}
						</div>
					</div>
					
					{/* Logout Button */}
					<button 
						onClick={onLogout} 
						className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200"
					>
						<LogOut className="w-5 h-5" />
						<span className="hidden sm:inline font-medium">Logout</span>
					</button>
				</div>
			</div>

		</>
	)
}
