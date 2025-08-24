import React, { useEffect, useState, Suspense } from 'react'
import { apiGet, apiPost } from './lib/api.js'
import TopBar from './components/TopBar.jsx'
import LoginForm from './components/LoginForm.jsx'
import ControlCenter from './components/ControlCenter.jsx'
import InboxDrawer from './components/InboxDrawer.jsx'

const AppLazy = React.lazy(() => import('./App.jsx'))

export default function AuthGate() {
	const [me, setMe] = useState(null)
	const [loading, setLoading] = useState(true)
	const [email, setEmail] = useState('admin@company.com')
	const [password, setPassword] = useState('Admin123!')
	const [error, setError] = useState('')
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [showDashboard, setShowDashboard] = useState(false)
  const [viewAsRole, setViewAsRole] = useState(null)
  const [showControlCenter, setShowControlCenter] = useState(false)
  const [showInbox, setShowInbox] = useState(false)

	useEffect(() => {
		apiGet('/auth/me').then((u) => {
			setMe(u)
			setViewAsRole(u?.role || null)
			setShowDashboard(true)
			setLoading(false)
		}).catch(() => setLoading(false))
	}, [])

	// Listen for events to open components
	useEffect(() => {
		function handleOpenControlCenter() {
			setShowControlCenter(true)
		}
		
		function handleOpenInbox() {
			setShowInbox(true)
		}
		
		function handleCloseControlCenter() {
			setShowControlCenter(false)
		}
		
		window.addEventListener('openUserManagement', handleOpenControlCenter) // Keep old event name for compatibility
		window.addEventListener('openControlCenter', handleOpenControlCenter)
		window.addEventListener('openInbox', handleOpenInbox)
		window.addEventListener('closeControlCenter', handleCloseControlCenter)
		
		return () => {
			window.removeEventListener('openUserManagement', handleOpenControlCenter)
			window.removeEventListener('openControlCenter', handleOpenControlCenter)
			window.removeEventListener('openInbox', handleOpenInbox)
			window.removeEventListener('closeControlCenter', handleCloseControlCenter)
		}
	}, [])

	async function onLogin(e) {
		e.preventDefault()
		setError('')
		let u
		try {
			u = await apiPost('/auth/login', { email, password })
		} catch (err) {
			const message = String(err?.message || '')
			if (message.includes(': 401')) {
				setError('Invalid credentials')
			} else if (message.includes(': 400')) {
				setError('Missing credentials')
			} else {
				setError('Unable to reach server. Please ensure the backend is running.')
			}
			// Rethrow so the LoginForm does not show success overlay
			throw err
		}
		setIsTransitioning(true)
		await new Promise(resolve => setTimeout(resolve, 300))
		setMe(u)
		setShowDashboard(true)
		await new Promise(resolve => setTimeout(resolve, 100))
		setIsTransitioning(false)
	}

	async function onLogout() {
		try { await apiPost('/auth/logout', {}) } catch {}
		setMe(null)
	}

	if (loading) return <div className="p-8">Loading…</div>

	if (!me) {
		return (
			<div className={`transition-all duration-500 ease-out ${isTransitioning ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
				<LoginForm
					onSubmit={onLogin}
					error={error}
					loading={loading}
					email={email}
					setEmail={setEmail}
					password={password}
					setPassword={setPassword}
				/>
			</div>
		)
	}

	return (
		<div className={`transition-all duration-700 ease-out ${showDashboard ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
			<TopBar
				currentUser={{ ...me, role: viewAsRole || me.role }}
				onLogout={onLogout}
				viewAsRole={viewAsRole}
				onChangeViewAs={setViewAsRole}
				isAdminOriginal={me?.role === 'Admin'}
			/>
			<Suspense fallback={<div className="p-4">Loading…</div>}>
				<div className={`page-assemble`}>
					<AppLazy currentUser={{ ...me, role: viewAsRole || me.role }} />
				</div>
			</Suspense>
			
			{/* Control Center */}
			{showControlCenter && (
				<ControlCenter 
					currentUser={me} 
					onClose={() => setShowControlCenter(false)}
				/>
			)}
			
			{/* Inbox Drawer */}
			{showInbox && (
				<InboxDrawer
					open={showInbox}
					onClose={() => setShowInbox(false)}
					currentUser={me}
				/>
			)}
		</div>
	)
}


