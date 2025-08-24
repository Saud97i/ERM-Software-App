export function Badge({ variant = "secondary", className = "", children }) {
	const variants = {
		secondary: "bg-slate-100 text-slate-800",
		outline: "border border-slate-300 text-slate-800",
		success: "bg-emerald-100 text-emerald-800",
		warning: "bg-amber-100 text-amber-800",
		danger: "bg-rose-100 text-rose-800"
	};
	return <span className={["inline-flex items-center rounded-full px-2 py-1 text-xs", variants[variant] || variants.secondary, className].join(' ')}>{children}</span>
}