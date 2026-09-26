import { useThemeContext } from "../../context/ThemeContext";

const TypingIndicator = ({ recipientName = "User" }) => {
	const { isDark } = useThemeContext();

	return (
		<div className='flex items-center gap-2 px-4 py-2 my-1 animate-fade-in'>
			<div
				className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl rounded-tl-sm border shadow-sm
					${
						isDark
							? "bg-slate-800/90 border-slate-700/60 text-slate-300"
							: "bg-white/95 border-slate-200/80 text-slate-600"
					}`}
			>
				<span className='text-xs font-medium mr-1 text-slate-400'>{recipientName} is typing</span>
				<span className='w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce' style={{ animationDelay: "0ms" }}></span>
				<span className='w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce' style={{ animationDelay: "150ms" }}></span>
				<span className='w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce' style={{ animationDelay: "300ms" }}></span>
			</div>
		</div>
	);
};

export default TypingIndicator;
