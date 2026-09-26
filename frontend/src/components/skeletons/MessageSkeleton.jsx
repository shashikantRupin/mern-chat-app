import { useThemeContext } from "../../context/ThemeContext";

const MessageSkeleton = () => {
	const { isDark } = useThemeContext();

	return (
		<div className='space-y-4 px-2 py-4'>
			{/* Receiver skeleton */}
			<div className='flex gap-3 items-end'>
				<div
					className={`w-8 h-8 rounded-full shrink-0 animate-pulse ${
						isDark ? "bg-slate-800" : "bg-slate-200"
					}`}
				></div>
				<div className='flex flex-col gap-1.5'>
					<div
						className={`h-9 w-48 rounded-2xl rounded-bl-xs animate-pulse ${
							isDark ? "bg-slate-800" : "bg-slate-200"
						}`}
					></div>
					<div
						className={`h-2.5 w-12 rounded-full animate-pulse ${
							isDark ? "bg-slate-800/60" : "bg-slate-200/80"
						}`}
					></div>
				</div>
			</div>

			{/* Sender skeleton */}
			<div className='flex gap-3 items-end justify-end'>
				<div className='flex flex-col items-end gap-1.5'>
					<div
						className={`h-9 w-56 rounded-2xl rounded-br-xs animate-pulse ${
							isDark ? "bg-indigo-950/40 border border-indigo-900/30" : "bg-indigo-100"
						}`}
					></div>
					<div
						className={`h-2.5 w-14 rounded-full animate-pulse ${
							isDark ? "bg-slate-800/60" : "bg-slate-200/80"
						}`}
					></div>
				</div>
				<div
					className={`w-8 h-8 rounded-full shrink-0 animate-pulse ${
						isDark ? "bg-indigo-950/60" : "bg-indigo-200"
					}`}
				></div>
			</div>
		</div>
	);
};

export default MessageSkeleton;
