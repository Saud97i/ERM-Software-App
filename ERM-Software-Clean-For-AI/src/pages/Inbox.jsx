import React, { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../lib/api.js'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { Textarea } from '../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { 
	CheckCircle2, 
	XCircle, 
	MessageSquare, 
	Clock, 
	User, 
	Building2, 
	FileText,
	AlertCircle,
	CheckCircle,
	XCircle as XCircleIcon,
	MessageCircle,
	Calendar,
	ArrowRight
} from 'lucide-react'

export default function Inbox() {
	const [tab, setTab] = useState('assigned')
	const [assigned, setAssigned] = useState([])
	const [originated, setOriginated] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [optimistic, setOptimistic] = useState(new Set())
	const [commentDialog, setCommentDialog] = useState({ open: false, item: null, action: '' })
	const [comment, setComment] = useState('')

	async function load() {
		setLoading(true)
		try {
			const [a, o] = await Promise.all([
				apiGet('/workflow/inbox'),
				apiGet('/workflow/originated'),
			])
			setAssigned(a)
			setOriginated(o)
			setError('')
		} catch (e) {
			setError('Failed to load workflow items')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { load() }, [])

	async function transition(id, action, commentText = '') {
		const next = new Set(optimistic)
		next.add(id)
		setOptimistic(next)
		try {
			await apiPost(`/workflow/${id}/transition`, { action, comment: commentText })
			await load()
			setCommentDialog({ open: false, item: null, action: '' })
			setComment('')
		} catch (e) {
			console.error('Transition failed:', e)
		} finally {
			const n2 = new Set(next)
			n2.delete(id)
			setOptimistic(n2)
		}
	}

	function openActionDialog(item, action) {
		setCommentDialog({ open: true, item, action })
		setComment('')
	}

	function getStateIcon(state) {
		switch (state) {
			case 'submitted': return <Clock className="h-4 w-4 text-blue-500" />
			case 'owner_review': return <User className="h-4 w-4 text-amber-500" />
			case 'admin_review': return <CheckCircle className="h-4 w-4 text-purple-500" />
			case 'approved': return <CheckCircle2 className="h-4 w-4 text-green-500" />
			case 'rejected': return <XCircleIcon className="h-4 w-4 text-red-500" />
			default: return <AlertCircle className="h-4 w-4 text-slate-500" />
		}
	}

	function getStateColor(state) {
		switch (state) {
			case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200'
			case 'owner_review': return 'bg-amber-100 text-amber-800 border-amber-200'
			case 'admin_review': return 'bg-purple-100 text-purple-800 border-purple-200'
			case 'approved': return 'bg-green-100 text-green-800 border-green-200'
			case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
			default: return 'bg-slate-100 text-slate-800 border-slate-200'
		}
	}

	function getEntityIcon(entityType) {
		switch (entityType) {
			case 'risk': return <AlertCircle className="h-4 w-4" />
			case 'action': return <CheckCircle className="h-4 w-4" />
			case 'dept_knowledge': return <FileText className="h-4 w-4" />
			default: return <FileText className="h-4 w-4" />
		}
	}

	function formatDate(dateString) {
		if (!dateString) return '—'
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		})
	}

	if (loading) return (
		<div className="flex items-center justify-center p-12">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p className="text-slate-600">Loading workflow items...</p>
			</div>
		</div>
	)
	
	if (error) return (
		<div className="p-8 text-center">
			<XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
			<h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load</h3>
			<p className="text-slate-600 mb-4">{error}</p>
			<Button onClick={load} variant="outline">Try Again</Button>
		</div>
	)

	const assignedCount = assigned.length
	const originatedCount = originated.length

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold text-slate-900">Workflow Inbox</h2>
					<p className="text-slate-600 mt-1">Manage your assigned tasks and track originated items</p>
				</div>
				<div className="flex items-center gap-4">
					<div className="text-right">
						<div className="text-2xl font-bold text-blue-600">{assignedCount}</div>
						<div className="text-sm text-slate-600">Pending</div>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold text-slate-600">{originatedCount}</div>
						<div className="text-sm text-slate-600">Originated</div>
					</div>
				</div>
			</div>

			{/* Enhanced Tabs */}
			<Tabs value={tab} onValueChange={setTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg">
					<TabsTrigger 
						value="assigned" 
						className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
					>
						<CheckCircle className="h-4 w-4" />
						Assigned to Me
						{assignedCount > 0 && (
							<Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
								{assignedCount}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger 
						value="originated" 
						className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
					>
						<ArrowRight className="h-4 w-4" />
						Originated by Me
						{originatedCount > 0 && (
							<Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-700">
								{originatedCount}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="assigned" className="space-y-4 mt-6">
					{assigned.length === 0 ? (
						<Card className="border-dashed border-2 border-slate-200">
							<CardContent className="text-center py-12">
								<CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-slate-900 mb-2">All Caught Up!</h3>
								<p className="text-slate-600">No pending items assigned to you</p>
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-4">
							{assigned.map((item) => (
								<Card key={item.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-200">
									<CardContent className="p-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-3 mb-3">
													{getEntityIcon(item.entity_type)}
													<div className="flex items-center gap-2">
														<Badge className="capitalize bg-blue-100 text-blue-800 border-blue-200">
															{item.entity_type.replace('_', ' ')}
														</Badge>
														<Badge className={getStateColor(item.state)}>
															{getStateIcon(item.state)}
															<span className="ml-1 capitalize">{item.state.replace('_', ' ')}</span>
														</Badge>
													</div>
												</div>
												
												<div className="space-y-2 mb-4">
													{item.payload_diff?.title && (
														<h4 className="font-semibold text-slate-900">{item.payload_diff.title}</h4>
													)}
													{item.payload_diff?.action && (
														<p className="text-slate-700">{item.payload_diff.action}</p>
													)}
													{item.comment && (
														<div className="bg-slate-50 p-3 rounded-lg">
															<p className="text-sm text-slate-700 italic">"{item.comment}"</p>
														</div>
													)}
												</div>

												<div className="flex items-center gap-4 text-sm text-slate-600">
													<div className="flex items-center gap-1">
														<Building2 className="h-4 w-4" />
														{item.department_name || 'Unknown Department'}
													</div>
													<div className="flex items-center gap-1">
														<User className="h-4 w-4" />
														{item.current_approver || '—'}
													</div>
													<div className="flex items-center gap-1">
														<Calendar className="h-4 w-4" />
														{formatDate(item.created_at)}
													</div>
													{item.comments_count > 0 && (
														<div className="flex items-center gap-1">
															<MessageCircle className="h-4 w-4" />
															{item.comments_count} comment{item.comments_count !== 1 ? 's' : ''}
														</div>
													)}
												</div>
											</div>

											<div className="flex items-center gap-2 ml-4">
												<Button
													size="sm"
													onClick={() => openActionDialog(item, 'approve')}
													disabled={optimistic.has(item.id)}
													className="bg-green-600 hover:bg-green-700 text-white"
												>
													<CheckCircle2 className="h-4 w-4 mr-1" />
													Approve
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => openActionDialog(item, 'reject')}
													disabled={optimistic.has(item.id)}
													className="border-red-200 text-red-700 hover:bg-red-50"
												>
													<XCircle className="h-4 w-4 mr-1" />
													Reject
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => openActionDialog(item, 'comment')}
													disabled={optimistic.has(item.id)}
												>
													<MessageSquare className="h-4 w-4 mr-1" />
													Comment
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="originated" className="space-y-4 mt-6">
					{originated.length === 0 ? (
						<Card className="border-dashed border-2 border-slate-200">
							<CardContent className="text-center py-12">
								<FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-slate-900 mb-2">No Originated Items</h3>
								<p className="text-slate-600">Items you've submitted will appear here</p>
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-4">
							{originated.map((item) => (
								<Card key={item.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-all duration-200">
									<CardContent className="p-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-3 mb-3">
													{getEntityIcon(item.entity_type)}
													<div className="flex items-center gap-2">
														<Badge className="capitalize bg-green-100 text-green-800 border-green-200">
															{item.entity_type.replace('_', ' ')}
														</Badge>
														<Badge className={getStateColor(item.state)}>
															{getStateIcon(item.state)}
															<span className="ml-1 capitalize">{item.state.replace('_', ' ')}</span>
														</Badge>
													</div>
												</div>
												
												<div className="space-y-2 mb-4">
													{item.payload_diff?.title && (
														<h4 className="font-semibold text-slate-900">{item.payload_diff.title}</h4>
													)}
													{item.payload_diff?.action && (
														<p className="text-slate-700">{item.payload_diff.action}</p>
													)}
													{item.comment && (
														<div className="bg-slate-50 p-3 rounded-lg">
															<p className="text-sm text-slate-700 italic">"{item.comment}"</p>
														</div>
													)}
												</div>

												<div className="flex items-center gap-4 text-sm text-slate-600">
													<div className="flex items-center gap-1">
														<Building2 className="h-4 w-4" />
														{item.department_name || 'Unknown Department'}
													</div>
													<div className="flex items-center gap-1">
														<User className="h-4 w-4" />
														{item.current_approver || '—'}
													</div>
													<div className="flex items-center gap-1">
														<Calendar className="h-4 w-4" />
														{formatDate(item.created_at)}
													</div>
													{item.comments_count > 0 && (
														<div className="flex items-center gap-1">
															<MessageCircle className="h-4 w-4" />
															{item.comments_count} comment{item.comments_count !== 1 ? 's' : ''}
														</div>
													)}
												</div>
											</div>

											<div className="ml-4">
												<Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
													View Only
												</Badge>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* Comment/Reject Dialog */}
			<Dialog open={commentDialog.open} onOpenChange={(open) => !open && setCommentDialog({ open: false, item: null, action: '' })}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							{commentDialog.action === 'approve' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
							{commentDialog.action === 'reject' && <XCircle className="h-5 w-5 text-red-600" />}
							{commentDialog.action === 'comment' && <MessageSquare className="h-5 w-5 text-blue-600" />}
							{commentDialog.action === 'approve' && 'Approve Item'}
							{commentDialog.action === 'reject' && 'Reject Item'}
							{commentDialog.action === 'comment' && 'Add Comment'}
						</DialogTitle>
					</DialogHeader>
					
					<div className="space-y-4">
						{commentDialog.item && (
							<div className="bg-slate-50 p-3 rounded-lg">
								<p className="text-sm text-slate-700">
									<strong>Item:</strong> {commentDialog.item.payload_diff?.title || commentDialog.item.payload_diff?.action || 'Unknown item'}
								</p>
							</div>
						)}
						
						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700">
								{commentDialog.action === 'reject' ? 'Rejection Note (Required):' : 'Comment:'}
							</label>
							<Textarea
								placeholder={commentDialog.action === 'reject' ? 'Please provide a reason for rejection...' : 'Add your comment...'}
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								className="min-h-[100px]"
								required={commentDialog.action === 'reject'}
							/>
						</div>
						
						<div className="flex items-center justify-end gap-3">
							<Button
								variant="outline"
								onClick={() => setCommentDialog({ open: false, item: null, action: '' })}
							>
								Cancel
							</Button>
							<Button
								onClick={() => {
									if (commentDialog.action === 'reject' && !comment.trim()) {
										return // Don't proceed without rejection note
									}
									transition(commentDialog.item.id, commentDialog.action, comment)
								}}
								disabled={commentDialog.action === 'reject' && !comment.trim()}
								className={
									commentDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
									commentDialog.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
									'bg-blue-600 hover:bg-blue-700'
								}
							>
								{commentDialog.action === 'approve' && 'Approve'}
								{commentDialog.action === 'reject' && 'Reject'}
								{commentDialog.action === 'comment' && 'Add Comment'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}


