import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";
import { useThemeContext } from "../../context/ThemeContext";
import { FiCopy, FiCheck, FiSmile } from "react-icons/fi";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import toast from "react-hot-toast";

import { handleImageError } from "../../utils/avatar";

const QUICK_REACTIONS = ["❤️", "👍", "😂", "🔥", "🎉", "🚀"];

const Message = ({ message }) => {
	const { authUser } = useAuthContext();
	const { selectedConversation } = useConversation();
	const { isDark } = useThemeContext();

	const [copied, setCopied] = useState(false);
	const [showReactions, setShowReactions] = useState(false);
	const [reactions, setReactions] = useState([]);

	const fromMe = message.senderId === authUser._id;
	const formattedTime = extractTime(message.createdAt);
	const profilePic = fromMe ? authUser.profilePic : selectedConversation?.profilePic;
	const senderName = fromMe ? authUser.fullName : selectedConversation?.fullName;
	const shakeClass = message.shouldShake ? "shake" : "";

	const handleCopy = (e) => {
		e.stopPropagation();
		navigator.clipboard.writeText(message.message);
		setCopied(true);
		toast.success("Message copied!");
		setTimeout(() => setCopied(false), 2000);
	};

	const handleToggleReaction = (emoji) => {
		setReactions((prev) =>
			prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]
		);
		setShowReactions(false);
	};

	return (
		<div
			className={`group relative flex items-end gap-2.5 my-3 px-1 transition-all
				${fromMe ? "flex-row-reverse" : "flex-row"}`}
		>
			{/* Avatar */}
			<div className='w-8 h-8 rounded-full overflow-hidden border border-slate-700/40 shrink-0 bg-slate-800 shadow-sm'>
				<img
					alt='Avatar'
					src={profilePic}
					className='w-full h-full object-cover'
					onError={(e) => handleImageError(e, senderName)}
				/>
			</div>

			{/* Bubble Container & Hover Toolbar */}
			<div className={`relative max-w-[80%] sm:max-w-[70%] flex flex-col ${fromMe ? "items-end" : "items-start"}`}>
				{/* Message Bubble */}
				<div
					className={`relative px-4 py-2.5 text-sm sm:text-base leading-relaxed break-words transition-all duration-200 shadow-sm
						${
							fromMe
								? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-2xl rounded-br-xs shadow-indigo-500/20"
								: isDark
								? "bg-slate-800/90 text-slate-100 border border-slate-700/70 rounded-2xl rounded-bl-xs shadow-black/20"
								: "bg-white text-slate-800 border border-slate-200/90 rounded-2xl rounded-bl-xs shadow-slate-200"
						} ${shakeClass}`}
				>
					{message.message}

					{/* Reaction Chips */}
					{reactions.length > 0 && (
						<div
							className={`absolute -bottom-2.5 ${fromMe ? "right-2" : "left-2"} flex gap-1 bg-slate-900/90 border border-slate-700 px-1.5 py-0.5 rounded-full text-xs shadow-md z-10`}
						>
							{reactions.map((r, idx) => (
								<span key={idx}>{r}</span>
							))}
						</div>
					)}
				</div>

				{/* Footer: Time + Read Receipts */}
				<div
					className={`flex items-center gap-1.5 mt-1 px-1 text-[11px] select-none
						${isDark ? "text-slate-400" : "text-slate-500"}`}
				>
					<span>{formattedTime}</span>
					{fromMe && (
						<IoCheckmarkDoneSharp className='w-3.5 h-3.5 text-sky-400' title='Delivered & Read' />
					)}
				</div>

				{/* Floating Action Bar on Hover */}
				<div
					className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 z-20
						${fromMe ? "-left-18 -top-3" : "-right-18 -top-3"}`}
				>
					<div
						className={`flex items-center gap-0.5 p-1 rounded-xl border shadow-lg backdrop-blur-md
							${
								isDark
									? "bg-slate-800/95 border-slate-700 text-slate-300"
									: "bg-white/95 border-slate-200 text-slate-600"
							}`}
					>
						{/* Copy Button */}
						<button
							type='button'
							onClick={handleCopy}
							title='Copy message'
							className='p-1 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors'
						>
							{copied ? <FiCheck className='w-3.5 h-3.5 text-emerald-400' /> : <FiCopy className='w-3.5 h-3.5' />}
						</button>

						{/* Reaction Bar Toggle */}
						<div className='relative'>
							<button
								type='button'
								onClick={() => setShowReactions(!showReactions)}
								title='Add reaction'
								className='p-1 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors'
							>
								<FiSmile className='w-3.5 h-3.5' />
							</button>

							{/* Reaction Popover */}
							{showReactions && (
								<div
									className={`absolute bottom-full mb-1 ${fromMe ? "right-0" : "left-0"} flex gap-1 p-1.5 rounded-2xl border shadow-xl backdrop-blur-lg z-30 animate-fade-in
										${
											isDark
												? "bg-slate-900/95 border-slate-700 text-white"
												: "bg-white/95 border-slate-200 text-slate-900"
										}`}
								>
									{QUICK_REACTIONS.map((emoji) => (
										<button
											key={emoji}
											type='button'
											onClick={() => handleToggleReaction(emoji)}
											className='hover:scale-130 transition-transform p-1 text-sm'
										>
											{emoji}
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Message;
