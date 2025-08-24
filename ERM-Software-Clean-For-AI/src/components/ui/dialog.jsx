import React, { useEffect, useRef, useState } from 'react'
export function Dialog({ open, onOpenChange, children }) {
	const [innerOpen, setInnerOpen] = useState(false)
	const isOpen = typeof open === 'boolean' ? open : innerOpen
	const setOpen = v => { if (onOpenChange) onOpenChange(v); else setInnerOpen(v) }
	return <div data-open={isOpen}>{React.Children.map(children, child => React.cloneElement(child, { open: isOpen, setOpen }))}</div>
}
export function DialogTrigger({ asChild, children, open, setOpen }) {
	const onClick = () => setOpen(true)
	return React.cloneElement(children, { onClick })
}
export function DialogContent({ children, open, setOpen, className = '' }) {
	const panelRef = useRef(null)
	useEffect(() => {
		if (!open) return
		const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
		window.addEventListener('keydown', onKey)
		// lock scroll
		const prevOverflow = document.documentElement.style.overflow
		document.documentElement.style.overflow = 'hidden'
		return () => { window.removeEventListener('keydown', onKey); document.documentElement.style.overflow = prevOverflow }
	}, [open, setOpen])
	// Basic focus trap
	useEffect(() => {
		if (!open) return
		const panel = panelRef.current
		if (!panel) return
		const selectors = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
		const nodes = Array.from(panel.querySelectorAll(selectors)).filter(el => !el.hasAttribute('disabled'))
		const first = nodes[0]
		const last = nodes[nodes.length - 1]
		first?.focus()
		const trap = (e) => {
			if (e.key !== 'Tab') return
			if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
			else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
		}
		panel.addEventListener('keydown', trap)
		return () => panel.removeEventListener('keydown', trap)
	}, [open])
	if (!open) return null
	return (
		<div className="fixed inset-0 z-50 overflow-hidden">
			<div className="absolute inset-0 bg-black/40 opacity-100 animate-[fadeIn_200ms_ease-out]" onClick={() => setOpen(false)} />
			<div className="absolute inset-0 flex items-start justify-center p-4 pt-8">
				<div
					ref={panelRef}
					role="dialog"
					aria-modal="true"
					className={"relative bg-white rounded-lg shadow-xl border border-slate-200 will-change-transform animate-[popIn_180ms_ease-out] max-h-[90vh] overflow-hidden "+className}
				>
					<button aria-label="Close dialog" type="button" className="absolute right-3 top-3 h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 z-10" onClick={() => setOpen(false)}>×</button>
					<div className="overflow-y-auto max-h-full">
						{children}
					</div>
				</div>
			</div>
		</div>
	)
}
export function DialogHeader({ children }) { return <div className="px-4 py-3 border-b border-slate-200">{children}</div> }
export function DialogTitle({ children }) { return <h3 className="font-semibold">{children}</h3> }