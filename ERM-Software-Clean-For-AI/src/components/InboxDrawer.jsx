import React from 'react'
import Inbox from '../pages/Inbox.jsx'
import { X } from 'lucide-react'
import { Button } from './ui/button'

export default function InboxDrawer({ open, onClose }) {
	if (!open) return null

	return (
		<>
			{/* Backdrop */}
			<div 
				className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
				onClick={onClose}
			/>
			
			{/* Drawer */}
			<div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
					<div>
						<h2 className="text-2xl font-bold text-slate-900">Workflow Inbox</h2>
						<p className="text-slate-600 mt-1">Manage your tasks and approvals</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="h-10 w-10 p-0 hover:bg-slate-100"
					>
						<X className="h-5 w-5" />
					</Button>
				</div>
				
				{/* Content */}
				<div className="h-full overflow-y-auto">
					<Inbox />
				</div>
			</div>
		</>
	)
}
