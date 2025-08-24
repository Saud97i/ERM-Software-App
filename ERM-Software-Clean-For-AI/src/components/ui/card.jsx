export function Card({ className = "", children }) { return <div className={"bg-white border border-slate-200 rounded-xl shadow-sm "+className}>{children}</div>; }
export function CardHeader({ className = "", children }) { return <div className={"px-4 py-3 border-b border-slate-200 flex items-center justify-between "+className}>{children}</div>; }
export function CardTitle({ className = "", children }) { return <h3 className={"text-slate-900 font-semibold "+className}>{children}</h3>; }
export function CardDescription({ className = "", children }) { return <p className={"text-sm text-slate-600 "+className}>{children}</p>; }
export function CardContent({ className = "", children }) { return <div className={"px-4 py-3 "+className}>{children}</div>; }
export function CardFooter({ className = "", children }) { return <div className={"px-4 py-3 border-t border-slate-200 flex items-center justify-end gap-2 "+className}>{children}</div>; }