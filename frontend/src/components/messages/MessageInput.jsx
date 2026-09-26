import { useState, useRef } from "react";
import { BsSend } from "react-icons/bs";
import { FiSmile, FiPaperclip, FiMic, FiX } from "react-icons/fi";
import useSendMessage from "../../hooks/useSendMessage";
import { useThemeContext } from "../../context/ThemeContext";
import toast from "react-hot-toast";

const EMOJI_LIST = [
	"😊", "😂", "❤️", "🔥", "👍", "🎉", "🚀", "✨",
	"💯", "🥳", "😎", "🤩", "😍", "🙌", "💬", "👋",
	"⭐", "🍕", "☕", "💻", "💪", "💡", "🎯", "👏"
];

const MessageInput = () => {
	const [message, setMessage] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [attachmentName, setAttachmentName] = useState(null);

	const { loading, sendMessage } = useSendMessage();
	const { isDark } = useThemeContext();
	const fileInputRef = useRef(null);
	const inputRef = useRef(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!message.trim() && !attachmentName) return;

		const fullMessage = attachmentName
			? `📎 [Attachment: ${attachmentName}] ${message}`
			: message;

		await sendMessage(fullMessage);
		setMessage("");
		setAttachmentName(null);
		setShowEmojiPicker(false);
		inputRef.current?.focus();
	};

	const handleAddEmoji = (emoji) => {
		setMessage((prev) => prev + emoji);
		inputRef.current?.focus();
	};

	const handleFileSelect = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			setAttachmentName(file.name);
			toast.success(`Attached: ${file.name}`);
		}
	};

	return (
		<div className='relative px-3 sm:px-4 py-3'>
			{/* Emoji Picker Drawer */}
			{showEmojiPicker && (
				<div
					className={`absolute bottom-full left-4 mb-2 p-3 rounded-2xl border shadow-2xl backdrop-blur-xl z-30 animate-fade-in w-72 sm:w-80
						${
							isDark
								? "bg-slate-900/95 border-slate-700/80 text-white"
								: "bg-white/95 border-slate-200 text-slate-900"
						}`}
				>
					<div className='flex items-center justify-between pb-2 mb-2 border-b border-slate-700/30'>
						<span className='text-xs font-semibold text-slate-400'>Emojis</span>
						<button
							type='button'
							onClick={() => setShowEmojiPicker(false)}
							className='text-slate-400 hover:text-slate-200'
						>
							<FiX className='w-3.5 h-3.5' />
						</button>
					</div>
					<div className='grid grid-cols-8 gap-1.5 max-h-36 overflow-y-auto pr-1'>
						{EMOJI_LIST.map((emoji) => (
							<button
								key={emoji}
								type='button'
								onClick={() => handleAddEmoji(emoji)}
								className='text-lg p-1 hover:bg-indigo-500/20 rounded-lg hover:scale-120 transition-all text-center'
							>
								{emoji}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Attached File Preview Tag */}
			{attachmentName && (
				<div className='flex items-center gap-2 mb-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl w-fit text-xs text-indigo-400'>
					<FiPaperclip className='w-3.5 h-3.5' />
					<span className='font-medium truncate max-w-xs'>{attachmentName}</span>
					<button
						type='button'
						onClick={() => setAttachmentName(null)}
						className='hover:text-red-400 transition-colors'
					>
						<FiX className='w-3.5 h-3.5' />
					</button>
				</div>
			)}

			{/* Input Bar Dock */}
			<form onSubmit={handleSubmit} className='relative flex items-center gap-2'>
				<div
					className={`flex-1 flex items-center rounded-2xl border transition-all duration-200 px-2 py-1 shadow-sm
						${
							isDark
								? "bg-slate-800/80 border-slate-700/80 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 text-white"
								: "bg-white/90 border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 text-slate-900"
						}`}
				>
					{/* Emoji Toggle Button */}
					<button
						type='button'
						onClick={() => setShowEmojiPicker(!showEmojiPicker)}
						className={`p-2 rounded-xl transition-colors
							${
								showEmojiPicker
									? "text-indigo-400 bg-indigo-500/10"
									: "text-slate-400 hover:text-indigo-400 hover:bg-slate-700/20"
							}`}
						title='Insert emoji'
					>
						<FiSmile className='w-5 h-5' />
					</button>

					{/* File Attachment Trigger */}
					<button
						type='button'
						onClick={() => fileInputRef.current?.click()}
						className='p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-700/20 transition-colors'
						title='Attach file or image'
					>
						<FiPaperclip className='w-5 h-5' />
					</button>
					<input
						type='file'
						ref={fileInputRef}
						onChange={handleFileSelect}
						className='hidden'
					/>

					{/* Main Text Input */}
					<input
						ref={inputRef}
						type='text'
						className='flex-1 px-2 py-2 text-sm bg-transparent outline-none placeholder:text-slate-400'
						placeholder='Type a message...'
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>

					{/* Voice Recording Placeholder */}
					<button
						type='button'
						onClick={() => toast("Voice notes coming soon!", { icon: "🎙️" })}
						className='p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-700/20 transition-colors hidden sm:block'
						title='Voice message'
					>
						<FiMic className='w-5 h-5' />
					</button>
				</div>

				{/* Animated Send Button */}
				<button
					type='submit'
					disabled={loading || (!message.trim() && !attachmentName)}
					className='p-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shrink-0 border-none'
					title='Send message'
				>
					{loading ? (
						<div className='loading loading-spinner loading-xs'></div>
					) : (
						<BsSend className='w-4 h-4 translate-x-0.5' />
					)}
				</button>
			</form>
		</div>
	);
};

export default MessageInput;
