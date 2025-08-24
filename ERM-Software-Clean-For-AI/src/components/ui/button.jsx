export function Button({ children, className = "", variant = "default", size = "md", loading = false, disabled, ...props }) {
	const base = "inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed";
	const variants = {
		default: "bg-slate-900 text-white border-slate-900 hover:bg-slate-800",
		secondary: "bg-slate-700 text-white border-slate-700 hover:bg-slate-600",
		outline: "bg-white text-slate-900 border-slate-300 hover:bg-slate-50",
		ghost: "bg-transparent text-slate-700 border-transparent hover:bg-slate-100",
		destructive: "bg-rose-600 text-white border-rose-600 hover:bg-rose-500"
	};
	const sizes = { sm: "h-8 px-3", md: "h-9 px-4", lg: "h-10 px-5", icon: "h-9 w-9 p-0" };

	const spinner = (
		<svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
		</svg>
	);

	return (
		<button
			className={[base, variants[variant] || variants.default, sizes[size] || sizes.md, className].join(" ")}
			disabled={disabled || loading}
			{...props}
		>
			{loading && spinner}
			{children}
		</button>
	);
}