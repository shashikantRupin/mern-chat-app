import { useEffect } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { useCallContext } from "../../context/CallContext";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import { useThemeContext } from "../../context/ThemeContext";
import {
	FiArrowLeft,
	FiPhone,
	FiVideo,
	FiSearch,
	FiMoreVertical,
	FiShield,
	FiZap,
} from "react-icons/fi";
import { BsChatDotsFill } from "react-icons/bs";
import toast from "react-hot-toast";

import { handleImageError } from "../../utils/avatar";

const MessageContainer = () => {
	const { selectedConversation, setSelectedConversation } = useConversation();
	const { onlineUsers } = useSocketContext();
	const { isDark } = useThemeContext();
	const { startCall } = useCallContext();

	const isOnline = selectedConversation && onlineUsers.includes(selectedConversation._id);

	useEffect(() => {
		// cleanup function when component unmounts
		return () => setSelectedConversation(null);
	}, [setSelectedConversation]);

	return (
		<div className='flex-1 flex flex-col h-full min-w-0 overflow-hidden'>
			{!selectedConversation ? (
				<NoChatSelected />
			) : (
				<>
					{/* Active Chat Header */}
					<div
						className={`flex items-center justify-between px-4 py-3 border-b transition-colors duration-200 shrink-0
							${
								isDark
									? "bg-slate-900/60 border-slate-800/80 text-white"
									: "bg-white/60 border-slate-200/80 text-slate-900"
							}`}
					>
						{/* Recipient details + mobile back button */}
						<div className='flex items-center gap-3 min-w-0'>
							{/* Mobile Back Button */}
							<button
								type='button'
								onClick={() => setSelectedConversation(null)}
								className={`p-2 rounded-xl border md:hidden transition-colors
									${
										isDark
											? "border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white"
											: "border-slate-200 bg-white text-slate-700 hover:text-slate-900"
									}`}
								title='Back to chats'
							>
								<FiArrowLeft className='w-4 h-4' />
							</button>

							{/* Recipient Avatar */}
							<div className='relative shrink-0'>
								<div className='w-10 h-10 rounded-full overflow-hidden border border-slate-700/50 bg-slate-800'>
									<img
										src={selectedConversation.profilePic}
										alt={selectedConversation.fullName}
										className='w-full h-full object-cover'
										onError={(e) => handleImageError(e, selectedConversation.fullName)}
									/>
								</div>
								{isOnline && (
									<span className='absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900'></span>
								)}
							</div>

							{/* Recipient Name & Status */}
							<div className='flex flex-col min-w-0'>
								<span className='text-sm sm:text-base font-bold truncate leading-tight'>
									{selectedConversation.fullName}
								</span>
								<span
									className={`text-[11px] font-medium flex items-center gap-1 mt-0.5
										${isOnline ? "text-emerald-500 dark:text-emerald-400" : "text-slate-400"}`}
								>
									<span
										className={`w-1.5 h-1.5 rounded-full ${
											isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
										}`}
									></span>
									{isOnline ? "Online now" : "Offline"}
								</span>
							</div>
						</div>

						{/* Action Buttons Toolbar */}
						<div className='flex items-center gap-1 sm:gap-1.5 text-slate-400'>
							<button
								type='button'
								onClick={() => startCall(selectedConversation, "audio")}
								className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95
									${isDark ? "hover:bg-slate-800 hover:text-indigo-400" : "hover:bg-slate-100 hover:text-indigo-600"}`}
								title='Voice Call'
								aria-label='Start voice call'
							>
								<FiPhone className='w-4 h-4' />
							</button>

							<button
								type='button'
								onClick={() => startCall(selectedConversation, "video")}
								className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95
									${isDark ? "hover:bg-slate-800 hover:text-indigo-400" : "hover:bg-slate-100 hover:text-indigo-600"}`}
								title='Video Call'
								aria-label='Start video call'
							>
								<FiVideo className='w-4 h-4' />
							</button>

							<button
								type='button'
								onClick={() => toast("Chat info: " + selectedConversation.email, { icon: "ℹ️" })}
								className={`p-2 rounded-xl transition-colors
									${isDark ? "hover:bg-slate-800 hover:text-indigo-400" : "hover:bg-slate-100 hover:text-indigo-600"}`}
								title='Chat Details'
								aria-label='View chat details'
							>
								<FiMoreVertical className='w-4 h-4' />
							</button>
						</div>
					</div>

					{/* Messages Body */}
					<Messages />

					{/* Message Input Dock */}
					<MessageInput />
				</>
			)}
		</div>
	);
};

export default MessageContainer;

const NoChatSelected = () => {
	const { authUser } = useAuthContext();
	const { isDark } = useThemeContext();

	return (
		<div className='flex flex-col items-center justify-center w-full h-full p-6 text-center animate-fade-in'>
			<div className='max-w-md w-full flex flex-col items-center'>
				{/* Glowing Icon */}
				<div className='relative mb-6'>
					<div className='w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30'>
						<BsChatDotsFill className='w-10 h-10' />
					</div>
					<div className='absolute -inset-2 bg-gradient-to-tr from-violet-600 to-cyan-400 rounded-3xl blur-xl opacity-40 -z-10 animate-pulse-slow'></div>
				</div>

				{/* Welcome greeting */}
				<h2 className='text-2xl sm:text-3xl font-extrabold tracking-tight mb-2'>
					Welcome,{" "}
					<span className='bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent'>
						{authUser?.fullName}
					</span>{" "}
					👋
				</h2>

				<p className={`text-sm sm:text-base mb-8 max-w-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
					Select a conversation from the sidebar to start instant real-time messaging.
				</p>

				{/* Feature Badges */}
				<div className='grid grid-cols-2 gap-3 w-full max-w-xs'>
					<div
						className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-medium
							${
								isDark
									? "bg-slate-800/40 border-slate-700/60 text-slate-300"
									: "bg-white/60 border-slate-200 text-slate-700 shadow-sm"
							}`}
					>
						<FiZap className='w-4 h-4 text-amber-400 shrink-0' />
						<span>Real-Time Socket.io</span>
					</div>

					<div
						className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-medium
							${
								isDark
									? "bg-slate-800/40 border-slate-700/60 text-slate-300"
									: "bg-white/60 border-slate-200 text-slate-700 shadow-sm"
							}`}
					>
						<FiShield className='w-4 h-4 text-emerald-400 shrink-0' />
						<span>Secure & Private</span>
					</div>
				</div>
			</div>
		</div>
	);
};
