import React from 'react'

function collectItems(nodes, acc = []) {
	React.Children.forEach(nodes, (child) => {
		if (!React.isValidElement(child)) return
		const typeName = child.type?.displayName || child.type?.name
		if (typeName === 'SelectItem') {
			acc.push({ value: child.props.value, label: child.props.children })
			return
		}
		if (child.props && child.props.children) {
			collectItems(child.props.children, acc)
		}
	})
	return acc
}

function findPlaceholder(nodes) {
	let ph = undefined
	React.Children.forEach(nodes, (child) => {
		if (!React.isValidElement(child)) return
		const typeName = child.type?.displayName || child.type?.name
		if (typeName === 'SelectValue' && child.props?.placeholder) {
			ph = child.props.placeholder
		}
		if (ph === undefined && child.props?.children) {
			const nested = findPlaceholder(child.props.children)
			if (nested !== undefined) ph = nested
		}
	})
	return ph
}

export function Select({ value, onValueChange, children, className = '' }){
	const items = collectItems(children)
	const placeholder = findPlaceholder(children)
	const hasValue = items.some(i => i.value === value)
	return (
		<select
			className={["border rounded px-2 py-1 w-full", className].join(' ')}
			value={hasValue ? value : ''}
			onChange={e => onValueChange && onValueChange(e.target.value)}
		>
			{placeholder !== undefined && <option value="" disabled>{placeholder}</option>}
			{items.map(it => (<option key={it.value} value={it.value}>{it.label}</option>))}
		</select>
	)
}
export function SelectTrigger({ children, className='' }){ return null }
SelectTrigger.displayName = 'SelectTrigger'
export function SelectValue({ placeholder }){ return null }
SelectValue.displayName = 'SelectValue'
export function SelectContent({ children }){ return null }
SelectContent.displayName = 'SelectContent'
export function SelectItem({ value, children }){ return null }
SelectItem.displayName = 'SelectItem'
