import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";
import { useThemeContext } from "../../context/ThemeContext";
import { handleImageError } from "../../utils/avatar";

const Conversation = ({ conversation, lastIdx, emoji }) => {
	const { selectedConversation, setSelectedConversation } = useConversation();
	const { onlineUsers } = useSocketContext();
	const { isDark } = useThemeContext();

	const isSelected = selectedConversation?._id === conversation._id;
	const isOnline = onlineUsers.includes(conversation._id);

	return (
		<>
			<div
				onClick={() => setSelectedConversation(conversation)}
				className={`group relative flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all duration-200
					${
						isSelected
							? isDark
								? "bg-gradient-to-r from-indigo-600/25 via-blue-600/20 to-cyan-500/10 border-l-4 border-indigo-500 text-white shadow-sm"
								: "bg-gradient-to-r from-indigo-50 to-blue-50/80 border-l-4 border-indigo-600 text-slate-900 shadow-sm"
							: isDark
							? "hover:bg-slate-800/60 text-slate-200 border-l-4 border-transparent"
							: "hover:bg-slate-100/80 text-slate-800 border-l-4 border-transparent"
					}`}
			>
				{/* Avatar with Online Pulse */}
				<div className='relative shrink-0'>
					<div className='w-11 h-11 rounded-full overflow-hidden border border-slate-700/40 shadow-sm bg-slate-800'>
						<img
							src={conversation.profilePic}
							alt={conversation.fullName}
							className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
							onError={(e) => handleImageError(e, conversation.fullName)}
						/>
					</div>
					{isOnline && (
						<span className='absolute bottom-0 right-0 flex h-3.5 w-3.5'>
							<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
							<span className='relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900'></span>
						</span>
					)}
				</div>

				{/* Conversation Info */}
				<div className='flex flex-col flex-1 min-w-0'>
					<div className='flex items-center justify-between gap-1'>
						<p
							className={`text-sm font-semibold truncate ${
								isSelected ? (isDark ? "text-white font-bold" : "text-indigo-950 font-bold") : ""
							}`}
						>
							{conversation.fullName}
						</p>
						<span className='text-xs opacity-70 shrink-0'>{emoji}</span>
					</div>

					<div className='flex items-center justify-between mt-0.5'>
						<p className={`text-xs truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
							{conversation.email || conversation.username || "Tap to chat"}
						</p>
						<span
							className={`text-[10px] font-medium px-1.5 py-0.2 rounded-full shrink-0
								${
									isOnline
										? "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10"
										: "text-slate-400 bg-slate-500/10"
								}`}
						>
							{isOnline ? "online" : "offline"}
						</span>
					</div>
				</div>
			</div>

			{!lastIdx && (
				<div
					className={`my-1 mx-2 h-px ${isDark ? "bg-slate-800/40" : "bg-slate-200/50"}`}
				/>
			)}
		</>
	);
};

export default Conversation;
