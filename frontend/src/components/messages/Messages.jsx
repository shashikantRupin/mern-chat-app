import { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";
import { useThemeContext } from "../../context/ThemeContext";
import useConversation from "../../zustand/useConversation";
import { FiMessageSquare } from "react-icons/fi";

const Messages = () => {
	const { messages, loading } = useGetMessages();
	useListenMessages();
	const lastMessageRef = useRef();
	const { isDark } = useThemeContext();
	const { selectedConversation } = useConversation();

	useEffect(() => {
		const timeout = setTimeout(() => {
			lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
		return () => clearTimeout(timeout);
	}, [messages]);

	return (
		<div className='flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-2'>
			{!loading &&
				messages.length > 0 &&
				messages.map((message) => (
					<div key={message._id} ref={lastMessageRef}>
						<Message message={message} />
					</div>
				))}

			{loading && [...Array(4)].map((_, idx) => <MessageSkeleton key={idx} />)}

			{!loading && messages.length === 0 && (
				<div className='flex flex-col items-center justify-center h-full text-center py-12 text-slate-400'>
					<div
						className={`p-4 rounded-3xl mb-3 ${
							isDark ? "bg-slate-800/60 border border-slate-700/60" : "bg-slate-100 border border-slate-200"
						}`}
					>
						<FiMessageSquare className='w-8 h-8 text-indigo-400 opacity-80' />
					</div>
					<h3 className='text-base font-semibold text-slate-200 dark:text-slate-100'>
						Start the conversation!
					</h3>
					<p className='text-xs opacity-70 mt-1 max-w-xs'>
						Say hi to <span className='font-semibold text-indigo-400'>{selectedConversation?.fullName}</span> 👋
					</p>
				</div>
			)}
		</div>
	);
};

export default Messages;
